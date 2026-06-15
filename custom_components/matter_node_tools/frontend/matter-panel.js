/**
 * Matter Node Explorer — custom panel for Home Assistant
 * Single-file vanilla JS Web Component, no build step required.
 */

const CLUSTER_NAMES = {
  0x0003: "Identify",
  0x0004: "Groups",
  0x0005: "Scenes",
  0x0006: "OnOff",
  0x0008: "LevelControl",
  0x000F: "BinaryInput",
  0x001D: "Descriptor",
  0x001E: "Binding",
  0x001F: "AccessControl",
  0x0025: "Actions",
  0x0028: "BasicInformation",
  0x0029: "OTASoftwareUpdateProvider",
  0x002A: "OTASoftwareUpdateRequestor",
  0x002B: "LocalizationConfiguration",
  0x002C: "TimeFormatLocalization",
  0x002D: "UnitLocalization",
  0x002E: "PowerSourceConfiguration",
  0x002F: "PowerSource",
  0x0030: "GeneralCommissioning",
  0x0031: "NetworkCommissioning",
  0x0032: "DiagnosticLogs",
  0x0033: "GeneralDiagnostics",
  0x0034: "SoftwareDiagnostics",
  0x0035: "ThreadNetworkDiagnostics",
  0x0036: "WiFiNetworkDiagnostics",
  0x0037: "EthernetNetworkDiagnostics",
  0x0038: "TimeSynchronization",
  0x0039: "BridgedDeviceBasicInformation",
  0x003B: "Switch",
  0x003C: "AdministratorCommissioning",
  0x003E: "OperationalCredentials",
  0x003F: "GroupKeyManagement",
  0x0040: "FixedLabel",
  0x0041: "UserLabel",
  0x0045: "BooleanState",
  0x0050: "ModeSelect",
  0x0059: "SmokeCOAlarm",
  0x005B: "AirQuality",
  0x005C: "CarbonMonoxideConcentration",
  0x005D: "CarbonDioxideConcentration",
  0x005E: "NitrogenDioxideConcentration",
  0x005F: "OzoneConcentration",
  0x0071: "HEPAFilterMonitoring",
  0x0072: "ActivatedCarbonFilterMonitoring",
  0x0080: "BooleanStateConfiguration",
  0x0081: "ValveConfigurationAndControl",
  0x0096: "ElectricalPowerMeasurement",
  0x0097: "ElectricalEnergyMeasurement",
  0x0101: "DoorLock",
  0x0102: "WindowCovering",
  0x0200: "PumpConfigurationAndControl",
  0x0201: "Thermostat",
  0x0202: "FanControl",
  0x0204: "ThermostatUserInterfaceConfiguration",
  0x0300: "ColorControl",
  0x0301: "BallastConfiguration",
  0x0400: "IlluminanceMeasurement",
  0x0402: "TemperatureMeasurement",
  0x0403: "PressureMeasurement",
  0x0404: "FlowMeasurement",
  0x0405: "RelativeHumidityMeasurement",
  0x0406: "OccupancySensing",
  0x040C: "CarbonMonoxideMeasurement",
  0x040D: "CarbonDioxideMeasurement",
  0x0413: "NitrogenDioxideMeasurement",
  0x0415: "OzoneMeasurement",
  0x042A: "PM2_5ConcentrationMeasurement",
  0x042B: "FormaldehydeConcentrationMeasurement",
  0x042C: "PM1ConcentrationMeasurement",
  0x042D: "PM10ConcentrationMeasurement",
  0x042E: "VOCConcentrationMeasurement",
  0x0500: "IasZone",
  0x0503: "IasWD",
  0x0702: "Metering",
  0x0B04: "ElectricalMeasurement",
};

const ATTR_NAMES = {
  // BasicInformation (0x0028)
  "0x0028/0x0000": "DataModelRevision",
  "0x0028/0x0001": "VendorName",
  "0x0028/0x0002": "VendorID",
  "0x0028/0x0003": "ProductName",
  "0x0028/0x0004": "ProductID",
  "0x0028/0x0005": "NodeLabel",
  "0x0028/0x0006": "Location",
  "0x0028/0x0007": "HardwareVersion",
  "0x0028/0x0008": "HardwareVersionString",
  "0x0028/0x0009": "SoftwareVersion",
  "0x0028/0x000A": "SoftwareVersionString",
  // OnOff (0x0006)
  "0x0006/0x0000": "OnOff",
  "0x0006/0x4000": "GlobalSceneControl",
  "0x0006/0x4001": "OnTime",
  "0x0006/0x4002": "OffWaitTime",
  "0x0006/0x4003": "StartUpOnOff",
  // LevelControl (0x0008)
  "0x0008/0x0000": "CurrentLevel",
  "0x0008/0x0001": "RemainingTime",
  "0x0008/0x0002": "MinLevel",
  "0x0008/0x0003": "MaxLevel",
  "0x0008/0x000F": "Options",
  "0x0008/0x4000": "StartUpCurrentLevel",
  // Descriptor (0x001D)
  "0x001D/0x0000": "DeviceTypeList",
  "0x001D/0x0001": "ServerList",
  "0x001D/0x0002": "ClientList",
  "0x001D/0x0003": "PartsList",
  // TemperatureMeasurement (0x0402)
  "0x0402/0x0000": "MeasuredValue",
  "0x0402/0x0001": "MinMeasuredValue",
  "0x0402/0x0002": "MaxMeasuredValue",
  "0x0402/0x0003": "Tolerance",
  // RelativeHumidityMeasurement (0x0405)
  "0x0405/0x0000": "MeasuredValue",
  "0x0405/0x0001": "MinMeasuredValue",
  "0x0405/0x0002": "MaxMeasuredValue",
  "0x0405/0x0003": "Tolerance",
  // BooleanState (0x0045)
  "0x0045/0x0000": "StateValue",
  // BooleanStateConfiguration (0x0080)
  "0x0080/0x0000": "CurrentSensitivityLevel",
  "0x0080/0x0001": "SupportedSensitivityLevels",
  "0x0080/0x0002": "DefaultSensitivityLevel",
  "0x0080/0x0003": "AlarmsActive",
  "0x0080/0x0004": "AlarmsSuppressed",
  "0x0080/0x0005": "AlarmsEnabled",
  "0x0080/0x0006": "AlarmsSupported",
  "0x0080/0x0007": "SensorFault",
};

const DEVICE_TYPE_NAMES = {
  0x0010: "Root Node",
  0x0011: "Power Source Node",
  0x0012: "OTA Requestor Node",
  0x0013: "OTA Provider Node",
  0x0014: "Aggregator",
  0x0015: "Generic Switch",
  0x0016: "On/Off Light Switch",
  0x0022: "Pump",
  0x0023: "Pump Controller",
  0x0024: "Pressure Sensor",
  0x0025: "Flow Sensor",
  0x0026: "Bulk Water Sensor",
  0x0027: "Rain Sensor",
  0x0028: "Water Freeze Detector",
  0x0029: "Water Leak Detector",
  0x002A: "Water Valve",
  0x0043: "On/Off Light",
  0x0044: "Dimmable Light",
  0x0045: "Color Temperature Light",
  0x0046: "Extended Color Light",
  0x0051: "On/Off Plug-in Unit",
  0x0052: "Dimmable Plug-in Unit",
  0x0053: "Color Temperature Plug-in Unit",
  0x0054: "Extended Color Plug-in Unit",
  0x0070: "Heating/Cooling Unit",
  0x0072: "Thermostat",
  0x0076: "Fan",
  0x0100: "Door Lock",
  0x0101: "Door Lock Controller",
  0x0202: "Window Covering",
  0x0203: "Window Covering Controller",
  0x0300: "Heating/Cooling Unit",
  0x0301: "Temperature Sensor",
  0x0302: "Pressure Sensor",
  0x0303: "Flow Sensor",
  0x0304: "Humidity Sensor",
  0x0305: "Light Sensor",
  0x0306: "Occupancy Sensor",
  0x0307: "Contact Sensor",
  0x0840: "Bridge Device",
  0x0850: "Generic Switch",
  0x8000: "Matter Bridge",
};

const POWER_STATUS = {0: "Unspecified", 1: "Active (Wired)", 2: "Active (Battery)", 3: "Active (Solar)"};
const BATTERY_CHARGE_LEVEL = {0: "✅ OK", 1: "⚠️ Warning", 2: "🔴 Critical"};
const BOOT_REASON = {0: "Unspecified", 1: "Power On", 2: "Brown-out", 3: "SW Watchdog Reset", 4: "HW Watchdog Reset", 5: "SW Update", 6: "Software Reset"};

function formatUptime(seconds) {
  if (!seconds) return "unknown";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return [d && `${d}d`, h && `${h}h`, `${m}m`].filter(Boolean).join(" ");
}

function clusterName(clusterId) {
  return CLUSTER_NAMES[clusterId] || `Cluster 0x${clusterId.toString(16).toUpperCase().padStart(4, "0")}`;
}

function attrName(clusterId, attrId) {
  const key = `0x${clusterId.toString(16).toUpperCase().padStart(4, "0")}/0x${attrId.toString(16).toUpperCase().padStart(4, "0")}`;
  return ATTR_NAMES[key] || null;
}

function hexId(id) {
  return `0x${id.toString(16).toUpperCase().padStart(4, "0")}`;
}

function safeStr(val) {
  if (val === null || val === undefined) return "null";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

/**
 * Parse the node data structure returned by the Matter Server.
 * Nodes may have attributes as a flat dict keyed "ep/cluster/attr"
 * or as a nested structure. This returns { endpointId -> { clusterId -> { attrId -> value } } }.
 */
function parseNodeAttributes(node) {
  const eps = {};
  const attrs = node.attributes || {};
  for (const [path, value] of Object.entries(attrs)) {
    const parts = path.split("/");
    if (parts.length < 3) continue;
    const [epStr, clStr, attrStr] = parts;
    const ep = parseInt(epStr, 10);
    const cl = parseInt(clStr, 10);
    const at = parseInt(attrStr, 10);
    if (isNaN(ep) || isNaN(cl) || isNaN(at)) continue;
    if (!eps[ep]) eps[ep] = {};
    if (!eps[ep][cl]) eps[ep][cl] = {};
    eps[ep][cl][at] = value;
  }
  return eps;
}

/**
 * Try to extract a human-readable name from node data.
 * Looks for ProductName (cluster 0x0028, attr 0x0003) on endpoint 0,
 * then NodeLabel (0x0028, 0x0005).
 */
function getNodeLabel(node) {
  const attrs = node.attributes || {};
  const productName = attrs["0/40/3"];
  if (productName) return String(productName);
  const nodeLabel = attrs["0/40/5"];
  if (nodeLabel) return String(nodeLabel);
  return null;
}

const STYLES = `
  :host {
    display: block;
    height: 100%;
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    color: var(--primary-text-color, #212121);
    background: var(--lovelace-background, var(--primary-background-color, #f5f5f5));
    box-sizing: border-box;
  }

  * { box-sizing: border-box; }

  .panel-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* ── Header ── */
  .header {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 56px;
    background: var(--app-header-background-color, var(--primary-color, #03a9f4));
    color: var(--app-header-text-color, #fff);
    flex-shrink: 0;
    gap: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,.3);
  }

  .header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    flex: 1;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4caf50;
    flex-shrink: 0;
    transition: background .3s;
  }
  .status-dot.disconnected { background: #f44336; }
  .status-dot.loading { background: #ff9800; }

  .status-label {
    font-size: 13px;
    opacity: .9;
  }

  button.refresh-btn {
    background: rgba(255,255,255,.15);
    color: inherit;
    border: 1px solid rgba(255,255,255,.4);
    border-radius: 4px;
    padding: 6px 14px;
    font-size: 13px;
    cursor: pointer;
    transition: background .2s;
  }
  button.refresh-btn:hover { background: rgba(255,255,255,.25); }
  button.refresh-btn:disabled { opacity: .5; cursor: default; }

  /* ── Main body ── */
  .body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* ── Left sidebar (node list) ── */
  .node-list {
    width: 220px;
    flex-shrink: 0;
    background: var(--card-background-color, #fff);
    border-right: 1px solid var(--divider-color, #e0e0e0);
    overflow-y: auto;
    padding: 8px 0;
  }

  .node-list-header {
    padding: 8px 16px 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--secondary-text-color, #757575);
  }

  .node-item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: background .15s, border-color .15s;
    gap: 8px;
    font-size: 14px;
  }
  .node-item:hover { background: var(--primary-color-light, rgba(3,169,244,.08)); }
  .node-item.selected {
    background: var(--primary-color-light, rgba(3,169,244,.12));
    border-left-color: var(--primary-color, #03a9f4);
    font-weight: 500;
  }

  .node-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--secondary-text-color, #bbb);
    flex-shrink: 0;
  }
  .node-item.selected .node-dot { background: var(--primary-color, #03a9f4); }

  .node-id-badge {
    font-size: 11px;
    color: var(--secondary-text-color, #757575);
    margin-left: auto;
  }

  .node-name { font-weight: 500; }
  .node-list-meta { font-size: 0.75em; color: var(--secondary-text-color, #757575); }

  /* ── Right detail pane ── */
  .detail-pane {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: var(--lovelace-background, var(--primary-background-color, #f5f5f5));
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--secondary-text-color, #757575);
    font-size: 16px;
  }

  .spinner {
    display: inline-block;
    width: 32px;
    height: 32px;
    border: 3px solid var(--divider-color, #e0e0e0);
    border-top-color: var(--primary-color, #03a9f4);
    border-radius: 50%;
    animation: spin .8s linear infinite;
    margin: 20px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .centered { text-align: center; }

  /* ── Node detail ── */
  .node-header {
    margin-bottom: 12px;
  }
  .node-header h2 {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 500;
  }
  .node-meta {
    font-size: 12px;
    color: var(--secondary-text-color, #757575);
  }

  /* ── Endpoint tabs ── */
  .ep-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    padding-bottom: 0;
  }
  .ep-tab {
    padding: 6px 14px;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    background: var(--card-background-color, #fff);
    color: var(--secondary-text-color, #757575);
    transition: background .15s, color .15s;
    position: relative;
    bottom: -1px;
  }
  .ep-tab:hover { background: var(--primary-color-light, rgba(3,169,244,.08)); }
  .ep-tab.active {
    background: var(--primary-color, #03a9f4);
    color: #fff;
    border-color: var(--primary-color, #03a9f4);
    font-weight: 500;
  }

  /* ── Cluster card ── */
  .cluster-card {
    background: var(--card-background-color, #fff);
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,.08);
  }

  .cluster-header {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    background: var(--table-row-background-color, rgba(0,0,0,.02));
    user-select: none;
    gap: 8px;
    transition: background .15s;
  }
  .cluster-header:hover { background: var(--primary-color-light, rgba(3,169,244,.06)); }

  .cluster-chevron {
    font-size: 12px;
    transition: transform .2s;
    color: var(--secondary-text-color, #757575);
  }
  .cluster-header.collapsed .cluster-chevron { transform: rotate(-90deg); }

  .cluster-name {
    font-weight: 500;
    font-size: 14px;
    flex: 1;
  }
  .cluster-id {
    font-size: 11px;
    color: var(--secondary-text-color, #757575);
    font-family: monospace;
  }

  .cluster-body {
    padding: 0;
  }
  .cluster-body.collapsed { display: none; }

  /* ── Attribute rows ── */
  .attr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .attr-table th {
    text-align: left;
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--secondary-text-color, #757575);
    background: var(--table-row-background-color, rgba(0,0,0,.02));
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  .attr-row {
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  .attr-row:last-child { border-bottom: none; }
  .attr-row td {
    padding: 8px 14px;
    vertical-align: middle;
  }

  .attr-name { font-weight: 500; }
  .attr-id { font-family: monospace; color: var(--secondary-text-color, #757575); font-size: 11px; }
  .attr-value {
    font-family: monospace;
    font-size: 12px;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .attr-value.loading { color: var(--secondary-text-color, #9e9e9e); font-style: italic; }
  .attr-value.error { color: #f44336; }

  .attr-actions {
    white-space: nowrap;
    text-align: right;
  }

  button.action-btn {
    font-size: 11px;
    padding: 3px 8px;
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 3px;
    cursor: pointer;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
    transition: background .15s;
  }
  button.action-btn:hover { background: var(--primary-color-light, rgba(3,169,244,.1)); }
  button.action-btn.primary {
    background: var(--primary-color, #03a9f4);
    color: #fff;
    border-color: var(--primary-color, #03a9f4);
  }
  button.action-btn.primary:hover { opacity: .85; }
  button.action-btn:disabled { opacity: .4; cursor: default; }

  .write-row td {
    padding: 4px 14px 8px;
    background: var(--table-row-background-color, rgba(0,0,0,.01));
  }
  .write-form {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .write-input {
    flex: 1;
    min-width: 60px;
    max-width: 180px;
    padding: 4px 8px;
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 3px;
    font-size: 12px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
  }

  /* ── Commands ── */
  .commands-section {
    padding: 10px 14px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
  }
  .commands-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--secondary-text-color, #757575);
    margin-bottom: 8px;
  }
  .command-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }
  .command-name {
    font-size: 13px;
    font-weight: 500;
    min-width: 120px;
  }
  .command-payload-input {
    flex: 1;
    min-width: 80px;
    max-width: 200px;
    padding: 4px 8px;
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 3px;
    font-size: 12px;
    font-family: monospace;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
  }
  .command-result {
    font-size: 11px;
    font-family: monospace;
    color: var(--secondary-text-color, #757575);
    word-break: break-all;
  }
  .command-form { display: flex; flex-direction: column; gap: 6px; margin: 4px 0 8px 0; }
  .command-field { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .command-field label { color: var(--primary-text-color); font-size: 0.85em; }
  .bitmap-checks { display: flex; gap: 12px; }
  .bitmap-checks label { display: flex; align-items: center; gap: 4px; cursor: pointer; }

  /* ── Error banner ── */
  .error-banner {
    background: #fde8e8;
    color: #c62828;
    border: 1px solid #ef9a9a;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 12px;
    font-size: 13px;
  }

  /* ── Endpoint 0 Info Cards ── */
  .ep0-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
  .info-card { background: var(--card-background-color, #fff); border-radius: 8px; padding: 12px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
  .info-card-title { font-size: 0.8em; font-weight: 600; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .info-row { display: flex; gap: 8px; padding: 3px 0; font-size: 0.9em; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: var(--secondary-text-color); width: 160px; flex-shrink: 0; }
  .info-value { color: var(--primary-text-color); word-break: break-all; }
  .device-type-badge { display: inline-block; background: var(--primary-color, #03a9f4); color: #fff; border-radius: 12px; padding: 2px 10px; font-size: 0.8em; margin: 2px; }
  .network-item { font-size: 0.9em; padding: 3px 0; }
  .uptime { font-variant-numeric: tabular-nums; }

  /* ── Global loading / empty states ── */
  .global-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    color: var(--secondary-text-color, #757575);
  }
`;

// Structured field schemas for known commands: "clusterId/commandName" -> field definitions
const COMMAND_SCHEMAS = {
  // BooleanStateConfiguration (0x0080)
  "128/EnableDisableAlarm": [
    { name: "alarmsToEnableDisable", type: "bitmap", bits: ["Visual", "Audible"], label: "Alarms" }
  ],
  "128/SuppressAlarm": [
    { name: "alarmsToSuppress", type: "bitmap", bits: ["Visual", "Audible"], label: "Alarms to suppress" }
  ],
  // OnOff (0x0006)
  "6/MoveToOnTime": [
    { name: "onTime", type: "number", label: "On Time (1/10s)", min: 0, max: 65535 }
  ],
  // LevelControl (0x0008)
  "8/MoveToLevel": [
    { name: "level", type: "number", label: "Level (0-254)", min: 0, max: 254 },
    { name: "transitionTime", type: "number", label: "Transition Time (1/10s)", min: 0, max: 65535, optional: true }
  ],
  "8/MoveToLevelWithOnOff": [
    { name: "level", type: "number", label: "Level (0-254)", min: 0, max: 254 },
    { name: "transitionTime", type: "number", label: "Transition Time (1/10s)", min: 0, max: 65535, optional: true }
  ],
  // DoorLock (0x0101)
  "257/LockDoor": [],
  "257/UnlockDoor": [],
  // WindowCovering (0x0102)
  "258/GoToLiftPercentage": [
    { name: "liftPercent100thsValue", type: "number", label: "Lift % (0-10000 = 0-100%)", min: 0, max: 10000 }
  ],
  // ColorControl (0x0300)
  "768/MoveToHueAndSaturation": [
    { name: "hue", type: "number", label: "Hue (0-254)", min: 0, max: 254 },
    { name: "saturation", type: "number", label: "Saturation (0-254)", min: 0, max: 254 },
    { name: "transitionTime", type: "number", label: "Transition Time (1/10s)", min: 0, max: 65535, optional: true }
  ],
  "768/MoveToColorTemperature": [
    { name: "colorTemperatureMireds", type: "number", label: "Color Temperature (Mireds)", min: 0, max: 65535 },
    { name: "transitionTime", type: "number", label: "Transition Time (1/10s)", min: 0, max: 65535, optional: true }
  ],
};

// Known commands per cluster (for display purposes)
const CLUSTER_COMMANDS = {
  0x0006: ["Toggle", "On", "Off", "OnWithRecallGlobalScene", "OnWithTimedOff", "OffWithEffect"],
  0x0008: ["MoveToLevel", "Move", "Step", "Stop", "MoveToLevelWithOnOff", "MoveWithOnOff", "StepWithOnOff", "StopWithOnOff"],
  0x0080: ["EnableDisableAlarm", "SuppressAlarm"],
  0x0101: ["LockDoor", "UnlockDoor", "UnlockWithTimeout", "GetLogRecord", "SetPINCode", "GetPINCode", "ClearPINCode", "ClearAllPINCodes"],
  0x0102: ["UpOrOpen", "DownOrClose", "StopMotion", "GoToLiftValue", "GoToLiftPercentage", "GoToTiltValue", "GoToTiltPercentage"],
  0x0201: ["SetpointRaiseLower", "SetWeeklySchedule", "GetWeeklySchedule", "ClearWeeklySchedule"],
  0x0300: ["MoveToHue", "MoveHue", "StepHue", "MoveToSaturation", "MoveSaturation", "StepSaturation", "MoveToHueAndSaturation", "MoveToColor", "MoveColor", "StepColor", "MoveToColorTemperature"],
};

class MatterPanel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._nodes = [];
    this._selectedNodeId = null;
    this._nodeCache = {};
    this._loaded = false;
    this._connected = true;
    this._loading = false;
    this._selectedEpId = null; // per-node selected endpoint
    this._nodeEpSelection = {}; // nodeId -> epId
    this._attrValues = {}; // "nodeId/ep/cl/attr" -> value
    this._haDevices = {}; // nodeId -> { name, manufacturer, model }
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded) {
      this._loaded = true;
      this._buildShell();
      this._loadNodes();
      this._loadHaDevices();
    }
  }

  // ── Build static DOM skeleton ──

  _buildShell() {
    const shadow = this.shadowRoot;
    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    const root = document.createElement("div");
    root.className = "panel-root";
    root.innerHTML = `
      <div class="header">
        <h1>Matter Node Tools</h1>
        <button class="refresh-btn" id="refresh-btn">Refresh</button>
        <div class="status-dot" id="status-dot"></div>
        <span class="status-label" id="status-label">Connected</span>
      </div>
      <div class="body">
        <div class="node-list" id="node-list">
          <div class="node-list-header">NODES</div>
          <div id="node-list-items"></div>
        </div>
        <div class="detail-pane" id="detail-pane">
          <div class="placeholder">Select a node from the left panel</div>
        </div>
      </div>
    `;
    shadow.appendChild(root);

    shadow.getElementById("refresh-btn").addEventListener("click", () => this._loadNodes());
  }

  // ── Connection status ──

  _setStatus(state) {
    // state: "connected" | "disconnected" | "loading"
    const dot = this.shadowRoot.getElementById("status-dot");
    const label = this.shadowRoot.getElementById("status-label");
    if (!dot) return;
    dot.className = "status-dot" + (state === "connected" ? "" : ` ${state}`);
    const labels = { connected: "Connected", disconnected: "Disconnected", loading: "Loading…" };
    label.textContent = labels[state] || state;
  }

  // ── Load HA device names ──

  async _loadHaDevices() {
    try {
      const resp = await this._hass.connection.sendMessagePromise({
        type: "matter_node_tools/get_ha_devices"
      });
      this._haDevices = resp.devices || {};
      console.debug("[MatterPanel] HA devices loaded:", this._haDevices);
      this._renderNodeList();
    } catch(e) {
      console.warn("[MatterPanel] Could not load HA devices:", e);
      this._haDevices = {};
    }
  }

  // ── Load node list ──

  async _loadNodes() {
    const btn = this.shadowRoot.getElementById("refresh-btn");
    if (btn) btn.disabled = true;
    this._setStatus("loading");

    const listEl = this.shadowRoot.getElementById("node-list-items");
    listEl.innerHTML = '<div class="global-loading"><div class="spinner"></div><span>Loading nodes…</span></div>';

    try {
      const result = await this._hass.connection.sendMessagePromise({
        type: "matter_node_tools/get_nodes",
      });
      this._nodes = result.nodes || [];
      this._setStatus("connected");
      this._renderNodeList();
      // If we had a previously selected node, re-select it
      if (this._selectedNodeId !== null) {
        const still = this._nodes.find((n) => n.node_id === this._selectedNodeId);
        if (still) {
          this._selectNode(this._selectedNodeId);
        } else {
          this._selectedNodeId = null;
          this._renderDetail(null);
        }
      }
    } catch (err) {
      this._setStatus("disconnected");
      listEl.innerHTML = `<div class="error-banner" style="margin:12px">Failed to load nodes: ${err.message || err}</div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ── Render node list ──

  _renderNodeList() {
    const listEl = this.shadowRoot.getElementById("node-list-items");
    listEl.innerHTML = "";

    if (this._nodes.length === 0) {
      listEl.innerHTML = '<div style="padding:12px;font-size:13px;color:var(--secondary-text-color)">No nodes found</div>';
      return;
    }

    for (const node of this._nodes) {
      const nodeId = node.node_id;
      const haDevice = this._haDevices[nodeId];
      const primaryName = (haDevice && haDevice.name) || getNodeLabel(node) || `Node ${nodeId}`;
      const meta = haDevice
        ? [haDevice.manufacturer, haDevice.model].filter(Boolean).join(" · ")
        : null;
      const item = document.createElement("div");
      item.className = "node-item" + (nodeId === this._selectedNodeId ? " selected" : "");
      item.dataset.nodeId = nodeId;
      item.innerHTML = `
        <span class="node-dot"></span>
        <span style="flex:1;min-width:0">
          <div class="node-name">${this._esc(primaryName)}</div>
          ${meta ? `<div class="node-list-meta">${this._esc(meta)}</div>` : ""}
        </span>
        <span class="node-id-badge">#${nodeId}</span>
      `;
      item.addEventListener("click", () => this._selectNode(nodeId));
      listEl.appendChild(item);
    }
  }

  // ── Select a node → load details ──

  async _selectNode(nodeId) {
    this._selectedNodeId = nodeId;

    // Update list highlight
    this.shadowRoot.querySelectorAll(".node-item").forEach((el) => {
      el.classList.toggle("selected", parseInt(el.dataset.nodeId) === nodeId);
    });

    const detail = this.shadowRoot.getElementById("detail-pane");
    detail.innerHTML = '<div class="global-loading"><div class="spinner"></div><span>Loading node…</span></div>';

    try {
      let node;
      if (this._nodeCache[nodeId]) {
        node = this._nodeCache[nodeId];
      } else {
        const result = await this._hass.connection.sendMessagePromise({
          type: "matter_node_tools/get_node",
          node_id: nodeId,
        });
        node = result.node || result;
        this._nodeCache[nodeId] = node;
      }
      this._renderNodeDetail(node);
    } catch (err) {
      detail.innerHTML = `<div class="error-banner">Failed to load node ${nodeId}: ${err.message || err}</div>`;
    }
  }

  // ── Render node detail ──

  _renderNodeDetail(node) {
    const nodeId = node.node_id;
    const haDevice = this._haDevices[nodeId];
    const primaryName = (haDevice && haDevice.name) || getNodeLabel(node) || `Node ${nodeId}`;
    const meta = haDevice
      ? [haDevice.manufacturer, haDevice.model].filter(Boolean).join(" · ")
      : null;
    const eps = parseNodeAttributes(node);
    const allEpIds = Object.keys(eps).map(Number).sort((a, b) => a - b);
    // Application endpoints (1+) first, then endpoint 0 last
    const appEpIds = allEpIds.filter(ep => ep !== 0);
    const hasEp0 = allEpIds.includes(0);
    const orderedEpIds = hasEp0 ? [...appEpIds, 0] : appEpIds;

    // Remember or default endpoint selection (prefer first app endpoint)
    if (!this._nodeEpSelection[nodeId] || !allEpIds.includes(this._nodeEpSelection[nodeId])) {
      this._nodeEpSelection[nodeId] = orderedEpIds[0] ?? 0;
    }
    const activeEp = this._nodeEpSelection[nodeId];

    const detail = this.shadowRoot.getElementById("detail-pane");

    // Node header
    let html = `
      <div class="node-header">
        <h2>${this._esc(primaryName)}</h2>
        <div class="node-meta">
          ${meta ? `${this._esc(meta)} &nbsp;|&nbsp; ` : ""}Node ID: ${nodeId} &nbsp;|&nbsp; ${allEpIds.length} endpoint${allEpIds.length !== 1 ? "s" : ""}
        </div>
      </div>
    `;

    if (orderedEpIds.length === 0) {
      html += '<div class="placeholder">No endpoint data available</div>';
      detail.innerHTML = html;
      return;
    }

    // Endpoint tabs — app endpoints first, then "⚙ Node Configuration" for ep 0
    html += '<div class="ep-tabs">';
    for (const ep of orderedEpIds) {
      const active = ep === activeEp ? " active" : "";
      let tabLabel;
      if (ep === 0) {
        tabLabel = "⚙ Node Configuration";
      } else {
        // Find primary cluster hint (first non-Descriptor, non-Binding cluster)
        const clusterIds = Object.keys(eps[ep] || {}).map(Number).sort((a, b) => a - b);
        const UTILITY_CLUSTERS = new Set([0x0003,0x0004,0x001D,0x001E,0x001F,0x003F,0x0040,0x0041]);
        const primaryCluster = clusterIds.find(id => !UTILITY_CLUSTERS.has(id));
        const hint = primaryCluster !== undefined ? clusterName(primaryCluster) : null;
        tabLabel = hint ? `${ep} · ${hint}` : String(ep);
      }
      html += `<button class="ep-tab${active}" data-ep="${ep}">${this._esc(tabLabel)}</button>`;
    }
    html += "</div>";

    // Endpoint content placeholder
    html += '<div id="ep-content"></div>';
    detail.innerHTML = html;

    // Wire tab clicks
    detail.querySelectorAll(".ep-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const ep = parseInt(tab.dataset.ep);
        this._nodeEpSelection[nodeId] = ep;
        detail.querySelectorAll(".ep-tab").forEach((t) => t.classList.toggle("active", parseInt(t.dataset.ep) === ep));
        this._renderEpContent(node, ep, eps[ep] || {}, ep === 0);
      });
    });

    // Render active endpoint (ep 0 starts collapsed)
    this._renderEpContent(node, activeEp, eps[activeEp] || {}, activeEp === 0);
  }

  // ── Render Endpoint 0 info cards ──

  _renderEp0InfoCards(nodeId, ep0Clusters) {
    const wrapper = document.createElement("div");
    wrapper.className = "ep0-cards";

    // Card A: Device Information (BasicInformation cluster 0x0028)
    const basicAttrs = ep0Clusters[0x0028];
    if (basicAttrs) {
      const rows = [];
      const vendor = basicAttrs[0x0001];
      if (vendor != null) rows.push({ label: "Vendor", value: safeStr(vendor) });
      const product = basicAttrs[0x0003];
      if (product != null) rows.push({ label: "Product", value: safeStr(product) });
      const nodeLabel = basicAttrs[0x0005];
      if (nodeLabel != null && String(nodeLabel).trim() !== "") rows.push({ label: "Node Label", value: safeStr(nodeLabel) });
      const hw = basicAttrs[0x0008];
      if (hw != null) rows.push({ label: "Hardware", value: safeStr(hw) });
      const sw = basicAttrs[0x000A];
      if (sw != null) rows.push({ label: "Software", value: safeStr(sw) });

      if (rows.length > 0) {
        const card = document.createElement("div");
        card.className = "info-card";
        card.innerHTML = `<div class="info-card-title">Device Information</div>`;
        for (const r of rows) {
          const row = document.createElement("div");
          row.className = "info-row";
          row.innerHTML = `<span class="info-label">${this._esc(r.label)}</span><span class="info-value">${this._esc(r.value)}</span>`;
          card.appendChild(row);
        }
        wrapper.appendChild(card);
      }
    }

    // Card B: Device Types (Descriptor cluster 0x001D, attr 0x0000)
    const descriptorAttrs = ep0Clusters[0x001D];
    if (descriptorAttrs && descriptorAttrs[0x0000] != null) {
      const raw = descriptorAttrs[0x0000];
      let deviceTypes = null;
      try {
        if (Array.isArray(raw)) {
          deviceTypes = raw;
        } else if (typeof raw === "string") {
          deviceTypes = JSON.parse(raw);
        }
      } catch (e) {
        deviceTypes = null;
      }

      const card = document.createElement("div");
      card.className = "info-card";
      card.innerHTML = `<div class="info-card-title">Device Types</div>`;
      const badgesDiv = document.createElement("div");
      badgesDiv.style.padding = "4px 0";

      if (Array.isArray(deviceTypes)) {
        for (const entry of deviceTypes) {
          let dtId;
          if (typeof entry === "object" && entry !== null) {
            dtId = entry.device_type ?? entry.deviceType ?? entry.type ?? null;
          } else if (typeof entry === "number") {
            dtId = entry;
          }
          if (dtId == null) continue;
          const name = DEVICE_TYPE_NAMES[dtId] || `Unknown`;
          const hexStr = `0x${dtId.toString(16).toUpperCase().padStart(4, "0")}`;
          const badge = document.createElement("span");
          badge.className = "device-type-badge";
          badge.textContent = `${name} (${hexStr})`;
          badgesDiv.appendChild(badge);
        }
        if (!badgesDiv.hasChildNodes()) {
          badgesDiv.textContent = safeStr(raw);
        }
      } else {
        badgesDiv.textContent = safeStr(raw);
      }

      card.appendChild(badgesDiv);
      wrapper.appendChild(card);
    }

    // Card C: Power Source (cluster 0x002F)
    const psAttrs = ep0Clusters[0x002F];
    if (psAttrs) {
      const rows = [];
      const status = psAttrs[0x0000];
      if (status != null) rows.push({ label: "Status", value: POWER_STATUS[status] ?? safeStr(status) });
      const bv = psAttrs[0x000B];
      if (bv != null) rows.push({ label: "Battery Voltage", value: `${(Number(bv) / 1000).toFixed(2)} V` });
      const bp = psAttrs[0x000C];
      if (bp != null) rows.push({ label: "Battery Remaining", value: `${(Number(bp) / 2).toFixed(1)} %` });
      const bcl = psAttrs[0x000E];
      if (bcl != null) rows.push({ label: "Charge Level", value: BATTERY_CHARGE_LEVEL[bcl] ?? safeStr(bcl) });

      if (rows.length > 0) {
        const card = document.createElement("div");
        card.className = "info-card";
        card.innerHTML = `<div class="info-card-title">Power Source</div>`;
        for (const r of rows) {
          const row = document.createElement("div");
          row.className = "info-row";
          row.innerHTML = `<span class="info-label">${this._esc(r.label)}</span><span class="info-value">${this._esc(r.value)}</span>`;
          card.appendChild(row);
        }
        wrapper.appendChild(card);
      }
    }

    // Card D: Network (NetworkCommissioning cluster 0x0031)
    const netAttrs = ep0Clusters[0x0031];
    if (netAttrs) {
      const card = document.createElement("div");
      card.className = "info-card";
      card.innerHTML = `<div class="info-card-title">Network</div>`;
      let hasContent = false;

      const maxTime = netAttrs[0x0003];
      if (maxTime != null) {
        const row = document.createElement("div");
        row.className = "info-row";
        row.innerHTML = `<span class="info-label">Connect Max Time</span><span class="info-value">${this._esc(safeStr(maxTime))} s</span>`;
        card.appendChild(row);
        hasContent = true;
      }

      const networks = netAttrs[0x0001];
      if (networks != null) {
        let netArr = null;
        try {
          if (Array.isArray(networks)) netArr = networks;
          else if (typeof networks === "string") netArr = JSON.parse(networks);
        } catch (e) { netArr = null; }

        if (Array.isArray(netArr) && netArr.length > 0) {
          const row = document.createElement("div");
          row.className = "info-row";
          row.style.flexDirection = "column";
          row.innerHTML = `<span class="info-label" style="width:auto;margin-bottom:4px">Networks</span>`;
          for (const net of netArr) {
            const item = document.createElement("div");
            item.className = "network-item";
            if (typeof net === "object" && net !== null) {
              const connected = net.connected ? " (connected)" : "";
              if (net.network_id || net.networkID) {
                // Try to detect type by ssid or thread fields
                const rawId = net.network_id || net.networkID || "";
                const ssid = typeof rawId === "string" ? rawId : JSON.stringify(rawId);
                item.textContent = `📶 ${ssid}${connected}`;
              } else if (net.ssid) {
                item.textContent = `📶 WiFi: ${net.ssid}${connected}`;
              } else {
                item.textContent = `📶 ${safeStr(net)}`;
              }
            } else {
              item.textContent = `📶 ${safeStr(net)}`;
            }
            row.appendChild(item);
          }
          card.appendChild(row);
          hasContent = true;
        } else if (netArr === null) {
          const row = document.createElement("div");
          row.className = "info-row";
          row.innerHTML = `<span class="info-label">Networks</span><span class="info-value">${this._esc(safeStr(networks))}</span>`;
          card.appendChild(row);
          hasContent = true;
        }
      }

      if (hasContent) wrapper.appendChild(card);
    }

    // Card E: General Diagnostics (cluster 0x0033)
    const diagAttrs = ep0Clusters[0x0033];
    if (diagAttrs) {
      const rows = [];
      const uptime = diagAttrs[0x0002];
      if (uptime != null) rows.push({ label: "Uptime", value: formatUptime(Number(uptime)), cls: "uptime" });
      const bootReason = diagAttrs[0x0008];
      if (bootReason != null) rows.push({ label: "Boot Reason", value: BOOT_REASON[bootReason] ?? safeStr(bootReason) });
      const faults = diagAttrs[0x0003];
      if (faults != null) {
        let faultStr;
        if (Array.isArray(faults) && faults.length === 0) faultStr = "None";
        else faultStr = safeStr(faults);
        rows.push({ label: "Active HW Faults", value: faultStr });
      }

      if (rows.length > 0) {
        const card = document.createElement("div");
        card.className = "info-card";
        card.innerHTML = `<div class="info-card-title">General Diagnostics</div>`;
        for (const r of rows) {
          const row = document.createElement("div");
          row.className = "info-row";
          row.innerHTML = `<span class="info-label">${this._esc(r.label)}</span><span class="info-value${r.cls ? " " + r.cls : ""}">${this._esc(r.value)}</span>`;
          card.appendChild(row);
        }
        wrapper.appendChild(card);
      }
    }

    return wrapper;
  }

  // ── Render one endpoint's clusters ──

  _renderEpContent(node, epId, clusters, collapseAll = false) {
    const nodeId = node.node_id;
    const epContent = this.shadowRoot.getElementById("ep-content");
    if (!epContent) return;
    epContent.innerHTML = "";

    // For endpoint 0, prepend structured info cards
    if (epId === 0) {
      const infoCards = this._renderEp0InfoCards(nodeId, clusters);
      if (infoCards.hasChildNodes()) {
        epContent.appendChild(infoCards);
      }
    }

    const clusterIds = Object.keys(clusters).map(Number).sort((a, b) => a - b);
    if (clusterIds.length === 0) {
      epContent.innerHTML = '<div style="padding:12px;color:var(--secondary-text-color)">No cluster data for this endpoint</div>';
      return;
    }

    for (const clusterId of clusterIds) {
      const card = this._buildClusterCard(node, epId, clusterId, clusters[clusterId], collapseAll);
      epContent.appendChild(card);
    }
  }

  // ── Build a cluster card element ──

  _buildClusterCard(node, epId, clusterId, attrs, startCollapsed = false) {
    const nodeId = node.node_id;
    const cName = clusterName(clusterId);
    const card = document.createElement("div");
    card.className = "cluster-card";
    card.dataset.clusterId = clusterId;

    const header = document.createElement("div");
    header.className = "cluster-header";
    header.innerHTML = `
      <span class="cluster-chevron">▼</span>
      <span class="cluster-name">${this._esc(cName)}</span>
      <span class="cluster-id">${hexId(clusterId)}</span>
    `;

    const body = document.createElement("div");
    body.className = "cluster-body" + (startCollapsed ? " collapsed" : "");
    if (startCollapsed) header.classList.add("collapsed");

    // Toggle collapse
    header.addEventListener("click", () => {
      const collapsed = body.classList.toggle("collapsed");
      header.classList.toggle("collapsed", collapsed);
    });

    // Build attribute table
    const attrIds = Object.keys(attrs).map(Number).sort((a, b) => a - b);
    if (attrIds.length > 0) {
      const table = document.createElement("table");
      table.className = "attr-table";
      table.innerHTML = `<thead><tr><th>Attribute</th><th>ID</th><th>Value</th><th>Actions</th></tr></thead>`;
      const tbody = document.createElement("tbody");

      for (const attrId of attrIds) {
        const aName = attrName(clusterId, attrId) || `Attr ${hexId(attrId)}`;
        const cacheKey = `${nodeId}/${epId}/${clusterId}/${attrId}`;
        const cachedVal = this._attrValues[cacheKey];
        const initialVal = cachedVal !== undefined ? cachedVal : attrs[attrId];

        // Main row
        const row = document.createElement("tr");
        row.className = "attr-row";
        row.dataset.cacheKey = cacheKey;

        const valDisplay = initialVal !== undefined && initialVal !== null
          ? this._esc(safeStr(initialVal))
          : '<span class="loading">—</span>';

        row.innerHTML = `
          <td class="attr-name">${this._esc(aName)}</td>
          <td class="attr-id">${hexId(attrId)}</td>
          <td class="attr-value" id="val-${this._safeId(cacheKey)}">${valDisplay}</td>
          <td class="attr-actions">
            <button class="action-btn read-btn" title="Read current value">Read</button>
          </td>
        `;

        // Write row
        const writeRow = document.createElement("tr");
        writeRow.className = "write-row";
        writeRow.innerHTML = `
          <td colspan="4">
            <div class="write-form">
              <input class="write-input" placeholder="value" title="Enter value to write" />
              <button class="action-btn primary write-btn">Write</button>
            </div>
          </td>
        `;

        tbody.appendChild(row);
        tbody.appendChild(writeRow);

        // Wire Read button
        row.querySelector(".read-btn").addEventListener("click", (e) => {
          this._readAttr(e.currentTarget, nodeId, epId, clusterId, attrId, cacheKey);
        });

        // Wire Write button
        writeRow.querySelector(".write-btn").addEventListener("click", (e) => {
          const input = writeRow.querySelector(".write-input");
          this._writeAttr(e.currentTarget, nodeId, epId, clusterId, attrId, cacheKey, input.value);
        });
      }

      table.appendChild(tbody);
      body.appendChild(table);
    }

    // Commands section
    const cmds = CLUSTER_COMMANDS[clusterId];
    if (cmds && cmds.length > 0) {
      const cmdSection = document.createElement("div");
      cmdSection.className = "commands-section";
      cmdSection.innerHTML = `<div class="commands-title">Commands</div>`;

      for (const cmd of cmds) {
        cmdSection.appendChild(this._buildCommandRow(nodeId, epId, clusterId, cmd));
      }
      body.appendChild(cmdSection);
    }

    card.appendChild(header);
    card.appendChild(body);
    return card;
  }

  // ── Read attribute ──

  async _readAttr(btn, nodeId, epId, clusterId, attrId, cacheKey) {
    btn.disabled = true;
    const valEl = this.shadowRoot.getElementById(`val-${this._safeId(cacheKey)}`);
    if (valEl) { valEl.className = "attr-value loading"; valEl.textContent = "…"; }

    try {
      const result = await this._hass.connection.sendMessagePromise({
        type: "matter_node_tools/read_attribute",
        node_id: nodeId,
        endpoint_id: epId,
        cluster_id: clusterId,
        attribute_id: attrId,
      });
      const val = result.value;
      this._attrValues[cacheKey] = val;
      if (valEl) {
        valEl.className = "attr-value";
        valEl.textContent = safeStr(val);
        valEl.title = safeStr(val);
      }
    } catch (err) {
      if (valEl) { valEl.className = "attr-value error"; valEl.textContent = "ERR: " + (err.message || err); }
    } finally {
      btn.disabled = false;
    }
  }

  // ── Write attribute ──

  async _writeAttr(btn, nodeId, epId, clusterId, attrId, cacheKey, rawValue) {
    let parsedValue;
    try {
      parsedValue = JSON.parse(rawValue);
    } catch {
      // Not JSON, try as a number, then string
      const asNum = Number(rawValue);
      parsedValue = isNaN(asNum) ? rawValue : asNum;
    }

    btn.disabled = true;
    const valEl = this.shadowRoot.getElementById(`val-${this._safeId(cacheKey)}`);
    if (valEl) { valEl.className = "attr-value loading"; valEl.textContent = "writing…"; }

    try {
      await this._hass.connection.sendMessagePromise({
        type: "matter_node_tools/write_attribute",
        node_id: nodeId,
        endpoint_id: epId,
        cluster_id: clusterId,
        attribute_id: attrId,
        value: parsedValue,
      });
      // Re-read to confirm
      await this._readAttr({ disabled: false }, nodeId, epId, clusterId, attrId, cacheKey);
    } catch (err) {
      if (valEl) { valEl.className = "attr-value error"; valEl.textContent = "ERR: " + (err.message || err); }
    } finally {
      btn.disabled = false;
    }
  }

  // ── Build command row ──

  _buildCommandRow(nodeId, epId, clusterId, cmd) {
    const schemaKey = `${clusterId}/${cmd}`;
    const schema = COMMAND_SCHEMAS[schemaKey];

    const row = document.createElement("div");
    row.className = "command-row";

    const nameEl = document.createElement("span");
    nameEl.className = "command-name";
    nameEl.textContent = cmd;
    row.appendChild(nameEl);

    const resultEl = document.createElement("span");
    resultEl.className = "command-result";

    if (schema !== undefined) {
      // Structured form
      if (schema.length > 0) {
        const form = this._buildSchemaForm(schema);
        row.appendChild(form);
      }
      const runBtn = document.createElement("button");
      runBtn.className = "action-btn primary run-btn";
      runBtn.textContent = "Run";
      runBtn.addEventListener("click", () => {
        const payload = schema.length > 0 ? this._readSchemaForm(row, schema) : {};
        this._invokeCmd(runBtn, nodeId, epId, clusterId, cmd, payload, resultEl);
      });
      row.appendChild(runBtn);
    } else {
      // Fallback: JSON textarea
      const input = document.createElement("input");
      input.className = "command-payload-input";
      input.placeholder = "{}";
      input.value = "{}";
      row.appendChild(input);
      const runBtn = document.createElement("button");
      runBtn.className = "action-btn primary run-btn";
      runBtn.textContent = "Run";
      runBtn.addEventListener("click", () => {
        this._invokeCmd(runBtn, nodeId, epId, clusterId, cmd, input.value, resultEl);
      });
      row.appendChild(runBtn);
    }

    row.appendChild(resultEl);
    return row;
  }

  _buildSchemaForm(schema) {
    const form = document.createElement("div");
    form.className = "command-form";
    for (const field of schema) {
      const fieldDiv = document.createElement("div");
      fieldDiv.className = "command-field";
      fieldDiv.dataset.fieldName = field.name;
      fieldDiv.dataset.fieldType = field.type;
      if (field.type === "bitmap") {
        const lbl = document.createElement("label");
        lbl.textContent = field.label + ":";
        fieldDiv.appendChild(lbl);
        const checks = document.createElement("div");
        checks.className = "bitmap-checks";
        field.bits.forEach((bitLabel, idx) => {
          const checkLabel = document.createElement("label");
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.dataset.bit = idx;
          checkLabel.appendChild(cb);
          checkLabel.append(" " + bitLabel);
          checks.appendChild(checkLabel);
        });
        fieldDiv.appendChild(checks);
      } else if (field.type === "number") {
        const lbl = document.createElement("label");
        lbl.textContent = field.label + ": ";
        const inp = document.createElement("input");
        inp.type = "number";
        if (field.min !== undefined) inp.min = field.min;
        if (field.max !== undefined) inp.max = field.max;
        inp.value = field.min ?? 0;
        inp.style.width = "80px";
        lbl.appendChild(inp);
        fieldDiv.appendChild(lbl);
      }
      form.appendChild(fieldDiv);
    }
    return form;
  }

  _readSchemaForm(row, schema) {
    const payload = {};
    for (const field of schema) {
      const fieldDiv = row.querySelector(`[data-field-name="${field.name}"]`);
      if (!fieldDiv) continue;
      if (field.type === "bitmap") {
        let val = 0;
        fieldDiv.querySelectorAll("input[type=checkbox]").forEach(cb => {
          if (cb.checked) val |= (1 << parseInt(cb.dataset.bit));
        });
        payload[field.name] = val;
      } else if (field.type === "number") {
        const inp = fieldDiv.querySelector("input[type=number]");
        if (inp && inp.value !== "") {
          if (!field.optional || inp.value !== String(field.min ?? 0)) {
            payload[field.name] = parseInt(inp.value);
          }
        }
      }
    }
    return payload;
  }

  // ── Invoke command ──

  async _invokeCmd(btn, nodeId, epId, clusterId, commandName, payloadOrStr, resultEl) {
    let payload = {};
    if (typeof payloadOrStr === "string") {
      try {
        payload = JSON.parse(payloadOrStr || "{}");
      } catch {
        if (resultEl) { resultEl.textContent = "Invalid JSON payload"; return; }
      }
    } else {
      payload = payloadOrStr || {};
    }

    btn.disabled = true;
    if (resultEl) resultEl.textContent = "Running…";

    try {
      const result = await this._hass.connection.sendMessagePromise({
        type: "matter_node_tools/invoke_command",
        node_id: nodeId,
        endpoint_id: epId,
        cluster_id: clusterId,
        command_name: commandName,
        payload,
      });
      if (resultEl) resultEl.textContent = "✓ " + safeStr(result.result ?? result);
    } catch (err) {
      if (resultEl) resultEl.textContent = "ERR: " + (err.message || err);
    } finally {
      btn.disabled = false;
    }
  }

  // ── Helpers ──

  _esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  _safeId(str) {
    return String(str).replace(/[^a-zA-Z0-9]/g, "_");
  }

  _renderDetail(node) {
    const detail = this.shadowRoot.getElementById("detail-pane");
    if (!node) {
      detail.innerHTML = '<div class="placeholder">Select a node from the left panel</div>';
    }
  }
}

customElements.define("matter-panel", MatterPanel);
