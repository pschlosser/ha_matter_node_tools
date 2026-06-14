"""Binary sensor platform for Matter Node Tools."""
from __future__ import annotations

import logging

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
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
    """Set up Matter Node Tools binary sensors from a config entry."""
    coordinator: MatterNodeCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    async_add_entities([MatterConnectedSensor(coordinator, entry)])


class MatterConnectedSensor(CoordinatorEntity[MatterNodeCoordinator], BinarySensorEntity):
    """Binary sensor indicating whether the Matter Server is connected."""

    _attr_has_entity_name = True
    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_icon = "mdi:lan-connect"

    def __init__(
        self, coordinator: MatterNodeCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_connected"
        self._attr_name = "Matter Server Connected"
        self._entry = entry

    @property
    def is_on(self) -> bool:
        """Return True if the Matter Server is connected and data is available."""
        return self.coordinator.is_connected and self.coordinator.data is not None
