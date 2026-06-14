"""Data update coordinator for Matter Node Tools."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .matter_client import MatterClient, MatterClientError

_LOGGER = logging.getLogger(__name__)


class MatterNodeCoordinator(DataUpdateCoordinator[list[dict[str, Any]]]):
    """Coordinator that fetches node data from the Matter Server."""

    def __init__(
        self,
        hass: HomeAssistant,
        matter_client: MatterClient,
        scan_interval: int,
    ) -> None:
        """Initialize the coordinator."""
        self._matter_client = matter_client
        super().__init__(
            hass,
            _LOGGER,
            name="Matter Node Tools",
            update_interval=timedelta(seconds=scan_interval),
        )

    @property
    def node_count(self) -> int:
        """Return the number of known Matter nodes."""
        if self.data is None:
            return 0
        return len(self.data)

    @property
    def is_connected(self) -> bool:
        """Return True if the client is connected."""
        return self._matter_client.is_connected

    async def _async_update_data(self) -> list[dict[str, Any]]:
        """Fetch node list from the Matter Server."""
        try:
            nodes = await self._matter_client.get_nodes()
            _LOGGER.debug("Fetched %d Matter nodes", len(nodes))
            return nodes
        except MatterClientError as err:
            raise UpdateFailed(f"Error communicating with Matter Server: {err}") from err

    async def async_refresh_nodes(self) -> None:
        """Trigger an immediate refresh of node data."""
        await self.async_request_refresh()
