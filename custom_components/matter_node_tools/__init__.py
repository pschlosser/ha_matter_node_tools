"""Matter Node Tools integration for Home Assistant."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from aiohttp import web
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_RAW_LOG,
    CONF_SCAN_INTERVAL,
    CONF_WS_URL,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    EVENT_NODE_DUMP,
    PLATFORMS,
    SERVICE_DUMP_NODE,
    SERVICE_FIND_CLUSTER,
    SERVICE_GET_NODE,
    SERVICE_GET_NODES,
    SERVICE_INVOKE_COMMAND,
    SERVICE_READ_ATTRIBUTE,
    SERVICE_REFRESH_NODES,
    SERVICE_WRITE_ATTRIBUTE,
)
from .coordinator import MatterNodeCoordinator
from .matter_client import MatterClient, MatterClientError

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Matter Node Tools from a config entry."""
    ws_url: str = entry.data[CONF_WS_URL]
    scan_interval: int = entry.options.get(
        CONF_SCAN_INTERVAL,
        entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
    )
    raw_log: bool = entry.options.get(
        CONF_RAW_LOG,
        entry.data.get(CONF_RAW_LOG, False),
    )

    client = MatterClient(ws_url=ws_url, raw_log=raw_log)
    try:
        await client.connect()
    except MatterClientError as err:
        _LOGGER.error("Failed to connect to Matter Server: %s", err)
        return False

    coordinator = MatterNodeCoordinator(hass, client, scan_interval)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {
        "client": client,
        "coordinator": coordinator,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    _register_services(hass, entry)
    _register_websocket_api(hass)
    await _register_panel(hass)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unloaded:
        entry_data = hass.data[DOMAIN].pop(entry.entry_id, {})
        client: MatterClient | None = entry_data.get("client")
        if client is not None:
            await client.disconnect()

        # Remove services if no more entries
        if not hass.data[DOMAIN]:
            for service_name in [
                SERVICE_REFRESH_NODES,
                SERVICE_GET_NODES,
                SERVICE_GET_NODE,
                SERVICE_READ_ATTRIBUTE,
                SERVICE_WRITE_ATTRIBUTE,
                SERVICE_INVOKE_COMMAND,
                SERVICE_DUMP_NODE,
                SERVICE_FIND_CLUSTER,
            ]:
                if hass.services.has_service(DOMAIN, service_name):
                    hass.services.async_remove(DOMAIN, service_name)

    return unloaded


def _get_coordinator(hass: HomeAssistant) -> MatterNodeCoordinator:
    """Return the first available coordinator."""
    domain_data = hass.data.get(DOMAIN, {})
    for entry_data in domain_data.values():
        coordinator = entry_data.get("coordinator")
        if coordinator is not None:
            return coordinator
    raise ServiceValidationError("No Matter Node Tools instance configured")


def _get_client(hass: HomeAssistant) -> MatterClient:
    """Return the first available client."""
    domain_data = hass.data.get(DOMAIN, {})
    for entry_data in domain_data.values():
        client = entry_data.get("client")
        if client is not None:
            return client
    raise ServiceValidationError("No Matter Node Tools instance configured")


def _get_entry_data(hass: HomeAssistant) -> dict:
    """Return entry data dict for the first available integration entry."""
    domain_data = hass.data.get(DOMAIN, {})
    for entry_data in domain_data.values():
        if "client" in entry_data:
            return entry_data
    raise ServiceValidationError("No Matter Node Tools instance configured")


def _register_websocket_api(hass: HomeAssistant) -> None:
    """Register WebSocket API commands for the frontend panel."""
    # Guard: only register once
    if getattr(hass.data.get(DOMAIN, {}), "_ws_registered", False):
        return
    # Use a sentinel on the domain dict to avoid double-registration
    hass.data.setdefault(DOMAIN, {}).setdefault("_ws_registered", False)
    if hass.data[DOMAIN]["_ws_registered"]:
        return
    hass.data[DOMAIN]["_ws_registered"] = True

    @websocket_api.websocket_command({vol.Required("type"): "matter_node_tools/get_nodes"})
    @websocket_api.async_response
    async def ws_get_nodes(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict,
    ) -> None:
        """Return all nodes from the coordinator cache."""
        try:
            entry_data = _get_entry_data(hass)
            coordinator = entry_data["coordinator"]
            nodes = coordinator.data or []
            # Log sample attribute keys so frontend can adapt to the server's path format
            for node in nodes[:1]:
                attrs = node.get("attributes", {})
                sample_keys = list(attrs.keys())[:10]
                _LOGGER.info("matter_node_tools node %s sample attribute keys: %s", node.get("node_id"), sample_keys)
            connection.send_result(msg["id"], {"nodes": nodes})
        except Exception as err:  # noqa: BLE001
            connection.send_error(msg["id"], "matter_error", str(err))

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "matter_node_tools/get_node",
            vol.Required("node_id"): int,
        }
    )
    @websocket_api.async_response
    async def ws_get_node(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict,
    ) -> None:
        """Return detailed data for a single node."""
        try:
            entry_data = _get_entry_data(hass)
            client: MatterClient = entry_data["client"]
            node = await client.get_node(msg["node_id"])
            connection.send_result(msg["id"], {"node": node})
        except Exception as err:  # noqa: BLE001
            connection.send_error(msg["id"], "matter_error", str(err))

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "matter_node_tools/read_attribute",
            vol.Required("node_id"): int,
            vol.Required("endpoint_id"): int,
            vol.Required("cluster_id"): int,
            vol.Required("attribute_id"): int,
        }
    )
    @websocket_api.async_response
    async def ws_read_attribute(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict,
    ) -> None:
        """Read a single attribute and return the value."""
        try:
            entry_data = _get_entry_data(hass)
            client: MatterClient = entry_data["client"]
            path = f"{msg['endpoint_id']}/{msg['cluster_id']}/{msg['attribute_id']}"
            value = await client.read_attribute(msg["node_id"], path)
            connection.send_result(msg["id"], {"value": value})
        except Exception as err:  # noqa: BLE001
            connection.send_error(msg["id"], "matter_error", str(err))

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "matter_node_tools/write_attribute",
            vol.Required("node_id"): int,
            vol.Required("endpoint_id"): int,
            vol.Required("cluster_id"): int,
            vol.Required("attribute_id"): int,
            vol.Required("value"): vol.Any(str, int, float, bool, dict, list),
        }
    )
    @websocket_api.async_response
    async def ws_write_attribute(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict,
    ) -> None:
        """Write a value to an attribute."""
        try:
            entry_data = _get_entry_data(hass)
            client: MatterClient = entry_data["client"]
            path = f"{msg['endpoint_id']}/{msg['cluster_id']}/{msg['attribute_id']}"
            result = await client.write_attribute(msg["node_id"], path, msg["value"])
            connection.send_result(msg["id"], {"result": result})
        except Exception as err:  # noqa: BLE001
            connection.send_error(msg["id"], "matter_error", str(err))

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "matter_node_tools/invoke_command",
            vol.Required("node_id"): int,
            vol.Required("endpoint_id"): int,
            vol.Required("cluster_id"): int,
            vol.Required("command_name"): str,
            vol.Optional("payload"): dict,
        }
    )
    @websocket_api.async_response
    async def ws_invoke_command(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict,
    ) -> None:
        """Invoke a cluster command on a node endpoint."""
        try:
            entry_data = _get_entry_data(hass)
            client: MatterClient = entry_data["client"]
            result = await client.device_command(
                msg["node_id"],
                msg["endpoint_id"],
                msg["cluster_id"],
                msg["command_name"],
                msg.get("payload", {}),
            )
            connection.send_result(msg["id"], {"result": result})
        except Exception as err:  # noqa: BLE001
            connection.send_error(msg["id"], "matter_error", str(err))

    @websocket_api.websocket_command({vol.Required("type"): "matter_node_tools/get_ha_devices"})
    @websocket_api.async_response
    async def ws_get_ha_devices(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict,
    ) -> None:
        """Return HA device names for Matter nodes keyed by node_id."""
        from homeassistant.helpers import device_registry as dr, entity_registry as er

        dev_reg = dr.async_get(hass)
        ent_reg = er.async_get(hass)

        result = {}

        # Strategy: find Matter entities, extract node_id from unique_id,
        # then look up the device name.
        # HA Matter entity unique_ids contain the node_id, e.g.:
        #   "<fabric_id>-<node_id>-<endpoint>-<cluster>-<attribute>"
        # We find entities with platform="matter" and parse their unique_id.
        matter_entry_ids = {
            e.entry_id for e in hass.config_entries.async_entries("matter")
        }

        # Build device_id -> (name_by_user or name) mapping for matter devices
        matter_devices: dict[str, dict] = {}
        for device in dev_reg.devices.values():
            if device.config_entries & matter_entry_ids:
                matter_devices[device.id] = {
                    "name": device.name_by_user or device.name,
                    "manufacturer": device.manufacturer,
                    "model": device.model,
                    "identifiers": list(device.identifiers),
                }

        _LOGGER.info(
            "matter_node_tools: found %d matter devices in registry", len(matter_devices)
        )

        # Find matter entities and try to extract node_id from unique_id
        for entity in ent_reg.entities.values():
            if entity.config_entry_id not in matter_entry_ids:
                continue
            if entity.device_id not in matter_devices:
                continue
            uid = entity.unique_id or ""
            # unique_id format varies; split on "-" and try each segment as node_id
            # Common formats: "fabricid-nodeid-ep-cl-at" or "nodeid-ep-cl-at"
            parts = uid.split("-")
            for i, part in enumerate(parts):
                try:
                    node_id = int(part)
                    if node_id > 0 and node_id not in result:
                        dev = matter_devices[entity.device_id]
                        result[node_id] = {
                            "name": dev["name"] or f"Node {node_id}",
                            "manufacturer": dev["manufacturer"],
                            "model": dev["model"],
                        }
                        _LOGGER.info(
                            "matter_node_tools: mapped node_id=%d to device %r (uid=%s)",
                            node_id, dev["name"], uid,
                        )
                        break
                except (ValueError, TypeError):
                    continue

        _LOGGER.info(
            "matter_node_tools ws_get_ha_devices: returning %d node→name mappings", len(result)
        )
        connection.send_result(msg["id"], {"devices": result})

    websocket_api.async_register_command(hass, ws_get_nodes)
    websocket_api.async_register_command(hass, ws_get_node)
    websocket_api.async_register_command(hass, ws_read_attribute)
    websocket_api.async_register_command(hass, ws_write_attribute)
    websocket_api.async_register_command(hass, ws_invoke_command)
    websocket_api.async_register_command(hass, ws_get_ha_devices)


class MatterPanelJSView(HomeAssistantView):
    """Serve the Matter panel JS file."""

    url = "/matter_node_tools_static/matter-panel.js"
    name = "matter_node_tools:panel_js"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        js_path = Path(__file__).parent / "frontend" / "matter-panel.js"
        content = await hass_read_file(js_path)
        return web.Response(text=content, content_type="application/javascript")


async def hass_read_file(path: Path) -> str:
    """Read a file asynchronously."""
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, path.read_text, "utf-8")


class MatterPanelJSView(HomeAssistantView):
    """Serve the Matter panel JS file."""

    url = "/matter_node_tools_static/matter-panel.js"
    name = "matter_node_tools:panel_js"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        js_path = Path(__file__).parent / "frontend" / "matter-panel.js"
        content = await hass_read_file(js_path)
        return web.Response(text=content, content_type="application/javascript")


async def hass_read_file(path: Path) -> str:
    """Read a file asynchronously."""
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, path.read_text, "utf-8")


async def _register_panel(hass: HomeAssistant) -> None:
    """Register the Matter Node Explorer custom panel and serve its static assets."""
    if hass.data.get(DOMAIN, {}).get("_panel_registered"):
        return
    hass.data.setdefault(DOMAIN, {})["_panel_registered"] = True

    # Register the JS file view
    hass.http.register_view(MatterPanelJSView)

    # Load panel_custom component explicitly, then register the panel
    from homeassistant.components.panel_custom import async_register_panel  # noqa: PLC0415

    await async_register_panel(
        hass,
        webcomponent_name="matter-panel",
        frontend_url_path="matter_node_tools",
        sidebar_title="Matter Nodes",
        sidebar_icon="mdi:chip",
        js_url="/matter_node_tools_static/matter-panel.js",
        embed_iframe=False,
        require_admin=False,
    )
    _LOGGER.info("Matter Node Tools panel registered at /matter_node_tools")


def _register_services(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Register all integration services."""

    # Only register services once (first entry)
    if hass.services.has_service(DOMAIN, SERVICE_REFRESH_NODES):
        return

    async def handle_refresh_nodes(call: ServiceCall) -> None:
        """Handle the refresh_nodes service call."""
        coordinator = _get_coordinator(hass)
        await coordinator.async_refresh_nodes()

    hass.services.async_register(
        DOMAIN,
        SERVICE_REFRESH_NODES,
        handle_refresh_nodes,
        schema=vol.Schema({}),
    )

    async def handle_get_nodes(call: ServiceCall) -> ServiceResponse:
        """Handle the get_nodes service call."""
        client = _get_client(hass)
        try:
            nodes = await client.get_nodes()
        except MatterClientError as err:
            raise ServiceValidationError(str(err)) from err
        _LOGGER.info("Matter nodes: %s", json.dumps(nodes, indent=2, default=str))
        return {"nodes": nodes}

    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_NODES,
        handle_get_nodes,
        schema=vol.Schema({}),
        supports_response=SupportsResponse.OPTIONAL,
    )

    async def handle_get_node(call: ServiceCall) -> ServiceResponse:
        """Handle the get_node service call."""
        client = _get_client(hass)
        node_id: int = call.data["node_id"]
        try:
            node = await client.get_node(node_id)
        except MatterClientError as err:
            raise ServiceValidationError(str(err)) from err
        _LOGGER.info("Matter node %d: %s", node_id, json.dumps(node, indent=2, default=str))
        return {"node": node}

    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_NODE,
        handle_get_node,
        schema=vol.Schema({vol.Required("node_id"): vol.Coerce(int)}),
        supports_response=SupportsResponse.OPTIONAL,
    )

    async def handle_read_attribute(call: ServiceCall) -> ServiceResponse:
        """Handle the read_attribute service call."""
        client = _get_client(hass)
        node_id: int = call.data["node_id"]
        attribute_path: str | None = call.data.get("attribute_path")
        if attribute_path is None:
            endpoint_id: int = call.data["endpoint_id"]
            cluster_id: int = call.data["cluster_id"]
            attribute_id: int = call.data["attribute_id"]
            attribute_path = f"{endpoint_id}/{cluster_id}/{attribute_id}"
        try:
            result = await client.read_attribute(node_id, attribute_path)
        except MatterClientError as err:
            raise ServiceValidationError(str(err)) from err
        _LOGGER.info(
            "Read attribute %s on node %d: %s",
            attribute_path,
            node_id,
            result,
        )
        return {"value": result, "attribute_path": attribute_path, "node_id": node_id}

    hass.services.async_register(
        DOMAIN,
        SERVICE_READ_ATTRIBUTE,
        handle_read_attribute,
        schema=vol.Schema(
            {
                vol.Required("node_id"): vol.Coerce(int),
                vol.Optional("endpoint_id"): vol.Coerce(int),
                vol.Optional("cluster_id"): vol.Coerce(int),
                vol.Optional("attribute_id"): vol.Coerce(int),
                vol.Optional("attribute_path"): cv.string,
            }
        ),
        supports_response=SupportsResponse.OPTIONAL,
    )

    async def handle_write_attribute(call: ServiceCall) -> ServiceResponse:
        """Handle the write_attribute service call."""
        client = _get_client(hass)
        node_id: int = call.data["node_id"]
        value: Any = call.data["value"]
        attribute_path: str | None = call.data.get("attribute_path")
        if attribute_path is None:
            endpoint_id: int = call.data["endpoint_id"]
            cluster_id: int = call.data["cluster_id"]
            attribute_id: int = call.data["attribute_id"]
            attribute_path = f"{endpoint_id}/{cluster_id}/{attribute_id}"
        try:
            result = await client.write_attribute(node_id, attribute_path, value)
        except MatterClientError as err:
            raise ServiceValidationError(str(err)) from err
        _LOGGER.info(
            "Wrote attribute %s on node %d with value %s: result=%s",
            attribute_path,
            node_id,
            value,
            result,
        )
        return {"result": result, "attribute_path": attribute_path, "node_id": node_id}

    hass.services.async_register(
        DOMAIN,
        SERVICE_WRITE_ATTRIBUTE,
        handle_write_attribute,
        schema=vol.Schema(
            {
                vol.Required("node_id"): vol.Coerce(int),
                vol.Required("value"): vol.Any(str, int, float, bool, dict, list),
                vol.Optional("endpoint_id"): vol.Coerce(int),
                vol.Optional("cluster_id"): vol.Coerce(int),
                vol.Optional("attribute_id"): vol.Coerce(int),
                vol.Optional("attribute_path"): cv.string,
            }
        ),
        supports_response=SupportsResponse.OPTIONAL,
    )

    async def handle_invoke_command(call: ServiceCall) -> ServiceResponse:
        """Handle the invoke_command service call."""
        client = _get_client(hass)
        node_id: int = call.data["node_id"]
        endpoint_id: int = call.data["endpoint_id"]
        cluster_id: int = call.data["cluster_id"]
        command_name: str = call.data["command_name"]
        payload: dict = call.data.get("payload", {})
        try:
            result = await client.device_command(
                node_id, endpoint_id, cluster_id, command_name, payload
            )
        except MatterClientError as err:
            raise ServiceValidationError(str(err)) from err
        _LOGGER.info(
            "Invoked command %s on node %d ep %d cluster 0x%04X: result=%s",
            command_name,
            node_id,
            endpoint_id,
            cluster_id,
            result,
        )
        return {"result": result}

    hass.services.async_register(
        DOMAIN,
        SERVICE_INVOKE_COMMAND,
        handle_invoke_command,
        schema=vol.Schema(
            {
                vol.Required("node_id"): vol.Coerce(int),
                vol.Required("endpoint_id"): vol.Coerce(int),
                vol.Required("cluster_id"): vol.Coerce(int),
                vol.Required("command_name"): cv.string,
                vol.Optional("payload", default={}): dict,
                vol.Optional("command_id"): vol.Coerce(int),
            }
        ),
        supports_response=SupportsResponse.OPTIONAL,
    )

    async def handle_dump_node(call: ServiceCall) -> ServiceResponse:
        """Handle the dump_node service call."""
        client = _get_client(hass)
        node_id: int = call.data["node_id"]
        try:
            node = await client.get_node(node_id)
        except MatterClientError as err:
            raise ServiceValidationError(str(err)) from err
        _LOGGER.info(
            "Node dump for node %d:\n%s",
            node_id,
            json.dumps(node, indent=2, default=str),
        )
        hass.bus.async_fire(EVENT_NODE_DUMP, {"node_id": node_id, "node": node})
        return {"node": node}

    hass.services.async_register(
        DOMAIN,
        SERVICE_DUMP_NODE,
        handle_dump_node,
        schema=vol.Schema({vol.Required("node_id"): vol.Coerce(int)}),
        supports_response=SupportsResponse.OPTIONAL,
    )

    async def handle_find_cluster(call: ServiceCall) -> ServiceResponse:
        """Handle the find_cluster service call."""
        coordinator = _get_coordinator(hass)
        cluster_id: int = call.data["cluster_id"]
        vendor_name: str | None = call.data.get("vendor_name")
        product_name: str | None = call.data.get("product_name")

        matches: list[dict[str, Any]] = []
        nodes: list[dict[str, Any]] = coordinator.data or []
        for node in nodes:
            node_id = node.get("node_id")
            # Filter by vendor/product if specified
            if vendor_name is not None:
                node_vendor = node.get("attributes", {}).get(
                    "0/40/1", node.get("vendorName", "")
                )
                if vendor_name.lower() not in str(node_vendor).lower():
                    continue
            if product_name is not None:
                node_product = node.get("attributes", {}).get(
                    "0/40/3", node.get("productName", "")
                )
                if product_name.lower() not in str(node_product).lower():
                    continue

            # Search endpoints for the cluster
            endpoints = node.get("endpoints", node.get("attributes", {}))
            if isinstance(endpoints, dict):
                # attributes dict keyed by "ep/cluster/attr" paths
                for path_key in endpoints:
                    parts = str(path_key).split("/")
                    if len(parts) >= 2:
                        try:
                            ep_id = int(parts[0])
                            cl_id = int(parts[1])
                            if cl_id == cluster_id:
                                match_entry = {
                                    "node_id": node_id,
                                    "endpoint_id": ep_id,
                                    "cluster_id": cluster_id,
                                }
                                if match_entry not in matches:
                                    matches.append(match_entry)
                        except (ValueError, IndexError):
                            pass
            elif isinstance(endpoints, list):
                for endpoint in endpoints:
                    ep_id = endpoint.get("endpoint_id", endpoint.get("id"))
                    clusters = endpoint.get("clusters", [])
                    if isinstance(clusters, list):
                        for cluster in clusters:
                            cl_id = cluster.get("cluster_id", cluster.get("id"))
                            if cl_id == cluster_id:
                                matches.append(
                                    {
                                        "node_id": node_id,
                                        "endpoint_id": ep_id,
                                        "cluster_id": cluster_id,
                                    }
                                )
                    elif isinstance(clusters, dict):
                        if cluster_id in clusters:
                            matches.append(
                                {
                                    "node_id": node_id,
                                    "endpoint_id": ep_id,
                                    "cluster_id": cluster_id,
                                }
                            )

        _LOGGER.info(
            "find_cluster 0x%04X: found %d matches", cluster_id, len(matches)
        )
        return {"matches": matches, "cluster_id": cluster_id}

    hass.services.async_register(
        DOMAIN,
        SERVICE_FIND_CLUSTER,
        handle_find_cluster,
        schema=vol.Schema(
            {
                vol.Required("cluster_id"): vol.Coerce(int),
                vol.Optional("vendor_name"): cv.string,
                vol.Optional("product_name"): cv.string,
            }
        ),
        supports_response=SupportsResponse.OPTIONAL,
    )
