"""Sensor platform for Matter Node Tools."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
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
    """Set up Matter Node Tools sensors from a config entry."""
    coordinator: MatterNodeCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    async_add_entities(
        [
            MatterNodeCountSensor(coordinator, entry),
            MatterLastUpdateSensor(coordinator, entry),
        ]
    )


class MatterNodeCountSensor(CoordinatorEntity[MatterNodeCoordinator], SensorEntity):
    """Sensor reporting the number of commissioned Matter nodes."""

    _attr_has_entity_name = True
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_icon = "mdi:chip"

    def __init__(
        self, coordinator: MatterNodeCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_node_count"
        self._attr_name = "Matter Node Count"
        self._entry = entry

    @property
    def native_value(self) -> int:
        """Return the number of known Matter nodes."""
        return self.coordinator.node_count

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        return {"entry_id": self._entry.entry_id}


class MatterLastUpdateSensor(CoordinatorEntity[MatterNodeCoordinator], SensorEntity):
    """Sensor reporting the last successful update time."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:clock-check"

    def __init__(
        self, coordinator: MatterNodeCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_last_update"
        self._attr_name = "Matter Last Update"
        self._entry = entry

    @property
    def native_value(self) -> str | None:
        """Return the last successful update timestamp as ISO string."""
        ts = self.coordinator.last_update_success
        if ts is None:
            return None
        if isinstance(ts, datetime):
            return ts.isoformat()
        return str(ts)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        return {
            "last_update_success": self.coordinator.last_update_success,
            "entry_id": self._entry.entry_id,
        }
