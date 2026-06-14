# Matter Node Tools

[![HACS Custom Repository](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)

A Home Assistant custom integration that exposes diagnostic and control tools for the [Matter Server](https://github.com/home-assistant-libs/python-matter-server) WebSocket API.  Install it via [HACS](https://hacs.xyz) as a custom repository.

---

## Features

- Connects to a local Matter Server via WebSocket
- **Sensors**: node count, last successful update timestamp
- **Binary sensor**: server connectivity status
- **Button**: one-click node refresh
- **8 HA services** for querying and controlling Matter nodes:
  - `refresh_nodes` — trigger an immediate data refresh
  - `get_nodes` — list all nodes
  - `get_node` — retrieve a single node by ID
  - `read_attribute` — read any cluster attribute
  - `write_attribute` — write any cluster attribute
  - `invoke_command` — invoke any cluster command
  - `dump_node` — pretty-print full node data + fire an HA event
  - `find_cluster` — find all node/endpoint pairs implementing a given cluster

---

## Installation via HACS

1. Open HACS → **Integrations** → ⋮ → **Custom repositories**
2. Add `https://github.com/pschlosser/ha_matter_node_tools` as type **Integration**
3. Search for **Matter Node Tools** and install
4. Restart Home Assistant
5. Go to **Settings → Devices & Services → Add Integration** and search for *Matter Node Tools*

---

## Configuration

| Field | Default | Description |
|---|---|---|
| WebSocket URL | `ws://homeassistant.local:5580/ws` | URL of the Matter Server WebSocket endpoint |
| Scan Interval | `60` | Seconds between automatic node list refreshes |
| Raw WebSocket logging | `false` | Log every raw WS message at DEBUG level |

---

## Services

### `matter_node_tools.refresh_nodes`

Trigger an immediate refresh.  No arguments.

### `matter_node_tools.get_nodes`

Returns the full node list from the Matter Server.

```yaml
action: matter_node_tools.get_nodes
```

### `matter_node_tools.get_node`

```yaml
action: matter_node_tools.get_node
data:
  node_id: 1
```

### `matter_node_tools.read_attribute`

```yaml
action: matter_node_tools.read_attribute
data:
  node_id: 1
  attribute_path: "0/6/0"   # endpoint/cluster/attribute
```

Or using individual IDs:

```yaml
action: matter_node_tools.read_attribute
data:
  node_id: 1
  endpoint_id: 0
  cluster_id: 6
  attribute_id: 0
```

### `matter_node_tools.write_attribute`

```yaml
action: matter_node_tools.write_attribute
data:
  node_id: 1
  attribute_path: "0/8/0"
  value: 128
```

### `matter_node_tools.invoke_command`

```yaml
action: matter_node_tools.invoke_command
data:
  node_id: 1
  endpoint_id: 1
  cluster_id: 6
  command_name: toggle
```

### `matter_node_tools.dump_node`

Retrieves the full node data, logs it, and fires the event `matter_node_tools_node_dump`.

```yaml
action: matter_node_tools.dump_node
data:
  node_id: 1
```

### `matter_node_tools.find_cluster`

Find all node/endpoint pairs that implement a given cluster:

```yaml
action: matter_node_tools.find_cluster
data:
  cluster_id: 6        # OnOff
  vendor_name: ACME    # optional filter
```

---

## Events

| Event | Description |
|---|---|
| `matter_node_tools_node_dump` | Fired by `dump_node` with the full node data |

---

## Development

```bash
# Run tests
pip install pytest pytest-asyncio aiohttp homeassistant
pytest tests/
```

---

## License

MIT
