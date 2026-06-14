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

  /* ── Global loading / empty states ── */
  .global-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    color: var(--secondary-text-color, #757575);
  }
`;

// Known commands per cluster (for display purposes)
const CLUSTER_COMMANDS = {
  0x0006: ["Toggle", "On", "Off", "OnWithRecallGlobalScene", "OnWithTimedOff", "OffWithEffect"],
  0x0008: ["MoveToLevel", "Move", "Step", "Stop", "MoveToLevelWithOnOff", "MoveWithOnOff", "StepWithOnOff", "StopWithOnOff"],
  0x0080: ["EnableDisableAlarm", "SuppressAlarm", "EnableAlarm"],
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
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded) {
      this._loaded = true;
      this._buildShell();
      this._loadNodes();
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
      const label = getNodeLabel(node) || `Node ${nodeId}`;
      const item = document.createElement("div");
      item.className = "node-item" + (nodeId === this._selectedNodeId ? " selected" : "");
      item.dataset.nodeId = nodeId;
      item.innerHTML = `
        <span class="node-dot"></span>
        <span class="node-name">${this._esc(label)}</span>
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
    const label = getNodeLabel(node) || `Node ${nodeId}`;
    const eps = parseNodeAttributes(node);
    const epIds = Object.keys(eps).map(Number).sort((a, b) => a - b);

    // Remember or default endpoint selection
    if (!this._nodeEpSelection[nodeId] || !epIds.includes(this._nodeEpSelection[nodeId])) {
      this._nodeEpSelection[nodeId] = epIds[0] ?? 0;
    }
    const activeEp = this._nodeEpSelection[nodeId];

    const detail = this.shadowRoot.getElementById("detail-pane");

    // Node header
    let html = `
      <div class="node-header">
        <h2>${this._esc(label)}</h2>
        <div class="node-meta">Node ID: ${nodeId} &nbsp;|&nbsp; ${epIds.length} endpoint${epIds.length !== 1 ? "s" : ""}</div>
      </div>
    `;

    if (epIds.length === 0) {
      html += '<div class="placeholder">No endpoint data available</div>';
      detail.innerHTML = html;
      return;
    }

    // Endpoint tabs
    html += '<div class="ep-tabs">';
    for (const ep of epIds) {
      const active = ep === activeEp ? " active" : "";
      html += `<button class="ep-tab${active}" data-ep="${ep}">Endpoint ${ep}</button>`;
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
        this._renderEpContent(node, ep, eps[ep] || {});
      });
    });

    // Render active endpoint
    this._renderEpContent(node, activeEp, eps[activeEp] || {});
  }

  // ── Render one endpoint's clusters ──

  _renderEpContent(node, epId, clusters) {
    const nodeId = node.node_id;
    const epContent = this.shadowRoot.getElementById("ep-content");
    if (!epContent) return;
    epContent.innerHTML = "";

    const clusterIds = Object.keys(clusters).map(Number).sort((a, b) => a - b);
    if (clusterIds.length === 0) {
      epContent.innerHTML = '<div style="padding:12px;color:var(--secondary-text-color)">No cluster data for this endpoint</div>';
      return;
    }

    for (const clusterId of clusterIds) {
      const card = this._buildClusterCard(node, epId, clusterId, clusters[clusterId]);
      epContent.appendChild(card);
    }
  }

  // ── Build a cluster card element ──

  _buildClusterCard(node, epId, clusterId, attrs) {
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
    body.className = "cluster-body";

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
        const cmdRow = document.createElement("div");
        cmdRow.className = "command-row";
        cmdRow.innerHTML = `
          <span class="command-name">${this._esc(cmd)}</span>
          <input class="command-payload-input" placeholder="{}" title="JSON payload" value="{}" />
          <button class="action-btn primary run-btn">Run</button>
          <span class="command-result" id="cmd-result-${this._safeId(nodeId + cmd)}"></span>
        `;
        cmdRow.querySelector(".run-btn").addEventListener("click", (e) => {
          const payloadInput = cmdRow.querySelector(".command-payload-input");
          const resultEl = cmdRow.querySelector(".command-result");
          this._invokeCmd(e.currentTarget, nodeId, epId, clusterId, cmd, payloadInput.value, resultEl);
        });
        cmdSection.appendChild(cmdRow);
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

  // ── Invoke command ──

  async _invokeCmd(btn, nodeId, epId, clusterId, commandName, payloadStr, resultEl) {
    let payload = {};
    try {
      payload = JSON.parse(payloadStr || "{}");
    } catch {
      if (resultEl) { resultEl.textContent = "Invalid JSON payload"; return; }
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
