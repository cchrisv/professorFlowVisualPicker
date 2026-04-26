import { api, LightningElement, track, wire } from "lwc";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import { defaultPickerConfig } from "c/pflowUtilityPickerConfigDefaults";
import {
  buildSobjectConfigForQuery,
  resolvedStringValuePreview as buildResolvedStringValuePreview,
  resolveStringValuesFromBuilderContext,
  stringCollectionSamples
} from "c/pflowUtilityPickerConfigState";
import {
  ORDER_DIRECTION_OPTIONS,
  OVERRIDE_FIELDS,
  PICKLIST_VALUE_SOURCE_OPTIONS,
  SORT_BY_OPTIONS,
  SORT_DIRECTION_OPTIONS,
  SOURCE_TILES
} from "c/pflowUtilityPickerConfigOptions";
import searchSObjectTypes from "@salesforce/apex/PFlowCpeChoiceEngineController.searchSObjectTypes";
import searchLookupDatasetFieldsForObject from "@salesforce/apex/PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject";
import queryItems from "@salesforce/apex/PflowPickerController.queryItems";

export default class PflowOrganismPickerDataConfig extends LightningElement {
  @api config;
  @api sourceRecordsRef = "";
  @api sourceStringsRef = "";
  @api builderContext;
  @api automaticOutputVariables;

  @track _picklistValues = [];
  @track _recordTypeOptions = [];
  @track _sobjectSampleRows = [];
  @track _sampleLoadError = "";
  @track _isLoadingSample = false;
  @track _overrideSearch = "";
  @track _expandedOverrideValue = "";
  @track _bulkSelection = {};
  @track _bulkEditDraft = { icon: "", sublabel: "", badge: "", helpText: "" };

  get _config() {
    return this.config || defaultPickerConfig();
  }
  set _config(value) {
    this.dispatchEvent(
      new CustomEvent("configpatch", { detail: { path: [], value } })
    );
  }

  get _sourceRecordsRef() {
    return this.sourceRecordsRef || "";
  }
  set _sourceRecordsRef(value) {
    this.dispatchRefChange("sourceRecordsRef", value);
  }
  get _sourceStringsRef() {
    return this.sourceStringsRef || "";
  }
  set _sourceStringsRef(value) {
    this.dispatchRefChange("sourceStringsRef", value);
  }

  get isDataSection() {
    return true;
  }
  get hasDataSource() {
    return Boolean(this._config.dataSource);
  }
  get isPicklistMode() {
    return this._config.dataSource === "picklist";
  }
  get isCollectionMode() {
    return this._config.dataSource === "collection";
  }
  get isStringCollectionMode() {
    return this._config.dataSource === "stringCollection";
  }
  get isSObjectMode() {
    return this._config.dataSource === "sobject";
  }
  get isCustomMode() {
    return this._config.dataSource === "custom";
  }
  get canCustomizeValues() {
    return (
      this.isPicklistMode || this.isSObjectMode || this.isStringCollectionMode
    );
  }

  get sourceTiles() {
    const active = this._config.dataSource;
    return SOURCE_TILES.map((tile) => ({
      ...tile,
      id: tile.value,
      _selected: tile.value === active
    }));
  }
  get sourceKindLabel() {
    return (
      SOURCE_TILES.find((tile) => tile.value === this._config.dataSource)
        ?.label || ""
    );
  }
  get sourceSetupTitle() {
    return this.sourceKindLabel
      ? `${this.sourceKindLabel} setup`
      : "Source setup";
  }
  get sourceKindIcon() {
    return (
      SOURCE_TILES.find((tile) => tile.value === this._config.dataSource)
        ?.icon || "database"
    );
  }
  get sourceSetupSubtitle() {
    if (this.isPicklistMode)
      return "Point to an object and pick its picklist field.";
    if (this.isCollectionMode)
      return "Bind a Flow record collection and map fields to the tile slots.";
    if (this.isStringCollectionMode)
      return "Bind a Flow String[] variable — each string becomes a tile.";
    if (this.isSObjectMode)
      return "Query an object and map the result fields into the tile.";
    if (this.isCustomMode)
      return "Head to the Items section to type your options directly.";
    return "";
  }
  get picklistValueSourceOptions() {
    return PICKLIST_VALUE_SOURCE_OPTIONS;
  }
  get sortByOptions() {
    return SORT_BY_OPTIONS;
  }
  get sortDirectionOptions() {
    return SORT_DIRECTION_OPTIONS;
  }
  get orderDirectionOptions() {
    return ORDER_DIRECTION_OPTIONS;
  }

  handleSourceTileChange(event) {
    const value = event.detail?.value;
    if (value) this._config = { ...this._config, dataSource: value };
  }
  async handlePicklistObjectSearch(event) {
    await this.runSObjectSearch(event.detail.searchTerm, event.target);
  }
  handlePicklistObjectSelect(event) {
    const selectedId = event.detail.selectedIds?.[0];
    this._config = {
      ...this._config,
      picklist: {
        ...this._config.picklist,
        objectApiName: selectedId || "",
        fieldApiName: ""
      }
    };
  }
  handlePicklistFieldChange(event) {
    this._config = {
      ...this._config,
      picklist: {
        ...this._config.picklist,
        fieldApiName: event.detail.fieldApiName || ""
      }
    };
  }
  handleRecordTypeIdChange(event) {
    this._config = {
      ...this._config,
      picklist: {
        ...this._config.picklist,
        recordTypeId: this._readValue(event)
      }
    };
  }
  handleRecordTypeComboChange(event) {
    this._config = {
      ...this._config,
      picklist: {
        ...this._config.picklist,
        recordTypeId: event.detail?.value || ""
      }
    };
  }
  handlePicklistValueSourceChange(event) {
    this._config = {
      ...this._config,
      picklist: {
        ...this._config.picklist,
        valueSource: event.detail.value || "apiName"
      }
    };
  }

  handleCollectionVariableChange(event) {
    this._sourceRecordsRef = event.detail.newValue || "";
  }
  handleStringCollectionVariableChange(event) {
    this._sourceStringsRef = event.detail.newValue || "";
  }
  handleCollectionFieldMapChange(event) {
    const field = event.currentTarget.dataset.field;
    const value = event.detail.fieldApiName || event.detail.value || "";
    this._config = {
      ...this._config,
      collection: {
        ...this._config.collection,
        fieldMap: { ...this._config.collection.fieldMap, [field]: value }
      }
    };
  }
  async handleSObjectSearch(event) {
    await this.runSObjectSearch(event.detail.searchTerm, event.target);
  }
  handleSObjectSelect(event) {
    const selectedId = event.detail.selectedIds?.[0];
    this._config = {
      ...this._config,
      sobject: {
        ...this._config.sobject,
        sObjectApiName: selectedId || "",
        whereClause: "",
        orderByField: ""
      }
    };
    this._sobjectSampleRows = [];
  }
  handleWhereChange(event) {
    this._config = {
      ...this._config,
      sobject: {
        ...this._config.sobject,
        whereClause: event.detail.value || ""
      }
    };
  }
  handleOrderFieldSearch(event) {
    const lookup = event.currentTarget;
    const objectApiName = this._config.sobject?.sObjectApiName || "";
    if (!objectApiName) {
      lookup.setSearchResults([]);
      return;
    }
    const searchKey =
      event.detail.rawSearchTerm != null
        ? String(event.detail.rawSearchTerm)
        : "";
    searchLookupDatasetFieldsForObject({ objectApiName, searchKey })
      .then((rows) => lookup.setSearchResults(rows || []))
      .catch(() => lookup.setSearchResults([]));
  }
  handleOrderFieldSelectionChange(event) {
    const selection = event.currentTarget.getSelection?.();
    const row = Array.isArray(selection) ? selection[0] : selection;
    this._config = {
      ...this._config,
      sobject: {
        ...this._config.sobject,
        orderByField: row?.id ? String(row.id) : ""
      }
    };
  }
  handleOrderDirectionChange(event) {
    this._config = {
      ...this._config,
      sobject: {
        ...this._config.sobject,
        orderByDirection: event.detail.value || "DESC"
      }
    };
  }
  handleLimitChange(event) {
    const raw = event.detail.value;
    let limit = null;
    if (raw !== "" && raw != null) {
      const n = Math.min(Math.max(parseInt(raw, 10) || 0, 0), 2000);
      limit = n > 0 ? n : null;
    }
    this._config = {
      ...this._config,
      sobject: { ...this._config.sobject, limit }
    };
  }
  handleSObjectFieldChange(event) {
    const field = event.currentTarget.dataset.field;
    this._config = {
      ...this._config,
      sobject: {
        ...this._config.sobject,
        [field]: event.detail.fieldApiName || ""
      }
    };
  }
  async runSObjectSearch(searchTerm, lookupComponent) {
    try {
      const results = await searchSObjectTypes({ searchKey: searchTerm || "" });
      lookupComponent?.setSearchResults(
        (results || []).map((row) => ({
          id: row.value,
          title: row.label,
          subtitle: row.subtitle,
          icon: row.icon,
          sObjectType: row.sObjectType
        }))
      );
    } catch {
      lookupComponent?.setSearchResults([]);
    }
  }

  get picklistObjectSelection() {
    const objectApiName = this._config.picklist?.objectApiName;
    return objectApiName
      ? [{ id: objectApiName, title: objectApiName, icon: "sparkle" }]
      : [];
  }
  get sobjectSelection() {
    const objectApiName = this._config.sobject?.sObjectApiName;
    return objectApiName
      ? [{ id: objectApiName, title: objectApiName, icon: "sparkle" }]
      : [];
  }
  get orderByFieldSelection() {
    const field = this._config.sobject?.orderByField;
    return field
      ? { id: field, title: field, subtitle: "", icon: "type" }
      : null;
  }
  get picklistObjectApiName() {
    return this.isPicklistMode
      ? this._config.picklist?.objectApiName || null
      : null;
  }
  get picklistFieldRef() {
    const obj = this._config.picklist?.objectApiName;
    const field = this._config.picklist?.fieldApiName;
    return this.isPicklistMode && obj && field ? `${obj}.${field}` : undefined;
  }
  get picklistRecordTypeId() {
    return this._config.picklist?.recordTypeId || "012000000000000AAA";
  }
  get picklistValueSource() {
    return this._config.picklist?.valueSource || "apiName";
  }
  get recordTypeOptions() {
    return this._recordTypeOptions;
  }
  get hasRecordTypeOptions() {
    return this._recordTypeOptions.length > 1;
  }
  get recordTypeValue() {
    return this._config.picklist?.recordTypeId || "";
  }
  get hasPicklistValues() {
    return this._picklistValues.length > 0;
  }
  get hasSampleRows() {
    return this._sobjectSampleRows.length > 0;
  }

  @wire(getObjectInfo, { objectApiName: "$picklistObjectApiName" })
  wiredObjectInfo({ data }) {
    this._recordTypeOptions = data?.recordTypeInfos
      ? Object.values(data.recordTypeInfos)
          .filter((recordType) => recordType.available !== false)
          .sort((a, b) => {
            if (a.master === b.master) {
              return String(a.name || "").localeCompare(String(b.name || ""));
            }
            return a.master ? -1 : 1;
          })
          .map((recordType) => ({
            label: recordType.master
              ? `${recordType.name} (default)`
              : recordType.name,
            value: recordType.recordTypeId
          }))
      : [];
  }

  @wire(getPicklistValues, {
    recordTypeId: "$picklistRecordTypeId",
    fieldApiName: "$picklistFieldRef"
  })
  wiredPicklistValues({ data }) {
    this._picklistValues = data?.values || [];
  }

  get stringCollectionSampleRaw() {
    return this._config.stringCollection?.sampleValues || "";
  }
  get resolvedStringCollectionValues() {
    return resolveStringValuesFromBuilderContext(
      this.builderContext,
      this._sourceStringsRef
    );
  }
  get hasResolvedStringValues() {
    return this.resolvedStringCollectionValues.length > 0;
  }
  get stringCollectionSampleStrings() {
    return stringCollectionSamples(
      this._config,
      this.builderContext,
      this._sourceStringsRef
    );
  }
  get resolvedStringValuePreview() {
    return buildResolvedStringValuePreview(
      this.builderContext,
      this._sourceStringsRef
    );
  }
  get resolvedStringCountLabel() {
    const count = this.resolvedStringCollectionValues.length;
    return `${count} value${count === 1 ? "" : "s"} detected`;
  }
  handleStringSamplesChange(event) {
    this._config = {
      ...this._config,
      stringCollection: {
        ...(this._config.stringCollection || {}),
        sampleValues: event.target?.value ?? ""
      }
    };
  }

  get customItems() {
    return (this._config.custom?.items || []).map((item, index, items) => ({
      ...item,
      index,
      hidden: item.hidden === true,
      canMoveUp: index === 0,
      canMoveDown: index === items.length - 1
    }));
  }
  handleCustomAddRow() {
    const items = [
      ...(this._config.custom?.items || []),
      { label: "", value: "", sublabel: "", icon: "", badge: "", helpText: "" }
    ];
    this._config = { ...this._config, custom: { items } };
  }
  handleCustomRemoveRow(event) {
    this.updateCustomItems((items) =>
      items.splice(Number(event.currentTarget.dataset.index), 1)
    );
  }
  handleCustomDuplicateRow(event) {
    this.updateCustomItems((items) => {
      const index = Number(event.currentTarget.dataset.index);
      items.splice(index + 1, 0, JSON.parse(JSON.stringify(items[index])));
    });
  }
  handleCustomMoveUp(event) {
    const index = Number(event.currentTarget.dataset.index);
    if (index > 0) this.swapCustomItems(index, index - 1);
  }
  handleCustomMoveDown(event) {
    const index = Number(event.currentTarget.dataset.index);
    const items = this._config.custom?.items || [];
    if (index < items.length - 1) this.swapCustomItems(index, index + 1);
  }
  handleCustomCellChange(event) {
    const index = Number(event.currentTarget.dataset.index);
    const field = event.currentTarget.dataset.field;
    this.updateCustomItems((items) => {
      items[index] = { ...items[index], [field]: this._readValue(event) };
    });
  }
  handleCustomIconChange(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.updateCustomItems((items) => {
      items[index] = { ...items[index], icon: event.detail.iconName || "" };
    });
  }
  handleCustomHiddenToggle(event) {
    const index = Number(event.currentTarget.dataset.index);
    const checked = event.detail?.checked ?? event.target?.checked ?? false;
    this.updateCustomItems((items) => {
      items[index] = { ...items[index], hidden: Boolean(checked) };
    });
  }
  updateCustomItems(mutator) {
    const items = [...(this._config.custom?.items || [])];
    mutator(items);
    this._config = { ...this._config, custom: { items } };
  }
  swapCustomItems(from, to) {
    this.updateCustomItems((items) => {
      [items[from], items[to]] = [items[to], items[from]];
    });
  }

  get _allOverrideRows() {
    const overrides = this._config.overrides || {};
    let source = [];
    if (this.isPicklistMode) {
      const useLabel = this.picklistValueSource === "label";
      source = this._picklistValues.map((value) => ({
        value: useLabel ? value.label : value.value,
        originalLabel: value.label
      }));
    } else if (this.isSObjectMode) {
      source = this._sobjectSampleRows.map((dto) => ({
        value: dto.value || dto.id,
        originalLabel: dto.label || dto.id
      }));
    } else if (this.isStringCollectionMode) {
      source = this.stringCollectionSampleStrings.map((value) => ({
        value,
        originalLabel: value
      }));
    }
    return source.map((row) => {
      const override = overrides[row.value] || {};
      return {
        value: row.value,
        originalLabel: row.originalLabel,
        label: override.label || "",
        icon: override.icon || "",
        sublabel: override.sublabel || "",
        badge: override.badge || "",
        helpText: override.helpText || "",
        hidden: override.hidden === true,
        hasCustom: OVERRIDE_FIELDS.some((field) => {
          return field === "hidden"
            ? override.hidden === true
            : Boolean(override[field]);
        })
      };
    });
  }
  get overrideRows() {
    const term = this._overrideSearch.trim().toLowerCase();
    const rows = term
      ? this._allOverrideRows.filter((row) =>
          `${row.value} ${row.originalLabel} ${row.label}`
            .toLowerCase()
            .includes(term)
        )
      : this._allOverrideRows;
    return rows.map((row) => ({
      ...row,
      previewIcon: row.icon || "circle",
      previewLabel: row.label || row.originalLabel,
      assistiveLabel: `Edit overrides for ${row.originalLabel}`,
      summaryItems: this.overrideSummaryItems(row),
      isExpanded: row.value === this._expandedOverrideValue,
      ariaExpanded:
        row.value === this._expandedOverrideValue ? "true" : "false",
      isSelected: Boolean(this._bulkSelection[row.value]),
      rowClass: [
        "pflow-overrides__row",
        row.value === this._expandedOverrideValue
          ? "pflow-overrides__row_expanded"
          : "",
        row.hasCustom ? "pflow-overrides__row_customized" : "",
        this._bulkSelection[row.value] ? "pflow-overrides__row_selected" : ""
      ]
        .filter(Boolean)
        .join(" ")
    }));
  }
  get bulkSelectionCount() {
    return Object.values(this._bulkSelection).filter(Boolean).length;
  }
  get hasBulkSelection() {
    return this.bulkSelectionCount > 0;
  }
  get bulkSelectionLabel() {
    return `${this.bulkSelectionCount} selected`;
  }
  get overrideTotalCount() {
    return this._allOverrideRows.length;
  }
  get customizedOverrideCount() {
    return this._allOverrideRows.filter((row) => row.hasCustom).length;
  }
  get hiddenOverrideCount() {
    return this._allOverrideRows.filter((row) => row.hidden).length;
  }
  get filteredOverrideCount() {
    return this.overrideRows.length;
  }
  get hasFilteredOverrideRows() {
    return this.filteredOverrideCount > 0;
  }
  get hasNoFilteredOverrideRows() {
    return !this.hasFilteredOverrideRows;
  }
  get bulkDraftCount() {
    return Object.values(this._bulkEditDraft).filter(Boolean).length;
  }
  get canApplyBulk() {
    return this.hasBulkSelection && this.bulkDraftCount > 0;
  }
  get cannotApplyBulk() {
    return !this.canApplyBulk;
  }
  get overrideSourceLabel() {
    if (this.isPicklistMode) return "Picklist values";
    if (this.isSObjectMode) return "Sample rows";
    if (this.isStringCollectionMode) return "String values";
    return "Options";
  }
  get overrideGuideText() {
    if (this.isPicklistMode) {
      return "Choose a picklist field above, then tailor the values that Flow users will see.";
    }
    if (this.isSObjectMode) {
      return "Load a representative sample, then tune presentation details before runtime records arrive.";
    }
    if (this.isStringCollectionMode) {
      return "Use detected or seeded string values as anchors for icon, label, badge, and help text overrides.";
    }
    return "Tune individual options without changing the source data.";
  }
  get overrideMetrics() {
    return [
      {
        key: "available",
        label: this.overrideSourceLabel,
        value: String(this.overrideTotalCount)
      },
      {
        key: "customized",
        label: "Customized",
        value: String(this.customizedOverrideCount)
      },
      {
        key: "hidden",
        label: "Hidden",
        value: String(this.hiddenOverrideCount)
      },
      {
        key: "selected",
        label: "Selected",
        value: String(this.bulkSelectionCount)
      }
    ];
  }
  get overrideFlowSteps() {
    return [
      {
        key: "source",
        label: "Load values",
        detail: this.overrideSourceLabel,
        className: this.overrideTotalCount
          ? "pflow-overrides-flow__step pflow-overrides-flow__step_done"
          : "pflow-overrides-flow__step pflow-overrides-flow__step_active"
      },
      {
        key: "focus",
        label: "Focus rows",
        detail: this.filteredOverrideCount
          ? `${this.filteredOverrideCount} visible`
          : "No rows visible",
        className: this.hasFilteredOverrideRows
          ? "pflow-overrides-flow__step pflow-overrides-flow__step_active"
          : "pflow-overrides-flow__step"
      },
      {
        key: "customize",
        label: "Apply polish",
        detail: this.customizedOverrideCount
          ? `${this.customizedOverrideCount} customized`
          : "Open a row to edit",
        className: this.customizedOverrideCount
          ? "pflow-overrides-flow__step pflow-overrides-flow__step_done"
          : "pflow-overrides-flow__step"
      }
    ];
  }

  handleOverrideSearch(event) {
    this._overrideSearch = event.target.value || "";
  }
  handleToggleExpandRow(event) {
    const value = event.currentTarget.dataset.value;
    this._expandedOverrideValue =
      this._expandedOverrideValue === value ? "" : value;
  }
  handleToggleSelectRow(event) {
    const value = event.currentTarget.dataset.value;
    const next = { ...this._bulkSelection };
    if (next[value]) delete next[value];
    else next[value] = true;
    this._bulkSelection = next;
  }
  handleClearBulkSelection() {
    this._bulkSelection = {};
  }
  handleSelectAllFiltered() {
    const next = { ...this._bulkSelection };
    for (const row of this.overrideRows) next[row.value] = true;
    this._bulkSelection = next;
  }
  handleBulkDraftChange(event) {
    this._bulkEditDraft = {
      ...this._bulkEditDraft,
      [event.currentTarget.dataset.field]: this._readValue(event)
    };
  }
  handleBulkDraftIconChange(event) {
    this._bulkEditDraft = {
      ...this._bulkEditDraft,
      icon: event.detail?.iconName || ""
    };
  }
  handleApplyBulk() {
    if (!this.canApplyBulk) return;
    const overrides = { ...(this._config.overrides || {}) };
    for (const value of Object.keys(this._bulkSelection).filter(
      (key) => this._bulkSelection[key]
    )) {
      const next = { ...(overrides[value] || {}) };
      for (const field of ["icon", "sublabel", "badge", "helpText"]) {
        if (this._bulkEditDraft[field])
          next[field] = this._bulkEditDraft[field];
      }
      overrides[value] = next;
    }
    this._config = { ...this._config, overrides };
    this._bulkEditDraft = { icon: "", sublabel: "", badge: "", helpText: "" };
    this._bulkSelection = {};
  }
  handleOverrideCellChange(event) {
    this.setOverride(
      event.currentTarget.dataset.value,
      event.currentTarget.dataset.field,
      this._readValue(event)
    );
  }
  handleOverrideIconChange(event) {
    this.setOverride(
      event.currentTarget.dataset.value,
      "icon",
      event.detail?.iconName || ""
    );
  }
  handleOverrideHiddenToggle(event) {
    this.setOverride(
      event.currentTarget.dataset.value,
      "hidden",
      Boolean(event.detail?.checked ?? event.target?.checked)
    );
  }
  handleClearOverride(event) {
    const value = event.currentTarget.dataset.value;
    const overrides = { ...(this._config.overrides || {}) };
    delete overrides[value];
    this._config = { ...this._config, overrides };
  }
  setOverride(value, field, newValue) {
    if (!value) return;
    const nextForValue = {
      ...(this._config.overrides?.[value] || {}),
      [field]: newValue || ""
    };
    if (field === "hidden" && newValue !== true) {
      delete nextForValue.hidden;
    }
    const overrides = { ...(this._config.overrides || {}) };
    if (
      OVERRIDE_FIELDS.every((key) => {
        return key === "hidden"
          ? nextForValue.hidden !== true
          : !nextForValue[key];
      })
    )
      delete overrides[value];
    else overrides[value] = nextForValue;
    this._config = { ...this._config, overrides };
  }
  overrideSummaryItems(row) {
    const items = [];
    if (row.hidden) {
      items.push({
        key: "hidden",
        label: "Hidden",
        className:
          "slds-badge slds-theme_warning pflow-overrides-summary__badge"
      });
    }
    if (row.label) {
      items.push({
        key: "label",
        label: "Label",
        className: "slds-badge pflow-overrides-summary__badge"
      });
    }
    if (row.icon) {
      items.push({
        key: "icon",
        label: "Icon",
        className: "slds-badge pflow-overrides-summary__badge"
      });
    }
    if (row.sublabel) {
      items.push({
        key: "sublabel",
        label: "Subtitle",
        className: "slds-badge pflow-overrides-summary__badge"
      });
    }
    if (row.badge) {
      items.push({
        key: "badge",
        label: "Badge",
        className: "slds-badge pflow-overrides-summary__badge"
      });
    }
    if (row.helpText) {
      items.push({
        key: "helpText",
        label: "Help",
        className: "slds-badge pflow-overrides-summary__badge"
      });
    }
    if (!items.length) {
      items.push({
        key: "source",
        label: "Using source",
        className:
          "slds-badge slds-badge_lightest pflow-overrides-summary__badge"
      });
    }
    return items;
  }

  async handleLoadSObjectSample() {
    this._isLoadingSample = true;
    this._sampleLoadError = "";
    try {
      const dtos = await queryItems({
        configJson: JSON.stringify(buildSobjectConfigForQuery(this._config))
      });
      this._sobjectSampleRows = Array.isArray(dtos) ? dtos : [];
    } catch (error) {
      this._sampleLoadError =
        error?.body?.message || error?.message || "Could not load sample rows.";
      this._sobjectSampleRows = [];
    } finally {
      this._isLoadingSample = false;
    }
  }

  get displaySortBy() {
    return this._config.display?.sortBy || "none";
  }
  get displaySortDirection() {
    return this._config.display?.sortDirection || "asc";
  }
  get displayLimit() {
    return this._config.display?.limit ?? "";
  }
  get displaySortEnabled() {
    return this.displaySortBy !== "none";
  }
  handleDisplaySortByChange(event) {
    this._config = {
      ...this._config,
      display: {
        ...(this._config.display || {}),
        sortBy: event.detail?.value || "none"
      }
    };
  }
  handleDisplaySortDirectionChange(event) {
    this._config = {
      ...this._config,
      display: {
        ...(this._config.display || {}),
        sortDirection: event.detail?.value || "asc"
      }
    };
  }
  handleDisplayLimitChange(event) {
    const raw = event.target?.value;
    this._config = {
      ...this._config,
      display: {
        ...(this._config.display || {}),
        limit: raw === "" || raw == null ? null : Math.max(0, Number(raw))
      }
    };
  }

  dispatchRefChange(name, value) {
    this.dispatchEvent(
      new CustomEvent("refchange", { detail: { name, value: value || "" } })
    );
  }
  _readValue(event) {
    const fromDetail = event?.detail?.newValue;
    if (fromDetail !== undefined && fromDetail !== null)
      return String(fromDetail);
    const fromTarget = event?.target?.value;
    return fromTarget === undefined || fromTarget === null
      ? ""
      : String(fromTarget);
  }
}
