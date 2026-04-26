import { api, LightningElement } from "lwc";
import { defaultPickerConfig } from "c/pflowUtilityPickerConfigDefaults";
import { SELECTION_TILES } from "c/pflowUtilityPickerConfigOptions";

export default class PflowOrganismPickerBehaviorConfig extends LightningElement {
  @api config;
  @api builderContext;
  @api automaticOutputVariables;

  get _config() {
    return this.config || defaultPickerConfig();
  }
  set _config(value) {
    this.dispatchEvent(
      new CustomEvent("configpatch", { detail: { path: [], value } })
    );
  }

  get hasDataSource() {
    return Boolean(this._config.dataSource);
  }
  get isSingleSelect() {
    return this._config.selectionMode === "single";
  }
  get isMultiSelect() {
    return this._config.selectionMode === "multi";
  }
  get selectionTiles() {
    const active = this._config.selectionMode || "single";
    return SELECTION_TILES.map((tile) => ({
      ...tile,
      id: tile.value,
      _selected: tile.value === active
    }));
  }

  handleSelectionTileChange(event) {
    const value = event.detail?.value || "single";
    const next = { ...this._config, selectionMode: value };
    if (value === "multi") {
      next.autoAdvance = false;
      next.includeNoneOption = false;
      if (next.layout === "dropdown" || next.layout === "radio")
        next.layout = "grid";
    }
    this._config = next;
  }
  handleToggleChange(event) {
    const key = event.currentTarget.dataset.key;
    if (!key) return;
    const checked = event.detail?.checked ?? event.target?.checked ?? false;
    this._config = { ...this._config, [key]: Boolean(checked) };
  }
  handleMinChange(event) {
    this._config = {
      ...this._config,
      minSelections: Number(event.target.value) || 0
    };
  }
  handleMaxChange(event) {
    const raw = event.target.value;
    this._config = {
      ...this._config,
      maxSelections: raw === "" ? null : Number(raw)
    };
  }
  handleErrorMessageChange(event) {
    this._config = {
      ...this._config,
      customErrorMessage: this.readValue(event)
    };
  }

  get isNoneOptionAvailable() {
    return this.isSingleSelect;
  }
  get noneOptionValue() {
    return Boolean(this._config.includeNoneOption);
  }
  get noneOptionLabelValue() {
    return this._config.noneOptionLabel ?? "--None--";
  }
  get noneOptionPositionValue() {
    return this._config.noneOptionPosition === "end" ? "end" : "start";
  }
  get isNoneOptionLabelDisabled() {
    return !this.isNoneOptionAvailable || !this.noneOptionValue;
  }
  get noneOptionPositionTiles() {
    const active = this.noneOptionPositionValue;
    const disabled = this.isNoneOptionLabelDisabled;
    return [
      {
        value: "start",
        label: "At start",
        sublabel: "Before items",
        icon: "shrink",
        _selected: active === "start",
        _disabled: disabled
      },
      {
        value: "end",
        label: "At end",
        sublabel: "After items",
        icon: "expand",
        _selected: active === "end",
        _disabled: disabled
      }
    ];
  }
  handleNoneOptionLabelChange(event) {
    this._config = { ...this._config, noneOptionLabel: this.readValue(event) };
  }
  handleNoneOptionPositionChange(event) {
    const value = event.detail?.value;
    if (value === "start" || value === "end")
      this._config = { ...this._config, noneOptionPosition: value };
  }

  readValue(event) {
    const fromDetail = event?.detail?.newValue;
    if (fromDetail !== undefined && fromDetail !== null)
      return String(fromDetail);
    const fromTarget = event?.target?.value;
    return fromTarget === undefined || fromTarget === null
      ? ""
      : String(fromTarget);
  }
}
