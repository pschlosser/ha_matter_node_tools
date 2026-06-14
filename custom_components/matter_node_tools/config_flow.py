"""Config flow for Matter Node Tools."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import (
    CONF_RAW_LOG,
    CONF_SCAN_INTERVAL,
    CONF_WS_URL,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_WS_URL,
    DOMAIN,
)
from .matter_client import MatterClient, MatterClientError

_LOGGER = logging.getLogger(__name__)

STEP_USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_WS_URL, default=DEFAULT_WS_URL): str,
        vol.Optional(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): vol.All(
            vol.Coerce(int), vol.Range(min=5, max=3600)
        ),
        vol.Optional(CONF_RAW_LOG, default=False): bool,
    }
)

OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): vol.All(
            vol.Coerce(int), vol.Range(min=5, max=3600)
        ),
        vol.Optional(CONF_RAW_LOG, default=False): bool,
    }
)


class MatterNodeToolsConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Matter Node Tools."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            ws_url = user_input[CONF_WS_URL]
            try:
                client = MatterClient(
                    ws_url=ws_url,
                    raw_log=user_input.get(CONF_RAW_LOG, False),
                )
                await client.connect()
                await client.get_nodes()
                await client.disconnect()
            except MatterClientError as err:
                _LOGGER.warning("Matter Server connection error: %s", err)
                errors["base"] = "cannot_connect"
            except Exception as err:  # noqa: BLE001
                _LOGGER.exception("Unexpected error connecting to Matter Server: %s", err)
                errors["base"] = "unknown"
            else:
                await self.async_set_unique_id(ws_url)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=f"Matter Server ({ws_url})",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_SCHEMA,
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> MatterNodeToolsOptionsFlow:
        """Return the options flow handler."""
        return MatterNodeToolsOptionsFlow(config_entry)


class MatterNodeToolsOptionsFlow(config_entries.OptionsFlow):
    """Handle options for Matter Node Tools."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize the options flow."""
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the options step."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = self._config_entry.options or self._config_entry.data
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_SCAN_INTERVAL,
                    default=current.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                ): vol.All(vol.Coerce(int), vol.Range(min=5, max=3600)),
                vol.Optional(
                    CONF_RAW_LOG,
                    default=current.get(CONF_RAW_LOG, False),
                ): bool,
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
