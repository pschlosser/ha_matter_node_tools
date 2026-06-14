"""Matter Server WebSocket client."""
from __future__ import annotations

import asyncio
import json
import logging
import uuid
from typing import Any

import aiohttp

_LOGGER = logging.getLogger(__name__)

RECONNECT_DELAY_MIN = 1.0
RECONNECT_DELAY_MAX = 60.0


class MatterClientError(Exception):
    """Raised when the Matter Server returns an error."""

    def __init__(self, message: str, error_code: Any = None) -> None:
        """Initialize the error."""
        super().__init__(message)
        self.error_code = error_code


class MatterClient:
    """Client for the Matter Server WebSocket API."""

    def __init__(self, ws_url: str, raw_log: bool = False) -> None:
        """Initialize the Matter client."""
        self._ws_url = ws_url
        self._raw_log = raw_log
        self._session: aiohttp.ClientSession | None = None
        self._ws: aiohttp.ClientWebSocketResponse | None = None
        self._pending: dict[str, asyncio.Future[Any]] = {}
        self._listen_task: asyncio.Task | None = None
        self._connected = False
        self._reconnect_delay = RECONNECT_DELAY_MIN

    @property
    def is_connected(self) -> bool:
        """Return True if connected to the Matter Server."""
        return self._connected and self._ws is not None and not self._ws.closed

    async def connect(self) -> None:
        """Connect to the Matter Server WebSocket."""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        await self._do_connect()

    async def _do_connect(self) -> None:
        """Perform the actual WebSocket connection."""
        _LOGGER.debug("Connecting to Matter Server at %s", self._ws_url)
        self._ws = await self._session.ws_connect(self._ws_url)
        self._connected = True
        self._reconnect_delay = RECONNECT_DELAY_MIN
        _LOGGER.info("Connected to Matter Server at %s", self._ws_url)
        loop = asyncio.get_event_loop()
        self._listen_task = loop.create_task(self._listen())

    async def disconnect(self) -> None:
        """Disconnect from the Matter Server."""
        self._connected = False
        if self._listen_task is not None:
            self._listen_task.cancel()
            try:
                await self._listen_task
            except asyncio.CancelledError:
                pass
            self._listen_task = None
        if self._ws is not None and not self._ws.closed:
            await self._ws.close()
            self._ws = None
        if self._session is not None and not self._session.closed:
            await self._session.close()
            self._session = None
        # Resolve pending futures with an error
        for fut in self._pending.values():
            if not fut.done():
                fut.set_exception(MatterClientError("Disconnected from Matter Server"))
        self._pending.clear()
        _LOGGER.info("Disconnected from Matter Server")

    async def _listen(self) -> None:
        """Background task that listens for incoming WebSocket messages."""
        try:
            async for msg in self._ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    if self._raw_log:
                        _LOGGER.debug("WS recv: %s", msg.data)
                    try:
                        data = json.loads(msg.data)
                    except json.JSONDecodeError:
                        _LOGGER.warning("Could not parse WS message: %s", msg.data)
                        continue
                    self._handle_message(data)
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    _LOGGER.error("WebSocket error: %s", self._ws.exception())
                    break
                elif msg.type in (aiohttp.WSMsgType.CLOSE, aiohttp.WSMsgType.CLOSED):
                    _LOGGER.info("WebSocket connection closed")
                    break
        except asyncio.CancelledError:
            return
        except Exception as err:
            _LOGGER.exception("Unexpected error in WebSocket listener: %s", err)
        finally:
            self._connected = False
            # Reject all pending futures
            for fut in self._pending.values():
                if not fut.done():
                    fut.set_exception(MatterClientError("WebSocket connection lost"))
            self._pending.clear()

    def _handle_message(self, data: dict[str, Any]) -> None:
        """Route an incoming message to the appropriate future or log as event."""
        message_id = data.get("message_id")
        if message_id and message_id in self._pending:
            fut = self._pending.pop(message_id)
            if not fut.done():
                error_code = data.get("error_code")
                if error_code:
                    fut.set_exception(
                        MatterClientError(
                            f"Matter Server error: {error_code}", error_code
                        )
                    )
                else:
                    fut.set_result(data.get("result"))
        elif "event" in data:
            _LOGGER.debug(
                "Matter Server event: %s data=%s", data["event"], data.get("data")
            )
        else:
            _LOGGER.debug("Unhandled Matter Server message: %s", data)

    async def send_command(
        self,
        command: str,
        args: dict[str, Any] | None = None,
        timeout: float = 10.0,
    ) -> Any:
        """Send a command to the Matter Server and wait for the response."""
        if not self.is_connected:
            raise MatterClientError("Not connected to Matter Server")

        message_id = str(uuid.uuid4())
        payload = {
            "message_id": message_id,
            "command": command,
            "args": args or {},
        }
        if self._raw_log:
            _LOGGER.debug("WS send: %s", payload)

        loop = asyncio.get_event_loop()
        fut: asyncio.Future[Any] = loop.create_future()
        self._pending[message_id] = fut

        try:
            await self._ws.send_str(json.dumps(payload))
            result = await asyncio.wait_for(fut, timeout=timeout)
            return result
        except asyncio.TimeoutError:
            self._pending.pop(message_id, None)
            if not fut.done():
                fut.cancel()
            raise MatterClientError(
                f"Timeout waiting for response to command '{command}'"
            )
        except Exception:
            self._pending.pop(message_id, None)
            raise

    async def get_nodes(self) -> list[dict[str, Any]]:
        """Return the list of all commissioned Matter nodes."""
        result = await self.send_command("get_nodes")
        if result is None:
            return []
        return result

    async def get_node(self, node_id: int) -> dict[str, Any]:
        """Return information for a single Matter node."""
        result = await self.send_command("get_node", {"node_id": node_id})
        return result

    async def read_attribute(self, node_id: int, attribute_path: str) -> Any:
        """Read a single attribute from a Matter node.

        attribute_path format: "endpoint_id/cluster_id/attribute_id"
        """
        result = await self.send_command(
            "read_attribute",
            {"node_id": node_id, "attribute_path": attribute_path},
        )
        return result

    async def write_attribute(
        self, node_id: int, attribute_path: str, value: Any
    ) -> Any:
        """Write a value to an attribute on a Matter node.

        attribute_path format: "endpoint_id/cluster_id/attribute_id"
        """
        result = await self.send_command(
            "write_attribute",
            {"node_id": node_id, "attribute_path": attribute_path, "value": value},
        )
        return result

    async def device_command(
        self,
        node_id: int,
        endpoint_id: int,
        cluster_id: int,
        command_name: str,
        payload: dict[str, Any] | None = None,
    ) -> Any:
        """Invoke a cluster command on a Matter node endpoint."""
        result = await self.send_command(
            "device_command",
            {
                "node_id": node_id,
                "endpoint_id": endpoint_id,
                "cluster_id": cluster_id,
                "command_name": command_name,
                "payload": payload or {},
            },
        )
        return result
