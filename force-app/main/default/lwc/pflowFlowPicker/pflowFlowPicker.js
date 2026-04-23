import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';

const AUTO_ADVANCE_DELAY_MS = 150;

const VALID_LAYOUTS = new Set(['grid', 'list', 'horizontal', 'dropdown', 'radio']);

const DEFAULT_CONFIG = {
    dataSource: 'custom',
    layout: 'grid',
    selectionMode: 'single',
    autoAdvance: false,
    enableSearch: false,
    showSelectAll: false,
    minSelections: 0,
    maxSelections: null,
    required: false,
    customErrorMessage: '',
    label: '',
    helpText: '',
    fieldLevelHelp: '',
    emptyStateMessage: 'No options available.',
    errorStateMessage: 'Could not load options.',
    includeNoneOption: false,
    noneOptionLabel: '--None--',
    noneOptionPosition: 'start',
    picklist: {},
    collection: {},
    sobject: {},
    custom: { items: [] },
    overrides: {},
    display: { sortBy: 'none', sortDirection: 'asc', limit: null },
    gridConfig: {
        minWidth: '16rem',
        gapH: '7',
        gapV: '7',
        margin: { top: 'none', right: 'none', bottom: 'none', left: 'none', linked: true },
        padding: { top: '', right: '', bottom: '', left: '', linked: true },
        size: 'medium',
        aspectRatio: '1:1',
        badge: { position: 'bottom-inline', variant: 'neutral', shape: 'pill', variantHex: '' },
        columns: null,
        selectionIndicator: 'checkmark',
        elevation: 'outlined',
        pattern: 'none',
        patternTone: 'neutral',
        cornerStyle: 'none',
        cornerTone: 'neutral',
        surfaceStyle: 'solid',
        surfaceTone: 'neutral',
        iconDecor: 'none',
        iconShape: 'none',
        iconStyle: 'filled',
        iconShading: 'flat',
        iconTone: 'neutral',
        iconToneHex: '',
        patternToneHex: '',
        cornerToneHex: '',
        surfaceToneHex: '',
        showIcons: true,
        showBadges: true
    }
};

export default class PflowFlowPicker extends LightningElement {
    @api sourceRecords;
    @api sourceStrings;

    _value = '';
    _values = [];
    _selectedLabel = '';
    _selectedLabels = [];
    _selectionCount = 0;
    _allValues = [];
    _allLabels = [];
    _autoAdvanceId;
    _pickerConfigJson = '';
    _lastParsedJson = null;

    @track _config = DEFAULT_CONFIG;

    // Flow can re-assign @api props after mount (debug runs, back/next,
    // conditional screens, resume). With a plain `@api field` the value
    // would update but our _config wouldn't re-parse — the picker would
    // flash correct then revert to DEFAULT. Setter keeps them in sync, and
    // the `v !== this._lastParsedJson` guard prevents transient empty
    // pushes from wiping the last good config.
    @api
    get pickerConfigJson() { return this._pickerConfigJson; }
    set pickerConfigJson(v) {
        this._pickerConfigJson = v || '';
        if (!v) return; // ignore transient empty/undefined; keep last good _config
        if (v === this._lastParsedJson) return; // identical payload; skip re-parse
        try {
            const parsed = JSON.parse(v);
            this._config = { ...DEFAULT_CONFIG, ...parsed };
            this._lastParsedJson = v;
        } catch (e) {
            // Parse error — keep the last good _config rather than flashing to
            // DEFAULT (which would render empty/custom mode briefly).
        }
    }

    @api
    get value() { return this._value; }
    set value(v) {
        this._value = v === undefined || v === null ? '' : String(v);
    }

    @api
    get values() { return this._values; }
    set values(v) {
        this._values = Array.isArray(v) ? [...v] : [];
    }

    @api selectedRecord;
    @api selectedRecords;
    // Read-through outputs — Flow can bind these to downstream screens /
    // flows / email templates. selectedLabel/Labels reflect the label text of
    // the current selection; allValues/allLabels reflect every option the
    // picker rendered (post filter/sort/limit, including the None tile).
    @api
    get selectedLabel() { return this._selectedLabel; }
    set selectedLabel(v) { this._selectedLabel = v || ''; }
    @api
    get selectedLabels() { return this._selectedLabels; }
    set selectedLabels(v) { this._selectedLabels = Array.isArray(v) ? [...v] : []; }
    @api
    get allValues() { return this._allValues; }
    set allValues(v) { this._allValues = Array.isArray(v) ? [...v] : []; }
    @api
    get allLabels() { return this._allLabels; }
    set allLabels(v) { this._allLabels = Array.isArray(v) ? [...v] : []; }
    @api
    get selectionCount() { return this._selectionCount; }
    set selectionCount(v) { this._selectionCount = typeof v === 'number' ? v : 0; }

    connectedCallback() {
        // Most of the time Flow has already set pickerConfigJson via the
        // setter before mount. This is a safety net for bootstrap ordering
        // edge cases where the setter hasn't fired yet.
        if (this._pickerConfigJson && !this._lastParsedJson) {
            // Re-route through the setter so guards apply uniformly.
            this.pickerConfigJson = this._pickerConfigJson;
        }
    }

    get label() { return this._config.label; }
    get helpText() { return this._config.helpText; }
    get fieldLevelHelp() { return this._config.fieldLevelHelp; }
    get dataSource() { return this._config.dataSource; }
    get layout() {
        return VALID_LAYOUTS.has(this._config.layout) ? this._config.layout : 'grid';
    }
    get selectionMode() { return this._config.selectionMode; }
    get required() { return this._config.required; }
    get minSelections() { return this._config.minSelections; }
    get maxSelections() { return this._config.maxSelections; }
    get enableSearch() { return this._config.enableSearch; }
    get showSelectAll() { return this._config.showSelectAll; }
    get emptyStateMessage() { return this._config.emptyStateMessage; }
    get errorStateMessage() { return this._config.errorStateMessage; }

    get picklistConfig() { return this._config.picklist || {}; }
    get sobjectConfig() { return this._config.sobject || {}; }
    get customConfig() { return this._config.custom || { items: [] }; }
    get collectionConfig() {
        const baseFieldMap = (this._config.collection || {}).fieldMap || {};
        return {
            records: Array.isArray(this.sourceRecords) ? this.sourceRecords : [],
            fieldMap: baseFieldMap
        };
    }
    get stringCollectionConfig() {
        return {
            values: Array.isArray(this.sourceStrings) ? this.sourceStrings : []
        };
    }
    get overrides() { return this._config.overrides || {}; }
    get displayConfig() { return this._config.display || DEFAULT_CONFIG.display; }

    // Grid layout getters
    get gridCfg() { return this._config.gridConfig || DEFAULT_CONFIG.gridConfig; }
    get gridMinWidth() { return this.gridCfg.minWidth; }
    get gapHorizontal() { return this.gridCfg.gapH; }
    get gapVertical() { return this.gridCfg.gapV; }
    get tileSize() { return this.gridCfg.size || 'medium'; }
    get tileAspectRatio() { return this.gridCfg.aspectRatio || '1:1'; }

    get badgeCfg() { return this.gridCfg.badge || DEFAULT_CONFIG.gridConfig.badge; }
    get badgePosition() { return this.badgeCfg.position || 'bottom-inline'; }
    get badgeVariant() { return this.badgeCfg.variant || 'neutral'; }
    get badgeShape() { return this.badgeCfg.shape || 'pill'; }

    get columns() {
        const n = Number(this.gridCfg.columns);
        return Number.isFinite(n) && n >= 1 && n <= 6 ? n : undefined;
    }
    get selectionIndicator() { return this.gridCfg.selectionIndicator || 'checkmark'; }
    get elevation() { return this.gridCfg.elevation || 'outlined'; }
    get pattern() { return this.gridCfg.pattern || 'none'; }
    get patternTone() { return this.gridCfg.patternTone || 'neutral'; }
    get cornerStyle() { return this.gridCfg.cornerStyle || 'none'; }
    get cornerTone() { return this.gridCfg.cornerTone || 'neutral'; }
    get surfaceStyle() { return this.gridCfg.surfaceStyle || 'solid'; }
    get surfaceTone() { return this.gridCfg.surfaceTone || 'neutral'; }
    get iconDecor() { return this.gridCfg.iconDecor || 'none'; }
    get iconShape() { return this.gridCfg.iconShape || 'none'; }
    get iconStyle() { return this.gridCfg.iconStyle || 'filled'; }
    get iconShading() { return this.gridCfg.iconShading || 'flat'; }
    get iconTone() { return this.gridCfg.iconTone || 'neutral'; }
    get iconToneHex() { return this.gridCfg.iconToneHex || ''; }
    // Glyph tone defaults to 'auto' (inherit from iconTone) when absent.
    get iconGlyphTone() { return this.gridCfg.iconGlyphTone || 'auto'; }
    get iconGlyphToneHex() { return this.gridCfg.iconGlyphToneHex || ''; }
    // Picker-wide icon glyph size. 'auto' means "scale with tile size" —
    // the atom's existing behavior. Explicit values (small/medium/large/etc.)
    // pin the glyph regardless of tile size.
    get iconSize() {
        const raw = this.gridCfg.iconSize;
        return raw && raw !== 'auto' ? raw : 'large';
    }
    get patternToneHex() { return this.gridCfg.patternToneHex || ''; }
    get cornerToneHex() { return this.gridCfg.cornerToneHex || ''; }
    get surfaceToneHex() { return this.gridCfg.surfaceToneHex || ''; }
    get badgeVariantHex() { return this.badgeCfg?.variantHex || ''; }
    // Default ON — admin flips in CPE to hide globally. Explicit false
    // required to flip off, so legacy configs (where the key didn't exist)
    // keep rendering icons/badges.
    get showIcons() {
        return this.gridCfg.showIcons !== false;
    }
    get showBadges() {
        return this.gridCfg.showBadges !== false;
    }

    // None-option config lives at the top of the config (behavior-level),
    // not under gridConfig (visual-level).
    get includeNoneOption() { return Boolean(this._config.includeNoneOption); }
    get noneOptionLabel() { return this._config.noneOptionLabel || '--None--'; }
    get noneOptionPosition() {
        // Only 'start' and 'end' are legal; anything else quietly maps to
        // 'start' so old saved configs don't break when this setting is added.
        return this._config.noneOptionPosition === 'end' ? 'end' : 'start';
    }

    // Margin + padding — empty string means "no override"; the molecule
    // resolves via tokenToCss, and the atom falls back to size-based padding.
    get marginTop() { return this.gridCfg.margin?.top ?? 'none'; }
    get marginRight() { return this.gridCfg.margin?.right ?? 'none'; }
    get marginBottom() { return this.gridCfg.margin?.bottom ?? 'none'; }
    get marginLeft() { return this.gridCfg.margin?.left ?? 'none'; }
    get paddingTop() { return this.gridCfg.padding?.top || undefined; }
    get paddingRight() { return this.gridCfg.padding?.right || undefined; }
    get paddingBottom() { return this.gridCfg.padding?.bottom || undefined; }
    get paddingLeft() { return this.gridCfg.padding?.left || undefined; }

    handleValueChange(event) {
        const { value, values, record, records, label, labels } = event.detail;
        const isSingle = this.selectionMode === 'single';

        if (isSingle) {
            this._value = value || '';
            this._values = [];
            this._selectedLabel = label || '';
            this._selectedLabels = [];
            this._selectionCount = this._value ? 1 : 0;
            this.dispatchEvent(new FlowAttributeChangeEvent('value', this._value));
            this.dispatchEvent(new FlowAttributeChangeEvent('selectedRecord', record || null));
            this.dispatchEvent(new FlowAttributeChangeEvent('selectedLabel', this._selectedLabel));
            this.dispatchEvent(new FlowAttributeChangeEvent('selectionCount', this._selectionCount));
        } else {
            this._values = [...(values || [])];
            this._value = '';
            this._selectedLabels = Array.isArray(labels) ? [...labels] : [];
            this._selectedLabel = '';
            this._selectionCount = this._values.length;
            this.dispatchEvent(new FlowAttributeChangeEvent('values', this._values));
            this.dispatchEvent(new FlowAttributeChangeEvent('selectedRecords', records || []));
            this.dispatchEvent(new FlowAttributeChangeEvent('selectedLabels', this._selectedLabels));
            this.dispatchEvent(new FlowAttributeChangeEvent('selectionCount', this._selectionCount));
        }

        if (isSingle && this._config.autoAdvance && this._value) {
            this.triggerAutoAdvance();
        }
    }

    // Organism fires `itemschange` whenever the rendered set of options
    // changes (picklist load, string collection refresh, filter by parent,
    // etc.). We mirror that back out as FlowAttributeChangeEvents so admins
    // can bind allValues/allLabels to downstream screens, email templates,
    // or Apex actions.
    handleItemsChange(event) {
        const { values, labels } = event.detail || {};
        this._allValues = Array.isArray(values) ? [...values] : [];
        this._allLabels = Array.isArray(labels) ? [...labels] : [];
        this.dispatchEvent(new FlowAttributeChangeEvent('allValues', this._allValues));
        this.dispatchEvent(new FlowAttributeChangeEvent('allLabels', this._allLabels));
    }

    triggerAutoAdvance() {
        if (this._autoAdvanceId) clearTimeout(this._autoAdvanceId);
        this._autoAdvanceId = setTimeout(() => {
            this._autoAdvanceId = null;
            this.dispatchEvent(new FlowNavigationNextEvent());
        }, AUTO_ADVANCE_DELAY_MS);
    }

    @api
    validate() {
        const organism = this.template.querySelector('c-pflow-organism-data-picker');
        if (!organism) return { isValid: true };
        const result = organism.validate();
        if (!result.isValid && this._config.customErrorMessage) {
            return { isValid: false, errorMessage: this._config.customErrorMessage };
        }
        return result;
    }
}
