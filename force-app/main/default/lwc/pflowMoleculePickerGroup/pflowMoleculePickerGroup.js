import { LightningElement, api, track } from "lwc";
import { filterItems, tokenToCss } from "c/pflowUtilityPickerDataSources";

const MODE_SINGLE = "single";
const MODE_MULTI = "multi";

const VARIANT_GRID = "grid";
const VARIANT_LIST = "list";
const VARIANT_HORIZONTAL = "horizontal";
const VARIANT_DROPDOWN = "dropdown";
const VARIANT_RADIO = "radio";
const VALID_VARIANTS = new Set([
  VARIANT_GRID,
  VARIANT_LIST,
  VARIANT_HORIZONTAL,
  VARIANT_DROPDOWN,
  VARIANT_RADIO
]);

let GROUP_COUNTER = 0;

export default class PflowMoleculePickerGroup extends LightningElement {
  @api items = [];
  @api variant = VARIANT_GRID;
  @api selectionMode = MODE_SINGLE;
  @api minSelections = 0;
  @api maxSelections;
  @api showSelectAll = false;
  @api enableSearch = false;
  @api previewMode = false;

  // Grid layout knobs
  @api gridMinWidth = "16rem";
  // Gaps + margin + padding accept SLDS 2 spacing tokens ('1'-'12', 'none')
  // or passthrough CSS values ('1rem', '16px'). tokenToCss() normalizes.
  @api gapHorizontal = "7";
  @api gapVertical = "7";
  @api marginTop = "none";
  @api marginRight = "none";
  @api marginBottom = "none";
  @api marginLeft = "none";
  @api paddingTop;
  @api paddingRight;
  @api paddingBottom;
  @api paddingLeft;

  // Per-tile size + aspect (passed to atom)
  @api size = "medium";
  @api iconSize = "large";
  @api aspectRatio = "1:1";

  // Badge presentation (passed to atom)
  @api badgePosition = "bottom-inline";
  @api badgeVariant = "neutral";
  @api badgeShape = "pill";

  // Fixed column count for grid variant. null/undefined/0 = auto-fill
  // based on gridMinWidth (default responsive behavior). 1–6 forces that
  // many equal columns regardless of container width.
  @api columns;

  // Pass-through styling knobs — shipped to every atom in the group.
  @api selectionIndicator = "checkmark";
  @api elevation = "outlined";
  // Pattern / corner / surface / icon-decor — new styling axes. Each has a
  // tone sibling for color. Defaults keep every picker identical to its
  // pre-refresh state; set any of these in the CPE to customize.
  @api pattern = "none";
  @api patternTone = "neutral";
  @api cornerStyle = "none";
  @api cornerTone = "neutral";
  @api surfaceStyle = "solid";
  @api surfaceTone = "neutral";
  @api iconDecor = "none";
  @api iconStyle = "filled";
  @api iconShading = "flat";
  @api iconTone = "neutral";
  @api iconGlyphTone;
  @api iconGlyphToneHex = "";
  // Custom hex color slots — one per tone axis. Active only when the
  // matching tone value is 'custom'. Ignored otherwise.
  @api iconToneHex = "";
  @api patternToneHex = "";
  @api cornerToneHex = "";
  @api surfaceToneHex = "";
  @api badgeVariantHex = "";
  // undefined → render (default ON); explicit `false` → hide globally.
  @api showIcons;
  @api showBadges;

  _selectedValues = [];
  @track _searchTerm = "";
  _groupName = `pflow-group-${++GROUP_COUNTER}`;

  @api
  get selectedValues() {
    return this._selectedValues;
  }
  set selectedValues(v) {
    this._selectedValues = Array.isArray(v) ? [...v] : [];
  }

  get resolvedVariant() {
    const raw = VALID_VARIANTS.has(this.variant) ? this.variant : VARIANT_GRID;
    // Dropdown/radio are single-select by nature (native form controls).
    // If an admin paired them with multi selection, fall back to the grid
    // so the picker still works — the CPE's validation layer warns them.
    if ((raw === VARIANT_DROPDOWN || raw === VARIANT_RADIO) && this.isMulti) {
      return VARIANT_GRID;
    }
    return raw;
  }

  get isMulti() {
    return this.selectionMode === MODE_MULTI;
  }
  get isList() {
    return this.resolvedVariant === VARIANT_LIST;
  }
  get isDropdown() {
    return this.resolvedVariant === VARIANT_DROPDOWN;
  }
  get isRadio() {
    return this.resolvedVariant === VARIANT_RADIO;
  }
  // Tile-based variants share one template branch; native form controls
  // (combobox + radio group) each get their own, since they don't render
  // the atom tile at all.
  get isTileVariant() {
    return !this.isDropdown && !this.isRadio;
  }

  get filteredItems() {
    const base = Array.isArray(this.items) ? this.items : [];
    if (!this.isTileVariant) return base;
    if (!this.enableSearch || !this._searchTerm) return base;
    return filterItems(base, this._searchTerm);
  }

  get decoratedItems() {
    const selected = new Set(this._selectedValues);
    const maxReached =
      this.isMulti &&
      this.hasMaxSelections &&
      selected.size >= Number(this.maxSelections);
    return this.filteredItems.map((item) => {
      const isSelected = selected.has(item.value);
      return {
        ...item,
        _selected: isSelected,
        _disabled: Boolean(item.disabled) || (maxReached && !isSelected)
      };
    });
  }

  get hasMaxSelections() {
    return (
      this.maxSelections !== undefined &&
      this.maxSelections !== null &&
      this.maxSelections !== ""
    );
  }

  get showToolbar() {
    return this.isMulti && this.decoratedItems.length > 0 && !this.previewMode;
  }

  get counterLabel() {
    const total = this.filteredItems.length;
    const selected = this._selectedValues.length;
    return this.hasMaxSelections
      ? `${selected} of ${this.maxSelections} selected`
      : `${selected} of ${total} selected`;
  }

  get groupRole() {
    return this.isMulti ? "group" : "radiogroup";
  }

  get groupClass() {
    return `pflow-group pflow-group_${this.resolvedVariant}`;
  }

  get groupStyle() {
    const parts = [
      `--pflow-group-min-w: ${this.gridMinWidth}`,
      `--pflow-group-gap-x: ${tokenToCss(this.gapHorizontal)}`,
      `--pflow-group-gap-y: ${tokenToCss(this.gapVertical)}`,
      `--pflow-group-margin-t: ${tokenToCss(this.marginTop)}`,
      `--pflow-group-margin-r: ${tokenToCss(this.marginRight)}`,
      `--pflow-group-margin-b: ${tokenToCss(this.marginBottom)}`,
      `--pflow-group-margin-l: ${tokenToCss(this.marginLeft)}`
    ];
    // Tile padding — only emit if explicitly set. When omitted, the atom
    // falls back to its size-based density defaults.
    if (this.paddingTop !== undefined && this.paddingTop !== null) {
      parts.push(`--pflow-tile-pad-t: ${tokenToCss(this.paddingTop)}`);
    }
    if (this.paddingRight !== undefined && this.paddingRight !== null) {
      parts.push(`--pflow-tile-pad-r: ${tokenToCss(this.paddingRight)}`);
    }
    if (this.paddingBottom !== undefined && this.paddingBottom !== null) {
      parts.push(`--pflow-tile-pad-b: ${tokenToCss(this.paddingBottom)}`);
    }
    if (this.paddingLeft !== undefined && this.paddingLeft !== null) {
      parts.push(`--pflow-tile-pad-l: ${tokenToCss(this.paddingLeft)}`);
    }
    // Fixed column count override — emitted only when set. Grid CSS
    // checks `--pflow-group-cols` and switches template-columns to
    // `repeat(N, 1fr)` when present.
    const cols = Number(this.columns);
    if (Number.isFinite(cols) && cols >= 1 && cols <= 6) {
      parts.push(`--pflow-group-cols: ${cols}`);
    }
    return parts.join("; ");
  }

  get isEmpty() {
    return !this.previewMode && this.decoratedItems.length === 0;
  }

  get atomVariant() {
    return this.isList ? VARIANT_LIST : VARIANT_GRID;
  }

  // Native radio-group still speaks the standard `{label, value}` contract.
  // The dropdown variant now renders through a custom rich combobox so it
  // can preserve icon / subtitle / badge metadata end-to-end.
  get nativeOptions() {
    return this.filteredItems.map((i) => ({
      label: String(i.label ?? i.value ?? ""),
      value: String(i.value ?? ""),
      // radio-group respects `disabled` per option; combobox ignores it
      // (SLDS limitation), but disabled items are rare and still honored
      // on selection via the atom flow.
      disabled: Boolean(i.disabled)
    }));
  }

  // Single-select native controls take a scalar value. We derive it from
  // the first entry in _selectedValues to keep a single source of truth.
  get singleSelectedValue() {
    return this._selectedValues.length ? this._selectedValues[0] : "";
  }

  handleSearch(event) {
    this._searchTerm = event.target.value || "";
  }

  handleDropdownChange(event) {
    const value = event.detail?.value;
    if (value === undefined || value === null) return;
    if (this._selectedValues[0] === value) return;
    this._selectedValues = [value];
    if (!this.previewMode) this.fireChange();
  }

  // Native radio group — single-select by design. Same semantics as the
  // dropdown handler; lightning-radio-group dispatches `change` with
  // detail.value.
  handleRadioChange(event) {
    const value = event.detail?.value;
    if (value === undefined || value === null) return;
    if (this._selectedValues[0] === value) return;
    this._selectedValues = [value];
    if (!this.previewMode) this.fireChange();
  }

  handleCardSelect(event) {
    const value = event.detail?.value;
    if (value === undefined || value === null) return;

    let changed;
    if (this.isMulti) {
      changed = this.toggleMulti(value);
    } else {
      changed = this._selectedValues[0] !== value;
      this._selectedValues = [value];
    }
    if (changed && !this.previewMode) this.fireChange();
  }

  toggleMulti(value) {
    const current = new Set(this._selectedValues);
    if (current.has(value)) {
      current.delete(value);
    } else {
      if (this.hasMaxSelections && current.size >= Number(this.maxSelections)) {
        return false;
      }
      current.add(value);
    }
    this._selectedValues = [...current];
    return true;
  }

  handleSelectAll() {
    if (!this.isMulti) return;
    const allValues = this.filteredItems
      .filter((i) => !i.disabled)
      .map((i) => i.value);
    this._selectedValues = this.hasMaxSelections
      ? allValues.slice(0, Number(this.maxSelections))
      : allValues;
    this.fireChange();
  }

  handleClearAll() {
    if (!this.isMulti) return;
    this._selectedValues = [];
    this.fireChange();
  }

  fireChange() {
    const selectedItems = (this.items || []).filter((i) =>
      this._selectedValues.includes(i.value)
    );
    this.dispatchEvent(
      new CustomEvent("selectionchange", {
        detail: {
          values: [...this._selectedValues],
          items: selectedItems
        },
        bubbles: true,
        composed: false
      })
    );
  }
}
