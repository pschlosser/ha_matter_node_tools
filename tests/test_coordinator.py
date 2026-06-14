"""Unit tests for MatterNodeCoordinator."""
from __future__ import annotations

import sys
import os
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from custom_components.matter_node_tools.coordinator import MatterNodeCoordinator
from custom_components.matter_node_tools.matter_client import MatterClient, MatterClientError


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _make_hass() -> MagicMock:
    """Return a minimal mock Home Assistant instance."""
    hass = MagicMock()
    hass.loop = None
    # DataUpdateCoordinator uses hass.loop and hass.async_create_task
    hass.async_create_task = MagicMock(return_value=MagicMock())
    return hass


def _make_client(nodes: list[dict] | None = None) -> MatterClient:
    """Return a mock MatterClient."""
    client = MagicMock(spec=MatterClient)
    client.is_connected = True
    client.get_nodes = AsyncMock(return_value=nodes or [])
    return client


# ---------------------------------------------------------------------------
# Tests: node_count property
# ---------------------------------------------------------------------------

class TestNodeCount:
    """Tests for MatterNodeCoordinator.node_count."""

    def test_node_count_zero_when_no_data(self) -> None:
        """node_count returns 0 when data is None."""
        hass = _make_hass()
        client = _make_client()
        coordinator = MatterNodeCoordinator(hass, client, scan_interval=60)
        # data is None before first refresh
        assert coordinator.data is None
        assert coordinator.node_count == 0

    def test_node_count_reflects_data_length(self) -> None:
        """node_count returns the correct length of the nodes list."""
        hass = _make_hass()
        client = _make_client()
        coordinator = MatterNodeCoordinator(hass, client, scan_interval=60)
        # Manually set data to simulate a successful update
        coordinator.data = [
            {"node_id": 1},
            {"node_id": 2},
            {"node_id": 3},
        ]
        assert coordinator.node_count == 3

    def test_node_count_empty_list(self) -> None:
        """node_count returns 0 for an empty list."""
        hass = _make_hass()
        client = _make_client()
        coordinator = MatterNodeCoordinator(hass, client, scan_interval=60)
        coordinator.data = []
        assert coordinator.node_count == 0


# ---------------------------------------------------------------------------
# Tests: is_connected delegates to client
# ---------------------------------------------------------------------------

class TestIsConnected:
    """Tests for MatterNodeCoordinator.is_connected."""

    def test_is_connected_true_when_client_connected(self) -> None:
        """is_connected returns True when the client is connected."""
        hass = _make_hass()
        client = _make_client()
        client.is_connected = True
        coordinator = MatterNodeCoordinator(hass, client, scan_interval=60)
        assert coordinator.is_connected is True

    def test_is_connected_false_when_client_disconnected(self) -> None:
        """is_connected returns False when the client is disconnected."""
        hass = _make_hass()
        client = _make_client()
        client.is_connected = False
        coordinator = MatterNodeCoordinator(hass, client, scan_interval=60)
        assert coordinator.is_connected is False


# ---------------------------------------------------------------------------
# Tests: find_cluster logic (scanning coordinator.data)
# ---------------------------------------------------------------------------

class TestFindCluster:
    """Tests for the find_cluster logic that scans coordinator.data."""

    def _build_nodes_with_attribute_keys(self) -> list[dict[str, Any]]:
        """Build synthetic node data using attribute-path keys."""
        return [
            {
                "node_id": 1,
                "attributes": {
                    "0/6/0": True,      # OnOff cluster (0x0006)
                    "0/6/1": True,
                    "0/40/1": "ACME Corp",
                    "0/40/3": "Smart Plug",
                    "1/6/0": False,     # OnOff on ep1 too
                },
            },
            {
                "node_id": 2,
                "attributes": {
                    "0/0x0201/0": 2100,  # Thermostat cluster
                    "0/0x0201/17": 2000,
                },
            },
            {
                "node_id": 3,
                "attributes": {
                    "0/0x0402/0": 2350,  # TemperatureMeasurement
                },
            },
        ]

    def _find_cluster_in_data(
        self, nodes: list[dict[str, Any]], cluster_id: int
    ) -> list[dict[str, Any]]:
        """Replicate the find_cluster logic from __init__.py for testing."""
        matches: list[dict[str, Any]] = []
        for node in nodes:
            node_id = node.get("node_id")
            endpoints = node.get("endpoints", node.get("attributes", {}))
            if isinstance(endpoints, dict):
                for path_key in endpoints:
                    parts = str(path_key).split("/")
                    if len(parts) >= 2:
                        try:
                            ep_id = int(parts[0])
                            cl_id = int(parts[1], 0)  # support 0x… notation
                            if cl_id == cluster_id:
                                entry = {
                                    "node_id": node_id,
                                    "endpoint_id": ep_id,
                                    "cluster_id": cluster_id,
                                }
                                if entry not in matches:
                                    matches.append(entry)
                        except (ValueError, IndexError):
                            pass
        return matches

    def test_find_onoff_cluster_returns_two_endpoints(self) -> None:
        """OnOff cluster appears on two endpoints of node 1."""
        nodes = self._build_nodes_with_attribute_keys()
        # Remove node 2 and 3 which don't have OnOff
        onoff_nodes = [nodes[0]]
        matches = self._find_cluster_in_data(onoff_nodes, cluster_id=6)
        # ep 0 and ep 1 both have cluster 6
        assert len(matches) == 2
        endpoint_ids = {m["endpoint_id"] for m in matches}
        assert 0 in endpoint_ids
        assert 1 in endpoint_ids

    def test_find_cluster_not_present_returns_empty(self) -> None:
        """A cluster not present in any node returns an empty list."""
        nodes = self._build_nodes_with_attribute_keys()
        matches = self._find_cluster_in_data(nodes, cluster_id=0x9999)
        assert matches == []

    def test_find_cluster_only_on_specific_node(self) -> None:
        """Temperature cluster only found on node 3."""
        nodes = self._build_nodes_with_attribute_keys()
        matches = self._find_cluster_in_data(nodes, cluster_id=0x0402)
        assert len(matches) == 1
        assert matches[0]["node_id"] == 3

    def test_find_cluster_across_multiple_nodes(self) -> None:
        """When multiple nodes share a cluster, all are returned."""
        nodes = [
            {
                "node_id": 10,
                "attributes": {"0/6/0": True},
            },
            {
                "node_id": 11,
                "attributes": {"0/6/0": False},
            },
        ]
        matches = self._find_cluster_in_data(nodes, cluster_id=6)
        node_ids = {m["node_id"] for m in matches}
        assert node_ids == {10, 11}

    def test_no_duplicate_endpoint_entries(self) -> None:
        """Multiple attributes under the same cluster don't create duplicate entries."""
        nodes = self._build_nodes_with_attribute_keys()
        # Node 1, ep 0 has two OnOff attributes (0/6/0 and 0/6/1)
        matches = self._find_cluster_in_data([nodes[0]], cluster_id=6)
        # Should deduplicate: ep0 appears once, ep1 appears once
        ep0_matches = [m for m in matches if m["endpoint_id"] == 0]
        assert len(ep0_matches) == 1


# ---------------------------------------------------------------------------
# Tests: async_update_data
# ---------------------------------------------------------------------------

class TestAsyncUpdateData:
    """Tests for _async_update_data."""

    @pytest.mark.asyncio
    async def test_update_data_calls_get_nodes(self) -> None:
        """_async_update_data calls client.get_nodes and returns the result."""
        hass = _make_hass()
        sample_nodes = [{"node_id": 1}, {"node_id": 2}]
        client = _make_client(nodes=sample_nodes)
        coordinator = MatterNodeCoordinator(hass, client, scan_interval=60)

        result = await coordinator._async_update_data()

        client.get_nodes.assert_awaited_once()
        assert result == sample_nodes

    @pytest.mark.asyncio
    async def test_update_data_raises_update_failed_on_error(self) -> None:
        """_async_update_data wraps MatterClientError in UpdateFailed."""
        from homeassistant.helpers.update_coordinator import UpdateFailed

        hass = _make_hass()
        client = _make_client()
        client.get_nodes = AsyncMock(
            side_effect=MatterClientError("Connection lost")
        )
        coordinator = MatterNodeCoordinator(hass, client, scan_interval=60)

        with pytest.raises(UpdateFailed, match="Connection lost"):
            await coordinator._async_update_data()
