"""Constants for the Matter Node Tools integration."""

DOMAIN = "matter_node_tools"

DEFAULT_WS_URL = "ws://homeassistant.local:5580/ws"
DEFAULT_SCAN_INTERVAL = 60

CONF_WS_URL = "ws_url"
CONF_SCAN_INTERVAL = "scan_interval"
CONF_RAW_LOG = "raw_log"

# Service names
SERVICE_REFRESH_NODES = "refresh_nodes"
SERVICE_GET_NODES = "get_nodes"
SERVICE_GET_NODE = "get_node"
SERVICE_READ_ATTRIBUTE = "read_attribute"
SERVICE_WRITE_ATTRIBUTE = "write_attribute"
SERVICE_INVOKE_COMMAND = "invoke_command"
SERVICE_DUMP_NODE = "dump_node"
SERVICE_FIND_CLUSTER = "find_cluster"

# Event names
EVENT_NODE_DUMP = "matter_node_tools_node_dump"

# Platforms
PLATFORMS = ["sensor", "button", "binary_sensor"]
