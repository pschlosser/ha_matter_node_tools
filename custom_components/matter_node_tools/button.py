"""Button platform for Matter Node Tools."""
from __future__ import annotations

import logging

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import MatterNodeCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Matter Node Tools buttons from a config entry."""
    coordinator: MatterNodeCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    async_add_entities([MatterRefreshButton(coordinator, entry)])


class MatterRefreshButton(CoordinatorEntity[MatterNodeCoordinator], ButtonEntity):
    """Button that triggers an immediate refresh of Matter node data."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:refresh"

    def __init__(
        self, coordinator: MatterNodeCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_refresh"
        self._attr_name = "Matter Refresh Nodes"
        self._entry = entry

    async def async_press(self) -> None:
        """Handle button press — trigger an immediate coordinator refresh."""
        _LOGGER.debug("Matter Refresh Nodes button pressed")
        await self.coordinator.async_refresh_nodes()
