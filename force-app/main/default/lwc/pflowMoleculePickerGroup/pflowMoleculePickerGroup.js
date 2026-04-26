import { LightningElement, api, track } from "lwc";
import {
  filterItems,
  tokenToCss,
  MANUAL_INPUT_VALUE
} from "c/pflowUtilityPickerDataSources";

const MODE_SINGLE = "single";
const MODE_MULTI = "multi";

const VARIANT_GRID = "grid";
const VARIANT_LIST = "list";
const VARIANT_HORIZONTAL = "horizontal";
const VARIANT_COLUMNS = "columns";
const VARIANT_DUAL_LISTBOX = "dualListbox";
const VARIANT_PICKLIST = "picklist";
const VARIANT_DROPDOWN = "dropdown";
const VARIANT_RADIO = "radio";
const VALID_VARIANTS = new Set([
  VARIANT_GRID,
  VARIANT_LIST,
  VARIANT_HORIZONTAL,
  VARIANT_COLUMNS,
  VARIANT_DUAL_LISTBOX,
  VARIANT_PICKLIST,
  VARIANT_DROPDOWN,
  VARIANT_RADIO
]);

const DROPZONE_AVAILABLE = "available";
const DROPZONE_SELECTED = "selected";

let GROUP_COUNTER = 0;

function valuesEqual(left = [], right = []) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export default class PflowMoleculePickerGroup extends LightningElement {
  @api items = [];
  @api variant = VARIANT_GRID;
  @api selectionMode = MODE_SINGLE;
  @api minSelections = 0;
  @api maxSelections;
  @api showSelectAll = false;
  @api enableSearch = false;
  @api previewMode = false;

  // Layout knobs. Card styling lives in pflowAtomVisualPick; this molecule
  // only composes cards into layout patterns and normalizes spacing tokens.
  @api gridMinWidth = "16rem";
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

  // Per-card size + aspect.
  @api size = "medium";
  @api iconSize = "large";
  @api aspectRatio = "1:1";

  // Badge presentation.
  @api badgePosition = "bottom-inline";
  @api badgeVariant = "neutral";
  @api badgeShape = "pill";

  // Fixed column count for grid variant. null/undefined/0 = auto-fill.
  @api columns;

  // Pass-through card styling knobs.
  @api selectionIndicator = "checkmark";
  @api elevation = "outlined";
  @api pattern = "none";
  @api patternTone = "neutral";
  @api patternHoverTone = "neutral";
  @api patternSelectedTone = "brand";
  @api patternDisabledTone = "neutral";
  @api cornerStyle = "none";
  @api cornerTone = "neutral";
  @api surfaceStyle = "solid";
  @api surfaceTone = "neutral";
  @api surfaceHoverTone = "neutral";
  @api surfaceSelectedTone = "brand";
  @api surfaceDisabledTone = "neutral";
  @api iconDecor = "none";
  @api iconStyle = "filled";
  @api iconShading = "flat";
  @api iconTone = "neutral";
  @api iconGlyphTone;
  @api iconGlyphToneHex = "";
  @api iconToneHex = "";
  @api patternToneHex = "";
  @api patternHoverToneHex = "";
  @api patternSelectedToneHex = "";
  @api patternDisabledToneHex = "";
  @api cornerToneHex = "";
  @api surfaceToneHex = "";
  @api surfaceHoverToneHex = "";
  @api surfaceSelectedToneHex = "";
  @api surfaceDisabledToneHex = "";
  @api badgeVariantHex = "";
  @api showIcons;
  @api showBadges;
  @api allowManualInput = false;
  @api manualInputLabel = "Other";
  @api manualInputMinLength = 0;
  @api manualInputMaxLength;

  _selectedValues = [];
  _manualInputValue = "";
  @track _searchTerm = "";
  @track _dragOverZone = "";
  @track _dualAvailableValues = [];
  @track _dualSelectedValues = [];
  @track _picklistOpen = false;
  _dragValue = "";
  _groupName = `pflow-group-${++GROUP_COUNTER}`;

  @api
  get selectedValues() {
    return this._selectedValues;
  }
  set selectedValues(v) {
    this._selectedValues = Array.isArray(v) ? [...v] : [];
  }

  @api
  get manualInputValue() {
    return this._manualInputValue;
  }
  set manualInputValue(v) {
    this._manualInputValue = v === undefined || v === null ? "" : String(v);
  }

  get resolvedVariant() {
    const raw = VALID_VARIANTS.has(this.variant) ? this.variant : VARIANT_GRID;
    return raw === VARIANT_DROPDOWN ? VARIANT_PICKLIST : raw;
  }

  get isMulti() {
    return this.selectionMode === MODE_MULTI;
  }
  get isList() {
    return this.resolvedVariant === VARIANT_LIST;
  }
  get isColumns() {
    return this.resolvedVariant === VARIANT_COLUMNS;
  }
  get isDualListbox() {
    return this.resolvedVariant === VARIANT_DUAL_LISTBOX;
  }
  get isPicklist() {
    return this.resolvedVariant === VARIANT_PICKLIST;
  }
  get isRadio() {
    return this.resolvedVariant === VARIANT_RADIO;
  }
  get isTransferLayout() {
    return this.isColumns || this.isDualListbox;
  }
  get isBasicCardLayout() {
    return !this.isTransferLayout && !this.isPicklist && !this.isRadio;
  }
  get isCardLayout() {
    return true;
  }
  get showOuterSearch() {
    return this.enableSearch && !this.isPicklist && !this.isTransferLayout;
  }

  get filteredItems() {
    const base = Array.isArray(this.items) ? this.items : [];
    if (!this.enableSearch || !this._searchTerm) return base;
    return filterItems(base, this._searchTerm);
  }

  get selectedValueSet() {
    return new Set(this._selectedValues);
  }

  get decoratedItems() {
    const selected = this.selectedValueSet;
    const maxReached = this.maxReached(selected.size);
    return this.filteredItems.map((item) =>
      this.decorateCardItem(item, selected.has(item.value), maxReached)
    );
  }

  get transferAvailableItems() {
    const selected = this.selectedValueSet;
    const maxReached = this.maxReached(selected.size);
    const active = this.dualAvailableValueSet;
    return this.filteredItems
      .filter((item) => !selected.has(item.value))
      .map((item) =>
        this.decorateCardItem(item, false, maxReached, active.has(item.value))
      );
  }

  get transferSelectedItems() {
    const allItems = Array.isArray(this.items) ? this.items : [];
    const byValue = new Map(allItems.map((item) => [item.value, item]));
    const active = this.dualSelectedValueSet;
    return this._selectedValues
      .map((value) => byValue.get(value))
      .filter(Boolean)
      .map((item) =>
        this.decorateCardItem(item, true, false, active.has(item.value))
      );
  }

  get radioItems() {
    return this.decoratedItems.map((item) => ({
      ...item,
      _radioClass: [
        "pflow-radio-card",
        this.isMulti ? "pflow-radio-card_multi" : "",
        item._selected ? "pflow-radio-card_selected" : "",
        item._disabled ? "pflow-radio-card_disabled" : ""
      ]
        .filter(Boolean)
        .join(" ")
    }));
  }

  get picklistItems() {
    return this.decoratedItems.map((item) => ({
      ...item,
      _class: [
        "pflow-picklist__item",
        item._selected ? "pflow-picklist__item_selected" : ""
      ]
        .filter(Boolean)
        .join(" ")
    }));
  }

  get hasPicklistItems() {
    return this.picklistItems.length > 0;
  }

  get hasAvailableItems() {
    return this.transferAvailableItems.length > 0;
  }

  get hasSelectedItems() {
    return this.transferSelectedItems.length > 0;
  }

  get availableCountLabel() {
    const count = this.transferAvailableItems.length;
    return `${count} available`;
  }

  get selectedCountLabel() {
    const count = this.transferSelectedItems.length;
    return `${count} selected`;
  }

  get dualAvailableValueSet() {
    return new Set(this._dualAvailableValues);
  }

  get dualSelectedValueSet() {
    return new Set(this._dualSelectedValues);
  }

  get availablePanelLabel() {
    return this.isColumns ? "Available cards" : "Available";
  }

  get selectedPanelLabel() {
    return this.isColumns ? "Selected cards" : "Chosen";
  }

  get availablePanelAriaLabel() {
    return this.isColumns ? "Available card column" : "Available options";
  }

  get selectedPanelAriaLabel() {
    return this.isColumns ? "Selected card column" : "Chosen options";
  }

  get availableEmptyMessage() {
    return this.isColumns ? "No available cards." : "No available options.";
  }

  get selectedEmptyMessage() {
    return this.isColumns ? "Drop selected cards here." : "Move choices here.";
  }

  decorateCardItem(item, isSelected, maxReached, active = false) {
    const isNone = item.value === "";
    const isManual = item.value === MANUAL_INPUT_VALUE;
    const disabled =
      Boolean(item.disabled) || (!isNone && maxReached && !isSelected);
    return {
      ...item,
      _selected: isSelected,
      _disabled: disabled,
      _draggable: this.isColumns && !disabled && !isNone && !isManual,
      _active: active,
      _class: [
        "pflow-transfer__item",
        active ? "pflow-transfer__item_active" : "",
        disabled ? "pflow-transfer__item_disabled" : "",
        this.isColumns ? "pflow-transfer__item_draggable" : ""
      ]
        .filter(Boolean)
        .join(" ")
    };
  }

  maxReached(selectedCount) {
    return (
      this.isMulti &&
      this.hasMaxSelections &&
      selectedCount >= Number(this.maxSelections)
    );
  }

  get hasMaxSelections() {
    return (
      this.maxSelections !== undefined &&
      this.maxSelections !== null &&
      this.maxSelections !== ""
    );
  }

  get showToolbar() {
    return this.isMulti && this.filteredItems.length > 0 && !this.previewMode;
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

  get transferClass() {
    return [
      "pflow-transfer",
      `pflow-transfer_${this.resolvedVariant}`,
      this.isDualListbox ? "pflow-transfer_has-controls" : ""
    ]
      .filter(Boolean)
      .join(" ");
  }

  get availablePanelClass() {
    return this.transferPanelClass(DROPZONE_AVAILABLE);
  }

  get selectedPanelClass() {
    return this.transferPanelClass(DROPZONE_SELECTED);
  }

  transferPanelClass(zone) {
    return [
      "pflow-transfer__panel",
      this._dragOverZone === zone ? "pflow-transfer__panel_drop" : ""
    ]
      .filter(Boolean)
      .join(" ");
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
    const cols = Number(this.columns);
    if (Number.isFinite(cols) && cols >= 1 && cols <= 6) {
      parts.push(`--pflow-group-cols: ${cols}`);
    }
    return parts.join("; ");
  }

  get isEmpty() {
    return (
      !this.previewMode &&
      this.isBasicCardLayout &&
      this.decoratedItems.length === 0
    );
  }

  get isRadioEmpty() {
    return (
      !this.previewMode && this.isRadio && this.decoratedItems.length === 0
    );
  }

  get atomVariant() {
    return this.isList ||
      this.isTransferLayout ||
      this.isRadio ||
      this.isPicklist
      ? VARIANT_LIST
      : VARIANT_GRID;
  }

  get selectedPicklistItem() {
    const source = Array.isArray(this.items) ? this.items : [];
    const item = source.find(
      (entry) => entry.value === this._selectedValues[0]
    );
    return item ? this.decorateCardItem(item, true, false) : null;
  }

  get hasPicklistSelection() {
    return this._selectedValues.length > 0;
  }

  get isPicklistSingle() {
    return this.isPicklist && !this.isMulti;
  }

  get showPicklistSelectedCard() {
    return this.isPicklistSingle && Boolean(this.selectedPicklistItem);
  }

  get picklistAriaMultiselectable() {
    return String(this.isMulti);
  }

  get picklistSelectionLabel() {
    if (!this.isMulti) return "";
    const selected = this.selectedItemsInOrder();
    if (selected.length === 0) return "";
    const labels = selected.map((item) => item.label).filter(Boolean);
    const visible = labels.slice(0, 2).join(", ");
    const extra = labels.length - 2;
    return extra > 0 ? `${visible} +${extra} more` : visible;
  }

  get picklistClass() {
    return ["pflow-picklist", this._picklistOpen ? "pflow-picklist_open" : ""]
      .filter(Boolean)
      .join(" ");
  }

  get picklistExpanded() {
    return String(this._picklistOpen);
  }

  get picklistChevron() {
    return this._picklistOpen ? "chevron-up" : "chevron-down";
  }

  get picklistPlaceholder() {
    return this.enableSearch && this._searchTerm
      ? "No matching options"
      : "Choose an option";
  }

  get showManualInput() {
    return this._selectedValues.includes(MANUAL_INPUT_VALUE);
  }

  get resolvedManualInputLabel() {
    const label = this.manualInputLabel;
    return label && String(label).trim() ? String(label) : "Other";
  }

  get manualInputHelpText() {
    const min = Number(this.manualInputMinLength || 0);
    const max = this.manualInputMaxLength;
    if (min > 0 && max) return `${min}-${max} characters`;
    if (min > 0) return `At least ${min} characters`;
    if (max) return `Up to ${max} characters`;
    return "";
  }

  get hasManualInputHelpText() {
    return Boolean(this.manualInputHelpText);
  }

  get dualAddDisabled() {
    return this._dualAvailableValues.length === 0;
  }

  get dualRemoveDisabled() {
    return this._dualSelectedValues.length === 0;
  }

  get dualAddAllDisabled() {
    return !this.isMulti || !this.hasAvailableItems;
  }

  get dualRemoveAllDisabled() {
    return !this.hasSelectedItems;
  }

  handleSearch(event) {
    this._searchTerm = event.target.value || "";
  }

  handleManualInput(event) {
    this._manualInputValue = event.target.value || "";
    if (this.showManualInput && !this.previewMode) this.fireChange();
  }

  handleCardSelect(event) {
    const value = event.detail?.value;
    if (value === undefined || value === null) return;

    const changed = this.isMulti
      ? this.toggleMulti(value)
      : this.setSelectedValues(value === "" ? [] : [value]);
    if (changed && !this.previewMode) this.fireChange();
  }

  handleAvailableCardSelect(event) {
    event.stopPropagation();
    const value = event.detail?.value;
    if (value === undefined || value === null) return;
    if (this.isDualListbox) {
      this.toggleDualBuffer("_dualAvailableValues", value);
      this._dualSelectedValues = [];
      return;
    }
    const changed = this.addValue(value);
    if (changed && !this.previewMode) this.fireChange();
  }

  handleSelectedCardSelect(event) {
    event.stopPropagation();
    const value = event.detail?.value;
    if (value === undefined || value === null) return;
    if (this.isDualListbox) {
      this.toggleDualBuffer("_dualSelectedValues", value);
      this._dualAvailableValues = [];
      return;
    }
    const changed = this.removeValue(value);
    if (changed && !this.previewMode) this.fireChange();
  }

  handlePicklistToggle() {
    this._picklistOpen = !this._picklistOpen;
  }

  handlePicklistKeydown(event) {
    if (event.key === "Escape") {
      this._picklistOpen = false;
      event.stopPropagation();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handlePicklistToggle();
    }
  }

  handlePicklistCardSelect(event) {
    event.stopPropagation();
    const value = event.detail?.value;
    if (value === undefined || value === null) return;
    const changed = this.isMulti
      ? this.toggleMulti(value)
      : this.setSelectedValues(value === "" ? [] : [value]);
    this._picklistOpen = this.isMulti;
    if (changed && !this.previewMode) this.fireChange();
  }

  toggleDualBuffer(property, value) {
    const item = this.findItem(value);
    if (!item || item.disabled) return;
    const current = new Set(this[property]);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    this[property] = [...current];
  }

  handleDualAdd() {
    const changed = this.addValues(this._dualAvailableValues);
    this._dualAvailableValues = [];
    if (changed && !this.previewMode) this.fireChange();
  }

  handleDualRemove() {
    const changed = this.removeValues(this._dualSelectedValues);
    this._dualSelectedValues = [];
    if (changed && !this.previewMode) this.fireChange();
  }

  handleDualAddAll() {
    const values = this.transferAvailableItems
      .filter(
        (item) =>
          !item._disabled &&
          item.value !== "" &&
          item.value !== MANUAL_INPUT_VALUE
      )
      .map((item) => item.value);
    const changed = this.addValues(values);
    this._dualAvailableValues = [];
    if (changed && !this.previewMode) this.fireChange();
  }

  handleDualRemoveAll() {
    const changed = this.removeValues([...this._selectedValues]);
    this._dualSelectedValues = [];
    if (changed && !this.previewMode) this.fireChange();
  }

  toggleMulti(value) {
    if (this.isSelected(value)) {
      return this.removeValue(value);
    }
    return this.addValue(value);
  }

  addValue(value) {
    if (value === "") {
      return this.setSelectedValues([]);
    }
    if (value === MANUAL_INPUT_VALUE) {
      if (!this.isMulti) {
        return this.setSelectedValues([MANUAL_INPUT_VALUE]);
      }
      if (
        this.hasMaxSelections &&
        this._selectedValues.length >= Number(this.maxSelections)
      ) {
        return false;
      }
      return this.setSelectedValues([...this._selectedValues, value]);
    }
    const item = this.findItem(value);
    if (!item || item.disabled || this.isSelected(value)) return false;
    if (!this.isMulti) {
      return this.setSelectedValues([value]);
    }
    if (
      this.hasMaxSelections &&
      this._selectedValues.length >= Number(this.maxSelections)
    ) {
      return false;
    }
    return this.setSelectedValues([...this._selectedValues, value]);
  }

  addValues(values) {
    if (values.includes("")) {
      return this.setSelectedValues([]);
    }
    return values.reduce(
      (changed, value) => this.addValue(value) || changed,
      false
    );
  }

  removeValue(value) {
    const item = this.findItem(value);
    if (!this.isSelected(value) || item?.disabled) return false;
    return this.setSelectedValues(
      this._selectedValues.filter((current) => current !== value)
    );
  }

  removeValues(values) {
    return values.reduce(
      (changed, value) => this.removeValue(value) || changed,
      false
    );
  }

  setSelectedValues(values) {
    if (valuesEqual(this._selectedValues, values)) return false;
    this._selectedValues = [...values];
    return true;
  }

  isSelected(value) {
    return this._selectedValues.includes(value);
  }

  findItem(value) {
    const source = Array.isArray(this.items) ? this.items : [];
    return source.find((item) => item.value === value);
  }

  handleDragStart(event) {
    const value = event.currentTarget?.dataset?.value;
    if (!value || !this.isColumns) return;
    this._dragValue = value;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", value);
    }
  }

  handleDragOver(event) {
    if (!this.isColumns) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    this._dragOverZone = event.currentTarget?.dataset?.zone || "";
  }

  handleDragLeave(event) {
    if (event.currentTarget?.contains(event.relatedTarget)) return;
    this._dragOverZone = "";
  }

  handleDrop(event) {
    if (!this.isColumns) return;
    event.preventDefault();
    const zone = event.currentTarget?.dataset?.zone;
    const value =
      event.dataTransfer?.getData("text/plain") || this._dragValue || "";
    this._dragValue = "";
    this._dragOverZone = "";
    if (!value) return;

    const changed =
      zone === DROPZONE_SELECTED
        ? this.addValue(value)
        : zone === DROPZONE_AVAILABLE
          ? this.removeValue(value)
          : false;
    if (changed && !this.previewMode) this.fireChange();
  }

  handleSelectAll() {
    if (!this.isMulti) return;
    const allValues = this.filteredItems
      .filter(
        (item) =>
          !item.disabled &&
          item.value !== "" &&
          item.value !== MANUAL_INPUT_VALUE
      )
      .map((item) => item.value);
    const nextValues = this.hasMaxSelections
      ? allValues.slice(0, Number(this.maxSelections))
      : allValues;
    const changed = this.setSelectedValues(nextValues);
    this._dualAvailableValues = [];
    this._dualSelectedValues = [];
    if (changed && !this.previewMode) this.fireChange();
  }

  handleClearAll() {
    if (!this.isMulti) return;
    const changed = this.setSelectedValues([]);
    this._dualAvailableValues = [];
    this._dualSelectedValues = [];
    if (changed && !this.previewMode) this.fireChange();
  }

  selectedItemsInOrder() {
    const source = Array.isArray(this.items) ? this.items : [];
    const byValue = new Map(source.map((item) => [item.value, item]));
    return this._selectedValues
      .map((value) => byValue.get(value))
      .filter(Boolean);
  }

  fireChange() {
    this.dispatchEvent(
      new CustomEvent("selectionchange", {
        detail: {
          values: [...this._selectedValues],
          items: this.selectedItemsInOrder(),
          manualValue: this._manualInputValue
        },
        bubbles: true,
        composed: false
      })
    );
  }
}
