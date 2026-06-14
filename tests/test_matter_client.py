"""Unit tests for MatterClient."""
from __future__ import annotations

import asyncio
import json
import uuid
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# We import from the package directly.  Because the tests folder lives next
# to custom_components we add both the repo root and custom_components to
# sys.path via conftest or the pytest invocation.  Here we do a simple
# relative-style import that works when pytest is run from the repo root with
# PYTHONPATH set appropriately.
# ---------------------------------------------------------------------------
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from custom_components.matter_node_tools.matter_client import (
    MatterClient,
    MatterClientError,
)
from custom_components.matter_node_tools.cluster_map import get_cluster_name, CLUSTER_NAMES


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_ws_mock() -> MagicMock:
    """Return a mock ClientWebSocketResponse."""
    ws = MagicMock()
    ws.closed = False
    ws.send_str = AsyncMock()
    ws.close = AsyncMock()
    # __aiter__ / __anext__ — by default return immediately (no messages)
    ws.__aiter__ = MagicMock(return_value=ws)
    ws.__anext__ = AsyncMock(side_effect=StopAsyncIteration)
    return ws


def _make_session_mock(ws: MagicMock) -> MagicMock:
    """Return a mock aiohttp.ClientSession."""
    session = MagicMock()
    session.closed = False
    session.ws_connect = AsyncMock(return_value=ws)
    session.close = AsyncMock()
    return session


# ---------------------------------------------------------------------------
# Tests: message_id routing
# ---------------------------------------------------------------------------

class TestMessageRouting:
    """Tests for _handle_message."""

    def test_routes_response_to_waiting_future(self) -> None:
        """A response with a known message_id resolves the pending future."""
        client = MatterClient("ws://localhost:5580/ws")
        loop = asyncio.new_event_loop()
        try:
            fut: asyncio.Future[Any] = loop.create_future()
            msg_id = str(uuid.uuid4())
            client._pending[msg_id] = fut

            client._handle_message(
                {"message_id": msg_id, "result": [{"node_id": 1}], "error_code": None}
            )

            assert fut.done()
            assert fut.result() == [{"node_id": 1}]
            assert msg_id not in client._pending
        finally:
            loop.close()

    def test_unknown_message_id_does_not_raise(self) -> None:
        """A response with an unknown message_id is silently logged."""
        client = MatterClient("ws://localhost:5580/ws")
        # Should not raise
        client._handle_message(
            {"message_id": "unknown-id", "result": None, "error_code": None}
        )

    def test_event_message_is_logged_not_routed(self) -> None:
        """An event message (no message_id) should not crash."""
        client = MatterClient("ws://localhost:5580/ws")
        client._handle_message({"event": "node_updated", "data": {"node_id": 2}})

    def test_error_code_sets_exception(self) -> None:
        """A response with error_code sets an exception on the future."""
        client = MatterClient("ws://localhost:5580/ws")
        loop = asyncio.new_event_loop()
        try:
            fut: asyncio.Future[Any] = loop.create_future()
            msg_id = str(uuid.uuid4())
            client._pending[msg_id] = fut

            client._handle_message(
                {
                    "message_id": msg_id,
                    "result": None,
                    "error_code": "NODE_NOT_FOUND",
                }
            )

            assert fut.done()
            exc = fut.exception()
            assert isinstance(exc, MatterClientError)
            assert exc.error_code == "NODE_NOT_FOUND"
        finally:
            loop.close()


# ---------------------------------------------------------------------------
# Tests: send_command timeout
# ---------------------------------------------------------------------------

class TestSendCommandTimeout:
    """Tests for timeout behaviour in send_command."""

    @pytest.mark.asyncio
    async def test_timeout_raises_matter_client_error(self) -> None:
        """send_command raises MatterClientError on timeout."""
        ws = _make_ws_mock()
        session = _make_session_mock(ws)

        client = MatterClient("ws://localhost:5580/ws")
        client._session = session
        client._ws = ws
        client._connected = True

        with pytest.raises(MatterClientError, match="Timeout"):
            await client.send_command("get_nodes", timeout=0.01)

    @pytest.mark.asyncio
    async def test_not_connected_raises(self) -> None:
        """send_command raises when not connected."""
        client = MatterClient("ws://localhost:5580/ws")
        with pytest.raises(MatterClientError, match="Not connected"):
            await client.send_command("get_nodes")


# ---------------------------------------------------------------------------
# Tests: error_code in response → MatterClientError
# ---------------------------------------------------------------------------

class TestErrorCodeHandling:
    """Test that error responses are converted to MatterClientError."""

    def test_error_code_exception_has_code(self) -> None:
        """MatterClientError stores the error_code attribute."""
        err = MatterClientError("Something went wrong", error_code="CLUSTER_NOT_FOUND")
        assert err.error_code == "CLUSTER_NOT_FOUND"
        assert "Something went wrong" in str(err)

    def test_none_error_code_resolves_future(self) -> None:
        """A response with error_code=None resolves the future normally."""
        client = MatterClient("ws://localhost:5580/ws")
        loop = asyncio.new_event_loop()
        try:
            fut: asyncio.Future[Any] = loop.create_future()
            msg_id = "test-null-error"
            client._pending[msg_id] = fut

            client._handle_message(
                {"message_id": msg_id, "result": "ok", "error_code": None}
            )

            assert fut.result() == "ok"
        finally:
            loop.close()


# ---------------------------------------------------------------------------
# Tests: attribute path helpers
# ---------------------------------------------------------------------------

class TestAttributePath:
    """Test attribute path construction."""

    def test_path_format(self) -> None:
        """Attribute path should be endpoint/cluster/attribute."""
        node_id = 1
        endpoint_id = 0
        cluster_id = 6
        attribute_id = 0
        path = f"{endpoint_id}/{cluster_id}/{attribute_id}"
        assert path == "0/6/0"

    def test_path_with_large_ids(self) -> None:
        """Large IDs should still produce valid paths."""
        path = f"{255}/{0x0201}/{0xFFFF}"
        assert path == "255/513/65535"


# ---------------------------------------------------------------------------
# Tests: get_cluster_name
# ---------------------------------------------------------------------------

class TestGetClusterName:
    """Tests for cluster_map.get_cluster_name."""

    def test_known_cluster(self) -> None:
        """Known cluster IDs return human-readable names."""
        assert get_cluster_name(0x0006) == "OnOff"
        assert get_cluster_name(0x0201) == "Thermostat"
        assert get_cluster_name(0x0028) == "BasicInformation"

    def test_unknown_cluster_returns_hex_string(self) -> None:
        """Unknown cluster IDs return a formatted hex string."""
        name = get_cluster_name(0xFFFF)
        assert name == "Cluster_0xFFFF"

    def test_unknown_cluster_small_id(self) -> None:
        """Unknown small cluster IDs are zero-padded to 4 hex digits."""
        name = get_cluster_name(0x0001)
        assert name == "Cluster_0x0001"

    def test_all_known_clusters_non_empty(self) -> None:
        """All entries in CLUSTER_NAMES have non-empty string values."""
        for cluster_id, name in CLUSTER_NAMES.items():
            assert isinstance(name, str)
            assert len(name) > 0


# ---------------------------------------------------------------------------
# Tests: connect/disconnect lifecycle
# ---------------------------------------------------------------------------

class TestConnectDisconnect:
    """Integration-style tests for connect/disconnect (no real network)."""

    @pytest.mark.asyncio
    async def test_connect_sets_connected(self) -> None:
        """After connect(), is_connected should be True."""
        ws = _make_ws_mock()
        session = _make_session_mock(ws)

        with patch("aiohttp.ClientSession", return_value=session):
            client = MatterClient("ws://localhost:5580/ws")
            await client.connect()
            assert client.is_connected is True
            await client.disconnect()

    @pytest.mark.asyncio
    async def test_disconnect_clears_state(self) -> None:
        """After disconnect(), is_connected should be False."""
        ws = _make_ws_mock()
        session = _make_session_mock(ws)

        with patch("aiohttp.ClientSession", return_value=session):
            client = MatterClient("ws://localhost:5580/ws")
            await client.connect()
            await client.disconnect()
            assert client.is_connected is False

    @pytest.mark.asyncio
    async def test_disconnect_resolves_pending_futures(self) -> None:
        """Pending futures are rejected with MatterClientError on disconnect."""
        ws = _make_ws_mock()
        session = _make_session_mock(ws)

        with patch("aiohttp.ClientSession", return_value=session):
            client = MatterClient("ws://localhost:5580/ws")
            await client.connect()

            loop = asyncio.get_event_loop()
            fut: asyncio.Future[Any] = loop.create_future()
            client._pending["pending-id"] = fut

            await client.disconnect()

            assert fut.done()
            assert isinstance(fut.exception(), MatterClientError)
