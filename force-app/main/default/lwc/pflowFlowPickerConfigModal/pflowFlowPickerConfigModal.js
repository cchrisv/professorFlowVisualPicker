import { api, track, wire } from 'lwc';
import LightningModal from 'lightning/modal';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { SAMPLE_ITEMS } from 'c/pflowUtilityPickerDataSources';
import searchSObjectTypes from '@salesforce/apex/PFlowCpeChoiceEngineController.searchSObjectTypes';
import queryItems from '@salesforce/apex/PflowPickerController.queryItems';

const SOURCE_TILES = [
    { value: 'picklist',         label: 'Picklist',     sublabel: 'Object picklist field',    icon: 'utility:picklist_type' },
    { value: 'collection',       label: 'Collection',   sublabel: 'Flow record collection',   icon: 'utility:layers' },
    { value: 'stringCollection', label: 'String list',  sublabel: 'Flow text collection',     icon: 'utility:quotation_marks' },
    { value: 'sobject',          label: 'SOQL query',   sublabel: 'Custom WHERE + ordering',  icon: 'utility:database' },
    { value: 'custom',           label: 'Custom items', sublabel: 'Typed-in static options',  icon: 'utility:edit_form' }
];

const LAYOUT_TILES = [
    { value: 'grid',       label: 'Grid',       sublabel: 'Responsive tile grid',    icon: 'utility:apps' },
    { value: 'list',       label: 'List',       sublabel: 'Stacked rows',            icon: 'utility:rows' },
    { value: 'horizontal', label: 'Horizontal', sublabel: 'Scrolling ribbon',        icon: 'utility:side_list' },
    { value: 'dropdown',   label: 'Dropdown',   sublabel: 'Compact combobox',        icon: 'utility:picklist_type' },
    { value: 'radio',      label: 'Radio',      sublabel: 'Native radio group',      icon: 'utility:multi_select_checkbox' }
];

const SELECTION_TILES = [
    { value: 'single', label: 'Single', sublabel: 'Exactly one option', icon: 'utility:record' },
    { value: 'multi',  label: 'Multi',  sublabel: 'Several options',    icon: 'utility:multi_select_checkbox' }
];

const SIZE_TILES = [
    { value: 'small',  label: 'Small',  sublabel: 'Compact · 7.5 rem', shape: { width: '1.125rem', height: '1.125rem' } },
    { value: 'medium', label: 'Medium', sublabel: 'Default · 12 rem',  shape: { width: '1.875rem', height: '1.875rem' } },
    { value: 'large',  label: 'Large',  sublabel: 'Roomy · 16 rem',    shape: { width: '2.5rem',   height: '2.5rem' } }
];

// Canonical column width (and default padding token) paired to each size. When
// the user picks a size, the grid column width follows by default so tiles
// don't fight with the grid — "size" becomes a single predictable knob.
const SIZE_LAYOUT_MAP = {
    small:  { column: '7.5rem', paddingToken: '3' },
    medium: { column: '12rem',  paddingToken: '4' },
    large:  { column: '16rem',  paddingToken: '5' }
};


const ASPECT_TILES = [
    { value: '1:1',  label: 'Square',    sublabel: '1 × 1',  shape: { width: '2.25rem',   height: '2.25rem' } },
    { value: '4:3',  label: 'Landscape', sublabel: '4 × 3',  shape: { width: '2.75rem',   height: '2.0625rem' } },
    { value: '16:9', label: 'Wide',      sublabel: '16 × 9', shape: { width: '3rem',      height: '1.6875rem' } },
    { value: '3:4',  label: 'Portrait',  sublabel: '3 × 4',  shape: { width: '1.6875rem', height: '2.25rem' } }
];

const PICKLIST_VALUE_SOURCE_OPTIONS = [
    { label: 'API name (default)', value: 'apiName' },
    { label: 'Label', value: 'label' }
];

const SORT_BY_OPTIONS = [
    { label: 'Source order (default)', value: 'none' },
    { label: 'Label', value: 'label' },
    { label: 'Value', value: 'value' }
];

const SORT_DIRECTION_OPTIONS = [
    { label: 'Ascending (A → Z)', value: 'asc' },
    { label: 'Descending (Z → A)', value: 'desc' }
];

// Visual card tiles for the spacing picker. Each tile draws a solid square
// proportional to its SLDS 2 token value so the scale is readable at a glance.
const SPACING_TILES = [
    { value: 'none', label: 'None', sublabel: '0px',  shape: { width: '0.125rem', height: '0.125rem' } },
    { value: '1',    label: 'XXS',  sublabel: '4px',  shape: { width: '0.375rem', height: '0.375rem' } },
    { value: '2',    label: 'XS',   sublabel: '8px',  shape: { width: '0.5rem',   height: '0.5rem' } },
    { value: '3',    label: 'S',    sublabel: '12px', shape: { width: '0.75rem',  height: '0.75rem' } },
    { value: '4',    label: 'M',    sublabel: '16px', shape: { width: '1rem',     height: '1rem' } },
    { value: '5',    label: 'L',    sublabel: '20px', shape: { width: '1.25rem',  height: '1.25rem' } },
    { value: '6',    label: 'XL',   sublabel: '24px', shape: { width: '1.5rem',   height: '1.5rem' } },
    { value: '7',    label: '2XL',  sublabel: '32px', shape: { width: '2rem',     height: '2rem' } },
    { value: '8',    label: '3XL',  sublabel: '40px', shape: { width: '2.25rem',  height: '2.25rem' } },
    { value: '9',    label: '4XL',  sublabel: '48px', shape: { width: '2.5rem',   height: '2.5rem' } }
];

// Padding has an additional "Auto" tile that defers to the tile size default.
const PADDING_TILES = [
    { value: '', label: 'Auto', sublabel: 'From size', icon: 'utility:magicwand' },
    ...SPACING_TILES
];

const SPACING_SIDES = ['top', 'right', 'bottom', 'left'];

// SLDS 2 utility icons that read as "the side of a panel" for each direction.
const SIDE_META = [
    { side: 'top',    label: 'Top',    icon: 'utility:top_panel' },
    { side: 'right',  label: 'Right',  icon: 'utility:right_panel' },
    { side: 'bottom', label: 'Bottom', icon: 'utility:bottom_panel' },
    { side: 'left',   label: 'Left',   icon: 'utility:left_panel' }
];

// ── Badge ────────────────────────────────────────────────────────────────────
const BADGE_POSITIONS = [
    { value: 'top-left',      label: 'Top left' },
    { value: 'top-right',     label: 'Top right' },
    { value: 'bottom-left',   label: 'Bottom left' },
    { value: 'bottom-right',  label: 'Bottom right' },
    { value: 'bottom-inline', label: 'Inline' }
];

const BADGE_VARIANTS = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'brand',   label: 'Brand' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error',   label: 'Error' },
    { value: 'inverse', label: 'Inverse' }
];

const BADGE_SHAPES = [
    { value: 'pill',   label: 'Pill' },
    { value: 'square', label: 'Square' }
];

// ── Column count (grid only) · Auto + 1..6 ──────────────────────────────────
const COLUMN_CHIPS = [
    { value: '',  label: 'Auto' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' }
];

// ── Selection indicator ─────────────────────────────────────────────────────
const SELECTION_INDICATOR_TILES = [
    { value: 'checkmark', label: 'Checkmark', sublabel: 'Floating circle', icon: 'utility:check' },
    { value: 'fill',      label: 'Fill',      sublabel: 'Tile fills brand', icon: 'utility:color_swatch' },
    { value: 'bar',       label: 'Bar',       sublabel: 'Edge accent bar',  icon: 'utility:rows' }
];

// ── Card elevation ──────────────────────────────────────────────────────────
const ELEVATION_TILES = [
    { value: 'outlined', label: 'Outlined', sublabel: 'Border + hover shadow', icon: 'utility:frozen' },
    { value: 'flat',     label: 'Flat',     sublabel: 'No border, tinted',    icon: 'utility:fallback' },
    { value: 'elevated', label: 'Elevated', sublabel: 'Always-on shadow',     icon: 'utility:upload' }
];

function spacingTileList(source, activeValue) {
    return source.map((t, i) => ({
        id: `${t.value || 'auto'}-${i}`,
        value: t.value,
        label: t.label,
        sublabel: t.sublabel,
        icon: t.icon,
        shape: t.shape,
        _selected: t.value === activeValue
    }));
}

// Chapters are rendered as a single scrolling page. Nav buttons scroll-jump
// to the matching chapter anchor; IntersectionObserver updates the active
// chapter as the user scrolls.
const SECTIONS = [
    { key: 'data',       label: 'Data',       icon: 'utility:database', numeral: '01' },
    { key: 'content',    label: 'Content',    icon: 'utility:text',     numeral: '02' },
    { key: 'behavior',   label: 'Behavior',   icon: 'utility:custom_apps', numeral: '03' },
    { key: 'appearance', label: 'Appearance', icon: 'utility:palette',  numeral: '04' }
];

const OVERRIDE_FIELDS = ['label', 'sublabel', 'icon', 'badge', 'helpText'];

const GRID_SLIDER_RANGES = {
    minWidth: { min: 6, max: 32, step: 1, fallback: 16 },
    gapH: { min: 0, max: 4, step: 0.25, fallback: 2 },
    gapV: { min: 0, max: 4, step: 0.25, fallback: 2 }
};

function parseRemValue(value, fallback) {
    if (value == null || value === '') return fallback;
    const match = String(value).trim().match(/^([\d.]+)\s*rem$/i);
    if (!match) return fallback;
    const n = parseFloat(match[1]);
    return Number.isFinite(n) ? n : fallback;
}

function formatRem(n) {
    const rounded = Math.round(n * 100) / 100;
    return `${rounded}rem`;
}

function defaultConfig() {
    return {
        dataSource: '',
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
        picklist: { objectApiName: '', fieldApiName: '', recordTypeId: '', valueSource: 'apiName' },
        collection: { fieldMap: { label: '', sublabel: '', icon: '', value: '', badge: '', helpText: '' } },
        sobject: {
            sObjectApiName: '',
            whereClause: '',
            orderByField: '',
            orderByDirection: 'ASC',
            limit: 50,
            labelField: 'Name',
            valueField: 'Id',
            sublabelField: '',
            iconField: '',
            badgeField: '',
            helpField: ''
        },
        custom: { items: [] },
        stringCollection: { sampleValues: '' },
        includeNoneOption: false,
        noneOptionLabel: '--None--',
        noneOptionPosition: 'start',
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
            iconGlyphTone: 'auto',
            iconGlyphToneHex: '',
            patternToneHex: '',
            cornerToneHex: '',
            surfaceToneHex: '',
            // ON by default — admin can globally hide to suppress icons/badges
            // regardless of per-item data. Legacy configs without these keys
            // default to ON via `!== false` checks on the Flow wrapper.
            showIcons: true,
            showBadges: true
        }
    };
}

// Tile options for the Appearance pickers. Each uses utility icons that
// hint at the visual style without needing live preview on the tile itself.
const PATTERN_TILES = [
    { value: 'none',     label: 'None',     sublabel: 'Clean surface',     icon: 'utility:ban' },
    { value: 'dots',     label: 'Dots',     sublabel: 'Fine grid',          icon: 'utility:dot_net' },
    { value: 'lines',    label: 'Lines',    sublabel: 'Horizontal',         icon: 'utility:rows' },
    { value: 'diagonal', label: 'Diagonal', sublabel: '45° stripes',        icon: 'utility:arrow_top' },
    { value: 'grid',     label: 'Grid',     sublabel: 'Crosshatch',         icon: 'utility:table' },
    { value: 'glow',     label: 'Glow',     sublabel: 'Radial spotlight',   icon: 'utility:light_bulb' },
    { value: 'noise',    label: 'Noise',    sublabel: 'Subtle grain',       icon: 'utility:signpost' },
    { value: 'paper',    label: 'Paper',    sublabel: 'Cross-hatch',        icon: 'utility:note' },
    { value: 'waves',    label: 'Waves',    sublabel: 'Banded rows',        icon: 'utility:graph' }
];

const CORNER_TILES = [
    { value: 'none',     label: 'None',     sublabel: 'Clean corners',      icon: 'utility:ban' },
    { value: 'trim',     label: 'Trim',     sublabel: 'Printer marks',      icon: 'utility:crop' },
    { value: 'brackets', label: 'Brackets', sublabel: 'Heavier L-corners',  icon: 'utility:brackets' },
    { value: 'dots',     label: 'Dots',     sublabel: 'Small corner dots',  icon: 'utility:record' }
];

const SURFACE_TILES = [
    { value: 'solid',              label: 'Solid',    sublabel: 'Default surface',  icon: 'utility:shape' },
    { value: 'gradient-top',       label: 'Top fade', sublabel: 'Linear top-down',  icon: 'utility:linear_gauge' },
    { value: 'gradient-radial',    label: 'Spotlight', sublabel: 'Radial from top', icon: 'utility:picklist' },
    { value: 'gradient-diagonal',  label: 'Diagonal', sublabel: '45° linear wash',  icon: 'utility:arrow_top' },
    { value: 'tint',               label: 'Tint',     sublabel: 'Flat soft fill',   icon: 'utility:color_swatch' }
];

// Legacy — kept only while old configs may still carry iconDecor. New UI
// uses ICON_SHAPE_TILES + ICON_STYLE_TILES below.
const ICON_DECOR_TILES = [
    { value: 'none',   label: 'None',   sublabel: 'Bare glyph',       icon: 'utility:ban' },
    { value: 'ring',   label: 'Ring',   sublabel: 'Outlined circle',  icon: 'utility:record' },
    { value: 'halo',   label: 'Halo',   sublabel: 'Soft glow',        icon: 'utility:light_bulb' },
    { value: 'badge',  label: 'Badge',  sublabel: 'Filled circle',    icon: 'utility:moneybag' },
    { value: 'square', label: 'Square', sublabel: 'Rounded tile',     icon: 'utility:shape' }
];

const ICON_SHAPE_TILES = [
    { value: 'none',     label: 'None',     sublabel: 'No decoration',    icon: 'utility:ban' },
    { value: 'circle',   label: 'Circle',   sublabel: 'Classic round',    icon: 'utility:record' },
    { value: 'square',   label: 'Square',   sublabel: 'Rounded square',   icon: 'utility:stop' },
    { value: 'squircle', label: 'Squircle', sublabel: 'iOS app icon',     icon: 'utility:shape' },
    { value: 'pill',     label: 'Pill',     sublabel: 'Wide rounded',     icon: 'utility:toggle' },
    { value: 'hexagon',  label: 'Hexagon',  sublabel: 'Six sides',        icon: 'utility:bookmark' },
    { value: 'diamond',  label: 'Diamond',  sublabel: 'Rotated square',   icon: 'utility:prompt' }
];

const ICON_STYLE_TILES = [
    { value: 'filled',   label: 'Filled',   sublabel: 'Solid tint',         icon: 'utility:record' },
    { value: 'outlined', label: 'Outlined', sublabel: 'Ring only',          icon: 'utility:adjust_value' },
    { value: 'soft',     label: 'Soft',     sublabel: 'Ghost placeholder',  icon: 'utility:layers' },
    { value: 'glow',     label: 'Glow',     sublabel: 'Radiating halo',     icon: 'utility:light_bulb' }
];

const ICON_SHADING_TILES = [
    { value: 'flat',     label: 'Flat',     sublabel: 'Solid color',   icon: 'utility:rectangle' },
    { value: 'gradient', label: 'Gradient', sublabel: 'Light to dark', icon: 'utility:steps' },
    { value: 'emboss',   label: 'Emboss',   sublabel: 'Pressed-in',    icon: 'utility:anchor' }
];

// Icon size tiles — controls the glyph size inside the shape. Separate from
// the card's Tile size (which controls the overall tile dimensions).
const ICON_SIZE_TILES = [
    { value: 'xx-small', label: 'XX-small', sublabel: '0.75rem',   icon: 'utility:minimize_window' },
    { value: 'x-small',  label: 'X-small',  sublabel: '1rem',      icon: 'utility:minimize_window' },
    { value: 'small',    label: 'Small',    sublabel: '1.25rem',   icon: 'utility:rectangle' },
    { value: 'medium',   label: 'Medium',   sublabel: '1.5rem',    icon: 'utility:expand_alt' },
    { value: 'large',    label: 'Large',    sublabel: '2rem',      icon: 'utility:expand' }
];

// Glyph tone swatches — the standard palette PLUS 'auto' (inherit fill) and
// 'contrast' (white over filled shape). Keeps the color axes symmetrical
// with the rest of the component.
const GLYPH_TONE_SWATCHES = [
    { value: 'auto',     label: 'Auto' },
    { value: 'contrast', label: 'Contrast' },
    { value: 'neutral',  label: 'Neutral' },
    { value: 'brand',    label: 'Brand' },
    { value: 'success',  label: 'Success' },
    { value: 'warning',  label: 'Warning' },
    { value: 'error',    label: 'Error' },
    { value: 'violet',   label: 'Violet' },
    { value: 'pink',     label: 'Pink' },
    { value: 'teal',     label: 'Teal' },
    { value: 'custom',   label: 'Custom' }
];

// Shared tone palette — 8 SLDS-aligned presets + 'custom' which pairs with
// a hex value. Custom is rendered with a small dotted-gradient dot so it
// reads as "unique" in the chip row; active custom also reveals an input.
const TONE_SWATCHES = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'brand',   label: 'Brand' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error',   label: 'Error' },
    { value: 'violet',  label: 'Violet' },
    { value: 'pink',    label: 'Pink' },
    { value: 'teal',    label: 'Teal' },
    { value: 'custom',  label: 'Custom' }
];

export default class PflowFlowPickerConfigModal extends LightningModal {
    @api initialConfig;
    @api initialSourceRecordsRef;
    @api initialSourceStringsRef;
    @api builderContext;
    @api automaticOutputVariables;

    @track _config;
    @track _sourceRecordsRef = '';
    @track _sourceStringsRef = '';
    @track _picklistValues = [];
    @track _sobjectSampleRows = [];
    @track _sampleLoadError = '';
    @track _isLoadingSample = false;

    @track _activeSection = 'data';
    // Preview state override ('', 'empty', 'error'). Modal-local — not saved.
    @track _forcedPreviewState = '';
    @track _overrideSearch = '';
    @track _expandedOverrideValue = '';
    @track _bulkSelection = {};
    @track _bulkEditDraft = { icon: '', sublabel: '', badge: '', helpText: '' };

    // Left-panel width in px (combines nav + preview). Resets per modal open.
    @track _leftWidth = 320;
    _dragState = null;

    connectedCallback() {
        const base = defaultConfig();
        const incoming = this.initialConfig
            ? JSON.parse(JSON.stringify(this.initialConfig))
            : {};
        this._config = {
            ...base,
            ...incoming,
            picklist: { ...base.picklist, ...(incoming.picklist || {}) },
            collection: {
                ...base.collection,
                ...(incoming.collection || {}),
                fieldMap: { ...base.collection.fieldMap, ...(incoming.collection?.fieldMap || {}) }
            },
            sobject: { ...base.sobject, ...(incoming.sobject || {}) },
            custom: { items: incoming.custom?.items || [] },
            stringCollection: {
                sampleValues: incoming.stringCollection?.sampleValues || ''
            },
            overrides: incoming.overrides && typeof incoming.overrides === 'object' ? incoming.overrides : {},
            display: { ...base.display, ...(incoming.display || {}) },
            gridConfig: {
                ...base.gridConfig,
                ...(incoming.gridConfig || {}),
                margin: { ...base.gridConfig.margin, ...(incoming.gridConfig?.margin || {}) },
                padding: { ...base.gridConfig.padding, ...(incoming.gridConfig?.padding || {}) },
                badge: { ...base.gridConfig.badge, ...(incoming.gridConfig?.badge || {}) }
            }
        };
        this._sourceRecordsRef = this.initialSourceRecordsRef || '';
        this._sourceStringsRef = this.initialSourceStringsRef || '';
    }

    // ========================================================================
    // Option sources (exposed to template — only those still referenced)
    // ========================================================================
    get picklistValueSourceOptions() { return PICKLIST_VALUE_SOURCE_OPTIONS; }
    get sortByOptions() { return SORT_BY_OPTIONS; }
    get sortDirectionOptions() { return SORT_DIRECTION_OPTIONS; }

    // Visual tile pickers for SLDS 2 spacing tokens. Each tile carries a
    // proportional shape so the scale reads at a glance.
    get gapHTiles() { return spacingTileList(SPACING_TILES, this.gapHValue); }
    get gapVTiles() { return spacingTileList(SPACING_TILES, this.gapVValue); }
    get marginAllTiles() { return spacingTileList(SPACING_TILES, this.marginAll); }
    get paddingAllTiles() { return spacingTileList(PADDING_TILES, this.paddingAll); }

    // Per-side tiles for unlinked mode — paired with panel icons.
    get marginSideSections() {
        return SIDE_META.map((meta) => ({
            ...meta,
            tiles: spacingTileList(SPACING_TILES, this[`margin${meta.side.charAt(0).toUpperCase() + meta.side.slice(1)}`])
        }));
    }
    get paddingSideSections() {
        return SIDE_META.map((meta) => ({
            ...meta,
            tiles: spacingTileList(PADDING_TILES, this[`padding${meta.side.charAt(0).toUpperCase() + meta.side.slice(1)}`])
        }));
    }

    // --- Spacing (gaps, margin, padding) ---
    get gapHValue() { return this._config?.gridConfig?.gapH ?? '7'; }
    get gapVValue() { return this._config?.gridConfig?.gapV ?? '7'; }

    handleGapHorizontalToken(event) {
        const value = event.detail?.value ?? '7';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, gapH: value }
        };
    }
    handleGapVerticalToken(event) {
        const value = event.detail?.value ?? '7';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, gapV: value }
        };
    }

    // Margin — 4 sides with linked toggle
    get marginLinked() { return this._config?.gridConfig?.margin?.linked !== false; }
    get marginUnlinked() { return !this.marginLinked; }
    get marginTop() { return this._config?.gridConfig?.margin?.top ?? 'none'; }
    get marginRight() { return this._config?.gridConfig?.margin?.right ?? 'none'; }
    get marginBottom() { return this._config?.gridConfig?.margin?.bottom ?? 'none'; }
    get marginLeft() { return this._config?.gridConfig?.margin?.left ?? 'none'; }
    get marginAll() { return this.marginTop; }

    handleMarginLinkToggle(event) {
        const linked = Boolean(event.detail?.checked);
        const margin = { ...(this._config?.gridConfig?.margin || {}), linked };
        if (linked) {
            const base = margin.top ?? 'none';
            margin.top = margin.right = margin.bottom = margin.left = base;
        }
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, margin }
        };
    }
    handleMarginAllChange(event) {
        const v = event.detail?.value ?? 'none';
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                margin: { linked: true, top: v, right: v, bottom: v, left: v }
            }
        };
    }
    handleMarginSideChange(event) {
        const side = event.currentTarget?.dataset?.side;
        if (!SPACING_SIDES.includes(side)) return;
        const value = event.detail?.value ?? 'none';
        const prev = this._config?.gridConfig?.margin || {};
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                margin: { ...prev, [side]: value, linked: false }
            }
        };
    }

    // Padding — same shape as margin
    get paddingLinked() { return this._config?.gridConfig?.padding?.linked !== false; }
    get paddingUnlinked() { return !this.paddingLinked; }
    get paddingTop() { return this._config?.gridConfig?.padding?.top ?? ''; }
    get paddingRight() { return this._config?.gridConfig?.padding?.right ?? ''; }
    get paddingBottom() { return this._config?.gridConfig?.padding?.bottom ?? ''; }
    get paddingLeft() { return this._config?.gridConfig?.padding?.left ?? ''; }
    get paddingAll() { return this.paddingTop; }

    handlePaddingLinkToggle(event) {
        const linked = Boolean(event.detail?.checked);
        const padding = { ...(this._config?.gridConfig?.padding || {}), linked };
        if (linked) {
            const base = padding.top ?? '';
            padding.top = padding.right = padding.bottom = padding.left = base;
        }
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, padding }
        };
    }
    handlePaddingAllChange(event) {
        const v = event.detail?.value ?? '';
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                padding: { linked: true, top: v, right: v, bottom: v, left: v }
            }
        };
    }
    handlePaddingSideChange(event) {
        const side = event.currentTarget?.dataset?.side;
        if (!SPACING_SIDES.includes(side)) return;
        const value = event.detail?.value ?? '';
        const prev = this._config?.gridConfig?.padding || {};
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                padding: { ...prev, [side]: value, linked: false }
            }
        };
    }

    // --- Display (sort + limit) ---
    get displaySortBy() { return this._config?.display?.sortBy || 'none'; }
    get displaySortDirection() { return this._config?.display?.sortDirection || 'asc'; }
    get displayLimit() { return this._config?.display?.limit ?? ''; }
    get displaySortEnabled() { return this.displaySortBy !== 'none'; }

    handleDisplaySortByChange(event) {
        const value = event.detail?.value || 'none';
        this._config = {
            ...this._config,
            display: { ...(this._config.display || {}), sortBy: value }
        };
    }
    handleDisplaySortDirectionChange(event) {
        const value = event.detail?.value || 'asc';
        this._config = {
            ...this._config,
            display: { ...(this._config.display || {}), sortDirection: value }
        };
    }
    handleDisplayLimitChange(event) {
        const raw = event.target?.value;
        const limit = raw === '' || raw == null ? null : Math.max(0, Number(raw));
        this._config = {
            ...this._config,
            display: { ...(this._config.display || {}), limit }
        };
    }

    // --- Size + aspect ratio state + handlers ---
    get tileSize() { return this._config?.gridConfig?.size || 'medium'; }
    get tileAspectRatio() { return this._config?.gridConfig?.aspectRatio || '1:1'; }

    get aspectTiles() {
        const active = this.tileAspectRatio;
        return ASPECT_TILES.map((t) => ({
            id: t.value,
            value: t.value,
            label: t.label,
            sublabel: t.sublabel,
            shape: t.shape,
            _selected: t.value === active
        }));
    }

    get sizeTiles() {
        const active = this.tileSize;
        return SIZE_TILES.map((t) => ({
            id: t.value,
            value: t.value,
            label: t.label,
            sublabel: t.sublabel,
            shape: t.shape,
            _selected: t.value === active
        }));
    }

    handleSizeTileChange(event) {
        const value = event.detail?.value || 'medium';
        // Bind the grid column width to the size's canonical value so tiles and
        // the grid agree. Users who want a different column width can change it
        // manually after — but the default is always predictable.
        const layout = SIZE_LAYOUT_MAP[value] || SIZE_LAYOUT_MAP.medium;
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                size: value,
                minWidth: layout.column
            }
        };
    }

    handleAspectChange(event) {
        const value = event.detail?.value || '1:1';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, aspectRatio: value }
        };
    }

    // ── Column count override (grid only) ───────────────────────────────────
    get columnsValue() {
        const n = this._config?.gridConfig?.columns;
        return n == null ? '' : String(n);
    }
    get columnChips() {
        const active = this.columnsValue;
        return COLUMN_CHIPS.map((c) => ({
            value: c.value,
            label: c.label,
            className: c.value === active
                ? 'pflow-studio__col-chip pflow-studio__col-chip_active'
                : 'pflow-studio__col-chip',
            ariaPressed: String(c.value === active)
        }));
    }
    handleColumnsChange(event) {
        const raw = event.currentTarget?.dataset?.value;
        const next = raw === '' ? null : Number(raw);
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, columns: next }
        };
    }

    // ── Selection indicator tile picker ─────────────────────────────────────
    get selectionIndicatorValue() {
        return this._config?.gridConfig?.selectionIndicator || 'checkmark';
    }
    get selectionIndicatorTiles() {
        const active = this.selectionIndicatorValue;
        return SELECTION_INDICATOR_TILES.map((t) => ({
            id: t.value,
            value: t.value,
            label: t.label,
            sublabel: t.sublabel,
            icon: t.icon,
            _selected: t.value === active
        }));
    }
    handleSelectionIndicatorChange(event) {
        const value = event.detail?.value || 'checkmark';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, selectionIndicator: value }
        };
    }

    // ── Elevation tile picker ───────────────────────────────────────────────
    get elevationValue() {
        return this._config?.gridConfig?.elevation || 'outlined';
    }
    get elevationTiles() {
        const active = this.elevationValue;
        return ELEVATION_TILES.map((t) => ({
            id: t.value,
            value: t.value,
            label: t.label,
            sublabel: t.sublabel,
            icon: t.icon,
            _selected: t.value === active
        }));
    }
    handleElevationChange(event) {
        const value = event.detail?.value || 'outlined';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, elevation: value }
        };
    }

    // ── Pattern / Corner / Surface / Icon-decor — all styled similarly ─────
    // Each has a getter returning the tile list with _selected marks, a
    // matching change handler that updates gridConfig, plus a tone-swatch
    // picker. The tone is a separate chip group so users can pick the axis
    // first (what kind of pattern?) then the color.
    get patternValue() { return this._config?.gridConfig?.pattern || 'none'; }
    get patternToneValue() { return this._config?.gridConfig?.patternTone || 'neutral'; }
    get patternTiles() {
        const active = this.patternValue;
        return PATTERN_TILES.map((t) => ({
            id: t.value, value: t.value, label: t.label, sublabel: t.sublabel, icon: t.icon,
            _selected: t.value === active
        }));
    }
    get patternToneChips() {
        return this._buildToneChips(this.patternToneValue, this.patternValue !== 'none');
    }
    get patternToneIsCustom() { return this.patternToneValue === 'custom'; }
    get patternToneHexValue() { return this._config?.gridConfig?.patternToneHex || ''; }
    handlePatternToneHexChange(event) {
        const value = event.target?.value || '';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, patternToneHex: value }
        };
    }
    handlePatternChange(event) {
        const value = event.detail?.value || 'none';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, pattern: value }
        };
    }
    handlePatternToneChange(event) {
        const value = event.currentTarget?.dataset?.value;
        if (!value) return;
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, patternTone: value }
        };
    }

    get cornerValue() { return this._config?.gridConfig?.cornerStyle || 'none'; }
    get cornerToneValue() { return this._config?.gridConfig?.cornerTone || 'neutral'; }
    get cornerTiles() {
        const active = this.cornerValue;
        return CORNER_TILES.map((t) => ({
            id: t.value, value: t.value, label: t.label, sublabel: t.sublabel, icon: t.icon,
            _selected: t.value === active
        }));
    }
    get cornerToneChips() {
        return this._buildToneChips(this.cornerToneValue, this.cornerValue !== 'none');
    }
    get cornerToneIsCustom() { return this.cornerToneValue === 'custom'; }
    get cornerToneHexValue() { return this._config?.gridConfig?.cornerToneHex || ''; }
    handleCornerToneHexChange(event) {
        const value = event.target?.value || '';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, cornerToneHex: value }
        };
    }
    handleCornerChange(event) {
        const value = event.detail?.value || 'none';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, cornerStyle: value }
        };
    }
    handleCornerToneChange(event) {
        const value = event.currentTarget?.dataset?.value;
        if (!value) return;
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, cornerTone: value }
        };
    }

    get surfaceValue() { return this._config?.gridConfig?.surfaceStyle || 'solid'; }
    get surfaceToneValue() { return this._config?.gridConfig?.surfaceTone || 'neutral'; }
    get surfaceTiles() {
        const active = this.surfaceValue;
        return SURFACE_TILES.map((t) => ({
            id: t.value, value: t.value, label: t.label, sublabel: t.sublabel, icon: t.icon,
            _selected: t.value === active
        }));
    }
    get surfaceToneChips() {
        return this._buildToneChips(this.surfaceToneValue, this.surfaceValue !== 'solid');
    }
    get surfaceToneIsCustom() { return this.surfaceToneValue === 'custom'; }
    get surfaceToneHexValue() { return this._config?.gridConfig?.surfaceToneHex || ''; }
    handleSurfaceToneHexChange(event) {
        const value = event.target?.value || '';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, surfaceToneHex: value }
        };
    }
    handleSurfaceChange(event) {
        const value = event.detail?.value || 'solid';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, surfaceStyle: value }
        };
    }
    handleSurfaceToneChange(event) {
        const value = event.currentTarget?.dataset?.value;
        if (!value) return;
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, surfaceTone: value }
        };
    }

    // --- Global show/hide toggles for icons + badges -------------------
    // True by default. When false, the picker suppresses that family of
    // decoration across every tile regardless of per-item data.
    get showIconsValue()  { return this._config?.gridConfig?.showIcons  !== false; }
    get showBadgesValue() { return this._config?.gridConfig?.showBadges !== false; }

    handleShowIconsToggle(event) {
        const checked = event.target?.checked ?? event.detail?.checked ?? false;
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, showIcons: Boolean(checked) }
        };
    }
    handleShowBadgesToggle(event) {
        const checked = event.target?.checked ?? event.detail?.checked ?? false;
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, showBadges: Boolean(checked) }
        };
    }
    // Class drivers for sub-chapter headers — add `_off` modifier when the
    // section is globally hidden so the stripe + title fade to warn tone.
    get iconSubchapterClass() {
        return this.showIconsValue
            ? 'pflow-studio__subchapter'
            : 'pflow-studio__subchapter pflow-studio__subchapter_off';
    }
    get badgeSubchapterClass() {
        return this.showBadgesValue
            ? 'pflow-studio__subchapter'
            : 'pflow-studio__subchapter pflow-studio__subchapter_off';
    }

    // --- Icon shape / style / shading ----------------------------------
    get iconShapeValue()   { return this._config?.gridConfig?.iconShape   || 'none'; }
    get iconStyleValue()   { return this._config?.gridConfig?.iconStyle   || 'filled'; }
    get iconShadingValue() { return this._config?.gridConfig?.iconShading || 'flat'; }
    get iconToneValue()    { return this._config?.gridConfig?.iconTone    || 'neutral'; }
    get iconToneHexValue() { return this._config?.gridConfig?.iconToneHex || ''; }

    get iconShapeTiles() {
        const active = this.iconShapeValue;
        return ICON_SHAPE_TILES.map((t) => ({
            id: t.value, value: t.value, label: t.label, sublabel: t.sublabel, icon: t.icon,
            _selected: t.value === active
        }));
    }
    get iconStyleTiles() {
        const active = this.iconStyleValue;
        const enabled = this.iconShapeValue !== 'none';
        return ICON_STYLE_TILES.map((t) => ({
            id: t.value, value: t.value, label: t.label, sublabel: t.sublabel, icon: t.icon,
            _selected: t.value === active,
            _disabled: !enabled
        }));
    }
    get iconShadingTiles() {
        const active = this.iconShadingValue;
        // Shading is only meaningful on filled styles.
        const enabled = this.iconShapeValue !== 'none' && this.iconStyleValue === 'filled';
        return ICON_SHADING_TILES.map((t) => ({
            id: t.value, value: t.value, label: t.label, sublabel: t.sublabel, icon: t.icon,
            _selected: t.value === active,
            _disabled: !enabled
        }));
    }
    get showIconShadingCard() {
        // Shape must be set AND icons must be globally enabled AND style=filled.
        return this.showIconsValue
            && this.iconShapeValue !== 'none'
            && this.iconStyleValue === 'filled';
    }
    get showIconStyleCard() {
        return this.showIconsValue && this.iconShapeValue !== 'none';
    }
    // The shape card itself only shows when the global toggle is ON — no
    // point dialing a shape when icons are hidden.
    get showIconShapeCard() { return this.showIconsValue; }
    // Badge cards follow the same rule — hide when the global toggle is off.
    get showBadgeGroupCards() { return this.showBadgesValue; }

    get iconToneChips() {
        const active = this.iconToneValue;
        const enabled = this.iconShapeValue !== 'none';
        return this._buildToneChips(active, enabled);
    }
    get iconToneIsCustom() { return this.iconToneValue === 'custom'; }

    // --- Glyph tone (icon color distinct from fill) -------------------
    get iconGlyphToneValue() {
        return this._config?.gridConfig?.iconGlyphTone || 'auto';
    }
    get iconGlyphToneHexValue() {
        return this._config?.gridConfig?.iconGlyphToneHex || '';
    }
    get iconGlyphToneChips() {
        const active = this.iconGlyphToneValue;
        const enabled = this.iconShapeValue !== 'none';
        return GLYPH_TONE_SWATCHES.map((t) => ({
            value: t.value,
            label: t.label,
            className: this._toneChipClass(t.value, active, enabled),
            ariaPressed: String(t.value === active),
            dotClassName: `pflow-tone-chip__dot pflow-tone-chip__dot_${t.value}`,
            disabled: !enabled
        }));
    }
    get iconGlyphToneIsCustom() { return this.iconGlyphToneValue === 'custom'; }
    handleIconGlyphToneChange(event) {
        const value = event.currentTarget?.dataset?.value;
        if (!value) return;
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, iconGlyphTone: value }
        };
    }
    handleIconGlyphToneHexChange(event) {
        const value = event.target?.value || '';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, iconGlyphToneHex: value }
        };
    }

    // --- Icon size ---------------------------------------------------
    get iconSizeValue() {
        // Resolution chain: per-tile iconSize (on item) → picker-wide (atom
        // @api `iconSize`) → derived from tile size. Modal controls the
        // picker-wide default through a new gridConfig.iconSize.
        return this._config?.gridConfig?.iconSize || 'auto';
    }
    get iconSizeTiles() {
        const active = this.iconSizeValue;
        const enabled = this.iconShapeValue !== 'none' || this.showIconsValue;
        return [
            { value: 'auto',     label: 'Auto',     sublabel: 'Match tile',  icon: 'utility:sync' },
            ...ICON_SIZE_TILES
        ].map((t) => ({
            id: t.value,
            value: t.value,
            label: t.label,
            sublabel: t.sublabel,
            icon: t.icon,
            _selected: t.value === active,
            _disabled: !enabled
        }));
    }
    handleIconSizeChange(event) {
        const value = event.detail?.value || 'auto';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, iconSize: value }
        };
    }

    handleIconShapeChange(event) {
        const value = event.detail?.value || 'none';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, iconShape: value }
        };
    }
    handleIconStyleChange(event) {
        const value = event.detail?.value || 'filled';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, iconStyle: value }
        };
    }
    handleIconShadingChange(event) {
        const value = event.detail?.value || 'flat';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, iconShading: value }
        };
    }
    handleIconToneChange(event) {
        const value = event.currentTarget?.dataset?.value;
        if (!value) return;
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, iconTone: value }
        };
    }
    handleIconToneHexChange(event) {
        const value = event.target?.value || '';
        this._config = {
            ...this._config,
            gridConfig: { ...this._config.gridConfig, iconToneHex: value }
        };
    }

    // --- Shared tone-chip builder --------------------------------------
    _buildToneChips(active, enabled) {
        return TONE_SWATCHES.map((t) => ({
            value: t.value, label: t.label,
            className: this._toneChipClass(t.value, active, enabled),
            ariaPressed: String(t.value === active),
            dotClassName: `pflow-tone-chip__dot pflow-tone-chip__dot_${t.value}`,
            disabled: !enabled
        }));
    }

    _toneChipClass(value, active, enabled) {
        const parts = ['pflow-tone-chip', `pflow-tone-chip_${value}`];
        if (value === active) parts.push('pflow-tone-chip_active');
        if (!enabled) parts.push('pflow-tone-chip_disabled');
        return parts.join(' ');
    }


    // --- Badge configuration ---
    get badgeCfg() { return this._config?.gridConfig?.badge || {}; }
    get badgePosition() { return this.badgeCfg.position || 'bottom-inline'; }
    get badgeVariant() { return this.badgeCfg.variant || 'neutral'; }
    get badgeShape() { return this.badgeCfg.shape || 'pill'; }
    get badgePositionChips() {
        return BADGE_POSITIONS.map((p) => ({
            ...p,
            className: `pflow-badge-pos-chip pflow-badge-pos-chip_${p.value}${
                p.value === this.badgePosition ? ' pflow-badge-pos-chip_active' : ''
            }`,
            dotClass: `pflow-badge-pos-chip__dot pflow-badge-pos-chip__dot_${p.value}`
        }));
    }
    // Unified tone chip row — same palette + rendering as every other color
    // axis. Inverse is kept (SLDS-specific "dark mode" badge) and appended
    // after the 8 presets. Custom unlocks a hex picker inline.
    get badgeVariantChips() {
        const active = this.badgeVariant;
        const all = [...TONE_SWATCHES];
        // Insert 'inverse' before 'custom' so it sits adjacent to the other
        // high-contrast options without breaking the custom-is-last rhythm.
        all.splice(all.length - 1, 0, { value: 'inverse', label: 'Inverse' });
        return all.map((t) => ({
            value: t.value,
            label: t.label,
            className: this._toneChipClass(t.value, active, true),
            ariaPressed: String(t.value === active),
            dotClassName: `pflow-tone-chip__dot pflow-tone-chip__dot_${t.value}`,
            disabled: false
        }));
    }
    get badgeVariantIsCustom() { return this.badgeVariant === 'custom'; }
    get badgeVariantHexValue() { return this.badgeCfg?.variantHex || ''; }
    handleBadgeVariantHexChange(event) {
        const value = event.target?.value || '';
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                badge: { ...this.badgeCfg, variantHex: value }
            }
        };
    }
    get badgeShapeChips() {
        return BADGE_SHAPES.map((s) => ({
            ...s,
            className: `pflow-badge-shape-chip${
                s.value === this.badgeShape ? ' pflow-badge-shape-chip_active' : ''
            }`,
            badgeClass: `pflow-vpick__badge pflow-vpick__badge_variant-${this.badgeVariant} pflow-vpick__badge_shape-${s.value}`
        }));
    }

    handleBadgePositionChange(event) {
        const value = event.currentTarget?.dataset?.value;
        if (!value) return;
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                badge: { ...this.badgeCfg, position: value }
            }
        };
    }
    handleBadgeVariantChange(event) {
        const value = event.currentTarget?.dataset?.value;
        if (!value) return;
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                badge: { ...this.badgeCfg, variant: value }
            }
        };
    }
    handleBadgeShapeChange(event) {
        const value = event.currentTarget?.dataset?.value;
        if (!value) return;
        this._config = {
            ...this._config,
            gridConfig: {
                ...this._config.gridConfig,
                badge: { ...this.badgeCfg, shape: value }
            }
        };
    }

    // --- Visual tile pickers (use our own c-pflow-atom-visual-pick) ---
    get sourceTiles() {
        const active = this._config?.dataSource;
        return SOURCE_TILES.map((t) => ({
            id: t.value,
            value: t.value,
            label: t.label,
            sublabel: t.sublabel,
            icon: t.icon,
            _selected: t.value === active
        }));
    }
    // ========================================================================
    // Per-layout visibility — hide Appearance controls that don't apply to the
    // current layout so admins aren't tweaking dials that do nothing.
    //   grid       — all tile controls apply
    //   list       — single column, rows auto-size; hide aspect, columns,
    //                gridMinWidth, gapH
    //   horizontal — single row scroll; hide columns, gapV
    //   dropdown   — native combobox; hide every tile control
    //   radio      — native radio group; hide every tile control
    // ========================================================================
    get _currentLayout() { return this._config?.layout || 'grid'; }
    get isTileLayout() {
        const l = this._currentLayout;
        return l !== 'dropdown' && l !== 'radio';
    }
    get showTileSize() { return this.isTileLayout; }
    get showAspectRatio() {
        const l = this._currentLayout;
        return l === 'grid' || l === 'horizontal';
    }
    get showColumns() { return this._currentLayout === 'grid'; }
    get showGridMinWidth() {
        const l = this._currentLayout;
        return l === 'grid' || l === 'horizontal';
    }
    get showGapHorizontal() {
        const l = this._currentLayout;
        return l === 'grid' || l === 'horizontal';
    }
    get showGapVertical() {
        const l = this._currentLayout;
        return l === 'grid' || l === 'list';
    }
    get showGapCard() { return this.showGapHorizontal || this.showGapVertical; }
    get showSelectionIndicator() { return this.isTileLayout; }
    get showElevation() { return this.isTileLayout; }
    get showBadgeCard() { return this.isTileLayout; }
    get showMarginPadding() { return this.isTileLayout; }

    get layoutTiles() {
        const active = this._config?.layout || 'grid';
        // Dropdown + radio are native single-select controls — the platform
        // primitives (lightning-combobox / lightning-radio-group) don't have
        // a multi-value mode. Disable them when multi is active so the admin
        // can't land in an unusable combination.
        const multi = this._config?.selectionMode === 'multi';
        return LAYOUT_TILES.map((t) => {
            const isSingleOnly = t.value === 'dropdown' || t.value === 'radio';
            const disabled = multi && isSingleOnly;
            return {
                id: t.value,
                value: t.value,
                label: t.label,
                sublabel: disabled ? 'Single-select only' : t.sublabel,
                icon: t.icon,
                _selected: t.value === active,
                _disabled: disabled
            };
        });
    }
    get selectionTiles() {
        const active = this._config?.selectionMode || 'single';
        return SELECTION_TILES.map((t) => ({
            id: t.value,
            value: t.value,
            label: t.label,
            sublabel: t.sublabel,
            icon: t.icon,
            _selected: t.value === active
        }));
    }

    handleSourceTileChange(event) {
        const value = event.detail?.value;
        if (!value) return;
        this._config = { ...this._config, dataSource: value };
    }
    handleLayoutTileChange(event) {
        const value = event.detail?.value || 'grid';
        // Guard against multi + dropdown/radio — if the admin somehow fires
        // this handler on a disabled tile (programmatic paths, old listeners),
        // silently coerce to grid rather than land in a broken state.
        const multi = this._config?.selectionMode === 'multi';
        if (multi && (value === 'dropdown' || value === 'radio')) {
            this._config = { ...this._config, layout: 'grid' };
            return;
        }
        this._config = { ...this._config, layout: value };
    }
    handleSelectionTileChange(event) {
        const value = event.detail?.value || 'single';
        const next = { ...this._config, selectionMode: value };
        if (value === 'multi') {
            next.autoAdvance = false;
            next.includeNoneOption = false;
            // Flip off native single-select-only layouts when going multi.
            if (next.layout === 'dropdown' || next.layout === 'radio') {
                next.layout = 'grid';
            }
        }
        this._config = next;
    }


    // ========================================================================
    // Mode flags
    // ========================================================================
    get hasDataSource() { return Boolean(this._config?.dataSource); }
    get isPicklistMode() { return this._config?.dataSource === 'picklist'; }
    get isCollectionMode() { return this._config?.dataSource === 'collection'; }
    get isStringCollectionMode() { return this._config?.dataSource === 'stringCollection'; }
    get isSObjectMode() { return this._config?.dataSource === 'sobject'; }
    get isCustomMode() { return this._config?.dataSource === 'custom'; }
    get isSingleSelect() { return this._config?.selectionMode === 'single'; }
    get isMultiSelect() { return this._config?.selectionMode === 'multi'; }
    get canCustomizeValues() {
        return this.isPicklistMode || this.isSObjectMode || this.isStringCollectionMode;
    }

    // ── String collection values (drive preview + overrides) ──────────────
    // Preferred source: the bound Flow resource's design-time values, resolved
    // from builderContext. Falls back to a manual textarea only when the bound
    // variable has no accessible values at design time (common for free-form
    // String[] variables with no default). Runtime always uses the actual
    // value of the @api `sourceStrings` input.
    get stringCollectionSampleRaw() {
        return this._config?.stringCollection?.sampleValues || '';
    }

    // Walks builderContext for the bound variable's name and returns an array
    // of strings. Supports: variables with default array values, constants
    // with scalar value (single-item array), and choice-set-like resources
    // with nested {label,value} options. Returns [] when the resource exists
    // but has no design-time payload, or when the ref is unbound.
    _resolveStringValuesFromBuilderContext(rawRef) {
        if (!rawRef || !this.builderContext) return [];
        // Strip {!Name} merge-field syntax — resource picker emits this form.
        const ref = String(rawRef).trim()
            .replace(/^\{!\s*/, '')
            .replace(/\s*\}$/, '')
            .trim();
        if (!ref) return [];

        // Buckets in builderContext that can hold named resources.
        const buckets = [
            'variables', 'constants', 'choices',
            'dynamicChoiceSets', 'picklistChoiceSets',
            'recordChoiceSets', 'collectionChoiceSets',
            'formulas', 'textTemplates'
        ];

        for (const bucket of buckets) {
            const list = this.builderContext[bucket];
            if (!Array.isArray(list)) continue;
            const match = list.find((r) => r?.name === ref);
            if (!match) continue;

            // Try the most common default-value property names in order.
            const candidates = [
                match.value, match.defaultValue, match.values,
                match.defaultValues, match.options, match.items
            ];
            for (const c of candidates) {
                if (Array.isArray(c)) {
                    return c.map((v) => this._coerceStringFromResourceValue(v))
                        .filter((s) => s.length > 0);
                }
                // Scalar string value (constants) — treat as a one-item array.
                if (typeof c === 'string' && c.length > 0 && match.isCollection !== true) {
                    return [c];
                }
            }
        }
        return [];
    }

    // Choice-style entries often nest as {label, value} or {stringValue};
    // constants are scalar strings. Coalesce all into a plain string.
    _coerceStringFromResourceValue(v) {
        if (typeof v === 'string') return v;
        if (v && typeof v === 'object') {
            return String(v.value ?? v.stringValue ?? v.label ?? '');
        }
        return String(v ?? '');
    }

    get resolvedStringCollectionValues() {
        return this._resolveStringValuesFromBuilderContext(this._sourceStringsRef);
    }

    get hasResolvedStringValues() {
        return this.resolvedStringCollectionValues.length > 0;
    }

    // The canonical list used by both preview and per-item overrides.
    // Prefer real design-time values; fall back to the textarea for unbound
    // or blank-default variables so overrides are still configurable.
    get stringCollectionSampleStrings() {
        const fromContext = this.resolvedStringCollectionValues;
        if (fromContext.length > 0) return fromContext;
        const raw = this.stringCollectionSampleRaw;
        if (!raw) return [];
        return raw
            .split(/[\n,]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    }

    // UI-only pill preview of the resolved values, capped so a huge variable
    // doesn't blow out the source-setup card.
    get resolvedStringValuePreview() {
        const values = this.resolvedStringCollectionValues;
        const cap = 24;
        const pills = values.slice(0, cap).map((v, i) => ({
            key: `rsv-${i}`,
            label: v
        }));
        if (values.length > cap) {
            pills.push({ key: 'rsv-more', label: `+${values.length - cap} more` });
        }
        return pills;
    }

    get resolvedStringCountLabel() {
        const n = this.resolvedStringCollectionValues.length;
        return `${n} value${n === 1 ? '' : 's'} detected`;
    }

    handleStringSamplesChange(event) {
        const v = event.target?.value ?? '';
        this._config = {
            ...this._config,
            stringCollection: { ...(this._config?.stringCollection || {}), sampleValues: v }
        };
    }

    get sourceKindLabel() {
        const opt = SOURCE_TILES.find((o) => o.value === this._config?.dataSource);
        return opt ? opt.label : '';
    }
    get sourceSetupTitle() {
        return this.sourceKindLabel ? `${this.sourceKindLabel} setup` : 'Source setup';
    }
    get sourceKindIcon() {
        const tile = SOURCE_TILES.find((t) => t.value === this._config?.dataSource);
        return tile?.icon || 'utility:database';
    }
    get sourceSetupSubtitle() {
        if (this.isPicklistMode) return 'Point to an object and pick its picklist field.';
        if (this.isCollectionMode) return 'Bind a Flow record collection and map fields to the tile slots.';
        if (this.isStringCollectionMode) return 'Bind a Flow String[] variable — each string becomes a tile.';
        if (this.isSObjectMode) return 'Query an object and map the result fields into the tile.';
        if (this.isCustomMode) return 'Head to the Items section to type your options directly.';
        return '';
    }
    get hasPicklistValues() { return this._picklistValues.length > 0; }
    get hasSampleRows() { return this._sobjectSampleRows.length > 0; }

    // ========================================================================
    // Section navigation
    // ========================================================================
    get sections() {
        return SECTIONS.map((s) => {
            const status = this.sectionStatus(s.key);
            const active = s.key === this._activeSection;
            // Only surface a status pip when something actually needs attention.
            // Always-on green dots were visual noise — if everything's fine,
            // the chapter hue carries the signal.
            const showStatus = status === 'warn' || status === 'error';
            return {
                ...s,
                active,
                showStatus,
                statusClass: `pflow-studio__nav-status pflow-studio__nav-status_${status}`,
                buttonClass: active
                    ? 'pflow-studio__nav-btn pflow-studio__nav-btn_active'
                    : 'pflow-studio__nav-btn',
                ariaCurrent: active ? 'page' : null
            };
        });
    }

    sectionStatus(key) {
        const issues = this.sectionIssues(key);
        if (issues.errors.length) return 'error';
        if (issues.warnings.length) return 'warn';
        return 'ok';
    }

    sectionIssues(key) {
        const errors = [];
        const warnings = [];
        const c = this._config || {};
        if (key === 'data') {
            if (!c.dataSource) {
                errors.push('Pick a data source to continue.');
            } else if (this.isPicklistMode) {
                if (!c.picklist?.objectApiName) errors.push('Select a Salesforce object.');
                if (!c.picklist?.fieldApiName) errors.push('Select a picklist field.');
            } else if (this.isCollectionMode) {
                if (!this._sourceRecordsRef) warnings.push('No Flow collection variable bound yet.');
            } else if (this.isStringCollectionMode) {
                if (!this._sourceStringsRef) warnings.push('No Flow String[] variable bound yet.');
            } else if (this.isSObjectMode) {
                if (!c.sobject?.sObjectApiName) errors.push('Select a Salesforce object.');
                if (!c.sobject?.labelField) warnings.push('Set a label field.');
            } else if (this.isCustomMode) {
                if ((c.custom?.items?.length || 0) === 0) warnings.push('Add at least one custom item.');
                const items = c.custom?.items || [];
                const missingLabel = items.filter((it) => !it.label).length;
                if (missingLabel) warnings.push(`${missingLabel} item${missingLabel === 1 ? '' : 's'} missing a label.`);
            }
        } else if (key === 'behavior') {
            const min = Number(c.minSelections || 0);
            const max = c.maxSelections == null ? null : Number(c.maxSelections);
            if (c.selectionMode === 'multi' && max != null && max < Math.max(min, 1)) {
                errors.push('Max selections must be ≥ min selections (and ≥ 1).');
            }
            if (c.selectionMode === 'multi' && c.autoAdvance) {
                warnings.push('Auto-advance is single-select only — it has no effect in multi.');
            }
        }
        return { errors, warnings };
    }

    get totalErrorCount() {
        return SECTIONS.reduce((n, s) => n + this.sectionIssues(s.key).errors.length, 0);
    }
    get totalWarningCount() {
        return SECTIONS.reduce((n, s) => n + this.sectionIssues(s.key).warnings.length, 0);
    }
    get hasBlockingErrors() { return this.totalErrorCount > 0; }
    get saveDisabled() { return this.hasBlockingErrors; }
    get saveDisabledTitle() {
        return this.hasBlockingErrors ? `Fix ${this.totalErrorCount} error(s) before saving.` : '';
    }
    get activeSectionIssues() {
        const { errors, warnings } = this.sectionIssues(this._activeSection);
        return [...errors.map((m) => ({ level: 'error', message: m })), ...warnings.map((m) => ({ level: 'warn', message: m }))];
    }
    get hasActiveSectionIssues() { return this.activeSectionIssues.length > 0; }

    // Single-page scroll-jump nav: clicking a nav button scrolls its chapter
    // into view. Active highlight follows IntersectionObserver on the chapter
    // anchors (see renderedCallback). These legacy getters are kept as `true`
    // so the old lwc:if wrappers render all content continuously.
    get isDataSection() { return true; }
    get isDetailsSection() { return true; }
    get isLayoutSection() { return true; }

    handleSectionClick(event) {
        const key = event.currentTarget?.dataset?.key;
        if (!key) return;
        this._activeSection = key;
        this.scrollChapterIntoView(key);
    }

    scrollChapterIntoView(key) {
        const host = this.template.querySelector(`[data-chapter="${key}"]`);
        if (host && typeof host.scrollIntoView === 'function') {
            host.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    renderedCallback() {
        if (this._chapterObserver || !this.template) return;
        const anchors = Array.from(this.template.querySelectorAll('[data-chapter]'));
        if (anchors.length === 0) return;
        const scrollRoot = this.template.querySelector('.pflow-studio__controls');
        if (!scrollRoot) return;
        this._chapterObserver = new IntersectionObserver(
            (entries) => {
                // Pick the top-most visible chapter as the active one.
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) {
                    const key = visible[0].target.getAttribute('data-chapter');
                    if (key && key !== this._activeSection) this._activeSection = key;
                }
            },
            { root: scrollRoot, rootMargin: '-20% 0px -60% 0px', threshold: 0 }
        );
        anchors.forEach((el) => this._chapterObserver.observe(el));
    }

    disconnectedCallback() {
        if (this._chapterObserver) {
            this._chapterObserver.disconnect();
            this._chapterObserver = null;
        }
    }

    // ========================================================================
    // Data source — mode + per-source handlers
    // ========================================================================
    get picklistObjectSelection() {
        const api = this._config?.picklist?.objectApiName;
        return api ? [{ id: api, title: api, icon: 'standard:custom' }] : [];
    }
    get sobjectSelection() {
        const api = this._config?.sobject?.sObjectApiName;
        return api ? [{ id: api, title: api, icon: 'standard:custom' }] : [];
    }

    handleModeChange(event) {
        const mode = event.detail?.value || '';
        this._config = { ...this._config, dataSource: mode };
    }

    async handlePicklistObjectSearch(event) {
        await this.runSObjectSearch(event.detail.searchTerm, event.target);
    }
    handlePicklistObjectSelect(event) {
        const selectedId = event.detail.selectedIds?.[0];
        this._config = {
            ...this._config,
            picklist: { ...this._config.picklist, objectApiName: selectedId || '', fieldApiName: '' }
        };
    }
    handlePicklistFieldChange(event) {
        this._config = {
            ...this._config,
            picklist: { ...this._config.picklist, fieldApiName: event.detail.fieldApiName || '' }
        };
    }
    handleRecordTypeIdChange(event) {
        this._config = {
            ...this._config,
            picklist: { ...this._config.picklist, recordTypeId: this._readValue(event) }
        };
    }
    handleRecordTypeComboChange(event) {
        const value = event.detail?.value || '';
        this._config = {
            ...this._config,
            picklist: { ...this._config.picklist, recordTypeId: value }
        };
    }
    handlePicklistValueSourceChange(event) {
        this._config = {
            ...this._config,
            picklist: { ...this._config.picklist, valueSource: event.detail.value || 'apiName' }
        };
    }

    handleCollectionVariableChange(event) {
        this._sourceRecordsRef = event.detail.newValue || '';
    }
    handleStringCollectionVariableChange(event) {
        this._sourceStringsRef = event.detail.newValue || '';
    }
    handleCollectionFieldMapChange(event) {
        const field = event.currentTarget.dataset.field;
        const value = event.detail.fieldApiName || event.detail.value || '';
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
                sObjectApiName: selectedId || '',
                whereClause: '',
                orderByField: ''
            }
        };
        this._sobjectSampleRows = [];
    }
    handleWhereChange(event) {
        this._config = {
            ...this._config,
            sobject: { ...this._config.sobject, whereClause: event.detail.value || '' }
        };
    }
    handleOrderChange(event) {
        this._config = {
            ...this._config,
            sobject: {
                ...this._config.sobject,
                orderByField: event.detail.orderByField || '',
                orderByDirection: event.detail.orderByDirection || 'ASC'
            }
        };
    }
    handleLimitChange(event) {
        this._config = {
            ...this._config,
            sobject: { ...this._config.sobject, limit: event.detail.queryLimit || 50 }
        };
    }
    handleSObjectFieldChange(event) {
        const field = event.currentTarget.dataset.field;
        this._config = {
            ...this._config,
            sobject: { ...this._config.sobject, [field]: event.detail.fieldApiName || '' }
        };
    }

    async runSObjectSearch(searchTerm, lookupComponent) {
        try {
            const results = await searchSObjectTypes({ searchKey: searchTerm || '' });
            const options = (results || []).map((r) => ({
                id: r.value, title: r.label, subtitle: r.subtitle, icon: r.icon, sObjectType: r.sObjectType
            }));
            if (lookupComponent) lookupComponent.setSearchResults(options);
        } catch (e) {
            if (lookupComponent) lookupComponent.setSearchResults([]);
        }
    }

    // ========================================================================
    // Custom items editor
    // ========================================================================
    get customItems() {
        const items = this._config.custom?.items || [];
        return items.map((item, index) => ({
            ...item,
            index,
            canMoveUp: index === 0,
            canMoveDown: index === items.length - 1
        }));
    }
    handleCustomAddRow() {
        const items = [
            ...(this._config.custom?.items || []),
            { label: '', value: '', sublabel: '', icon: '', badge: '', helpText: '' }
        ];
        this._config = { ...this._config, custom: { items } };
    }
    handleCustomRemoveRow(event) {
        const index = Number(event.currentTarget.dataset.index);
        const items = [...(this._config.custom?.items || [])];
        items.splice(index, 1);
        this._config = { ...this._config, custom: { items } };
    }
    handleCustomDuplicateRow(event) {
        const index = Number(event.currentTarget.dataset.index);
        const items = [...(this._config.custom?.items || [])];
        const clone = JSON.parse(JSON.stringify(items[index]));
        items.splice(index + 1, 0, clone);
        this._config = { ...this._config, custom: { items } };
    }
    handleCustomMoveUp(event) {
        const index = Number(event.currentTarget.dataset.index);
        if (index <= 0) return;
        const items = [...(this._config.custom?.items || [])];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        this._config = { ...this._config, custom: { items } };
    }
    handleCustomMoveDown(event) {
        const index = Number(event.currentTarget.dataset.index);
        const items = [...(this._config.custom?.items || [])];
        if (index >= items.length - 1) return;
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
        this._config = { ...this._config, custom: { items } };
    }
    handleCustomCellChange(event) {
        const index = Number(event.currentTarget.dataset.index);
        const field = event.currentTarget.dataset.field;
        const items = [...(this._config.custom?.items || [])];
        items[index] = { ...items[index], [field]: this._readValue(event) };
        this._config = { ...this._config, custom: { items } };
    }
    handleCustomIconChange(event) {
        const index = Number(event.currentTarget.dataset.index);
        const items = [...(this._config.custom?.items || [])];
        items[index] = { ...items[index], icon: event.detail.iconName || '' };
        this._config = { ...this._config, custom: { items } };
    }

    // ========================================================================
    // Picklist / SObject per-value overrides
    // ========================================================================
    get picklistObjectApiName() {
        return this.isPicklistMode ? (this._config?.picklist?.objectApiName || null) : null;
    }
    get picklistFieldRef() {
        if (!this.isPicklistMode) return undefined;
        const obj = this._config?.picklist?.objectApiName;
        const field = this._config?.picklist?.fieldApiName;
        if (!obj || !field) return undefined;
        return `${obj}.${field}`;
    }
    get picklistRecordTypeId() {
        return this._config?.picklist?.recordTypeId || '012000000000000AAA';
    }
    get picklistValueSource() {
        return this._config?.picklist?.valueSource || 'apiName';
    }

    @track _recordTypeOptions = [];

    @wire(getObjectInfo, { objectApiName: '$picklistObjectApiName' })
    wiredObjectInfo({ data }) {
        if (!data || !data.recordTypeInfos) {
            this._recordTypeOptions = [];
            return;
        }
        const infos = Object.values(data.recordTypeInfos)
            .filter((rt) => rt.available !== false)
            .sort((a, b) => {
                // Master first, then alpha by name
                if (a.master && !b.master) return -1;
                if (!a.master && b.master) return 1;
                return String(a.name || '').localeCompare(String(b.name || ''));
            })
            .map((rt) => ({
                label: rt.master ? `${rt.name} (default)` : rt.name,
                value: rt.recordTypeId
            }));
        this._recordTypeOptions = infos;
    }

    get recordTypeOptions() { return this._recordTypeOptions; }
    get hasRecordTypeOptions() { return this._recordTypeOptions.length > 1; }
    get recordTypeValue() { return this._config?.picklist?.recordTypeId || ''; }

    @wire(getPicklistValues, {
        recordTypeId: '$picklistRecordTypeId',
        fieldApiName: '$picklistFieldRef'
    })
    wiredPicklistValues({ data }) {
        this._picklistValues = data?.values || [];
    }

    get _allOverrideRows() {
        const overrides = this._config?.overrides || {};
        let source = [];
        if (this.isPicklistMode) {
            const useLabel = this.picklistValueSource === 'label';
            source = this._picklistValues.map((v) => ({
                value: useLabel ? v.label : v.value,
                originalLabel: v.label
            }));
        } else if (this.isSObjectMode) {
            source = this._sobjectSampleRows.map((dto) => ({
                value: dto.value || dto.id,
                originalLabel: dto.label || dto.id
            }));
        } else if (this.isStringCollectionMode) {
            // Rows derived from the user-typed sample strings. Each string is
            // both value AND original label (string collections have no
            // separate display text). Overrides are keyed by the string.
            source = this.stringCollectionSampleStrings.map((s) => ({
                value: s,
                originalLabel: s
            }));
        }
        return source.map((row) => {
            const ov = overrides[row.value] || {};
            const hasCustom = OVERRIDE_FIELDS.some((f) => ov[f]);
            return {
                value: row.value,
                originalLabel: row.originalLabel,
                label: ov.label || '',
                icon: ov.icon || '',
                sublabel: ov.sublabel || '',
                badge: ov.badge || '',
                helpText: ov.helpText || '',
                hasCustom
            };
        });
    }

    get overrideRows() {
        const term = (this._overrideSearch || '').trim().toLowerCase();
        const expanded = this._expandedOverrideValue;
        const selection = this._bulkSelection;
        const filtered = term
            ? this._allOverrideRows.filter((r) =>
                `${r.value} ${r.originalLabel} ${r.label}`.toLowerCase().includes(term))
            : this._allOverrideRows;
        return filtered.map((r) => ({
            ...r,
            isExpanded: r.value === expanded,
            ariaExpanded: r.value === expanded ? 'true' : 'false',
            isSelected: Boolean(selection[r.value]),
            rowClass: [
                'pflow-overrides__row',
                r.value === expanded ? 'pflow-overrides__row_expanded' : '',
                r.hasCustom ? 'pflow-overrides__row_customized' : '',
                selection[r.value] ? 'pflow-overrides__row_selected' : ''
            ].filter(Boolean).join(' ')
        }));
    }

    get bulkSelectionCount() {
        return Object.values(this._bulkSelection).filter(Boolean).length;
    }
    get hasBulkSelection() { return this.bulkSelectionCount > 0; }
    get bulkSelectionLabel() { return `${this.bulkSelectionCount} selected`; }

    handleOverrideSearch(event) {
        this._overrideSearch = event.target.value || '';
    }
    handleToggleExpandRow(event) {
        const value = event.currentTarget.dataset.value;
        this._expandedOverrideValue = this._expandedOverrideValue === value ? '' : value;
    }
    handleToggleSelectRow(event) {
        const value = event.currentTarget.dataset.value;
        const next = { ...this._bulkSelection };
        if (next[value]) delete next[value];
        else next[value] = true;
        this._bulkSelection = next;
    }
    handleClearBulkSelection() { this._bulkSelection = {}; }
    handleSelectAllFiltered() {
        const next = { ...this._bulkSelection };
        for (const row of this.overrideRows) next[row.value] = true;
        this._bulkSelection = next;
    }
    handleBulkDraftChange(event) {
        const field = event.currentTarget.dataset.field;
        this._bulkEditDraft = { ...this._bulkEditDraft, [field]: this._readValue(event) };
    }
    handleBulkDraftIconChange(event) {
        this._bulkEditDraft = { ...this._bulkEditDraft, icon: event.detail?.iconName || '' };
    }
    handleApplyBulk() {
        const fields = ['icon', 'sublabel', 'badge', 'helpText'];
        const draft = this._bulkEditDraft;
        const overrides = { ...(this._config?.overrides || {}) };
        const valuesToApply = Object.keys(this._bulkSelection).filter((v) => this._bulkSelection[v]);
        for (const value of valuesToApply) {
            const prev = overrides[value] || {};
            const next = { ...prev };
            for (const f of fields) {
                if (draft[f]) next[f] = draft[f];
            }
            overrides[value] = next;
        }
        this._config = { ...this._config, overrides };
        this._bulkEditDraft = { icon: '', sublabel: '', badge: '', helpText: '' };
        this._bulkSelection = {};
    }

    setOverride(value, field, newValue) {
        if (!value) return;
        const cleaned = newValue || '';
        const prev = this._config.overrides?.[value] || {};
        const nextForValue = { ...prev, [field]: cleaned };
        const empty = OVERRIDE_FIELDS.every((f) => !nextForValue[f]);
        const overrides = { ...(this._config.overrides || {}) };
        if (empty) delete overrides[value];
        else overrides[value] = nextForValue;
        this._config = { ...this._config, overrides };
    }
    handleOverrideCellChange(event) {
        const value = event.currentTarget.dataset.value;
        const field = event.currentTarget.dataset.field;
        this.setOverride(value, field, this._readValue(event));
    }
    handleOverrideIconChange(event) {
        const value = event.currentTarget.dataset.value;
        this.setOverride(value, 'icon', event.detail?.iconName || '');
    }
    handleClearOverride(event) {
        const value = event.currentTarget.dataset.value;
        if (!value) return;
        const overrides = { ...(this._config.overrides || {}) };
        delete overrides[value];
        this._config = { ...this._config, overrides };
    }

    async handleLoadSObjectSample() {
        this._isLoadingSample = true;
        this._sampleLoadError = '';
        try {
            const dtos = await queryItems({
                configJson: JSON.stringify(this.buildSobjectConfigForQuery())
            });
            this._sobjectSampleRows = Array.isArray(dtos) ? dtos : [];
        } catch (e) {
            this._sampleLoadError = e?.body?.message || e?.message || 'Could not load sample rows.';
            this._sobjectSampleRows = [];
        } finally {
            this._isLoadingSample = false;
        }
    }

    buildSobjectConfigForQuery() {
        const s = this._config?.sobject || {};
        return {
            sObjectApiName: s.sObjectApiName,
            whereClause: s.whereClause,
            orderByField: s.orderByField,
            orderByDirection: s.orderByDirection,
            queryLimit: s.limit || 20,
            labelField: s.labelField,
            valueField: s.valueField,
            sublabelField: s.sublabelField,
            iconField: s.iconField,
            badgeField: s.badgeField,
            helpField: s.helpField
        };
    }

    // ========================================================================
    // Layout handlers (grid vs list + grid knobs)
    // ========================================================================
    handleLayoutChange(event) {
        const value = event.detail?.value || 'grid';
        this._config = { ...this._config, layout: value };
    }
    handleGridMinWidthChange(event) {
        const raw = Number(event.target.value);
        const safe = Number.isFinite(raw) ? raw : GRID_SLIDER_RANGES.minWidth.fallback;
        this._config = { ...this._config, gridConfig: { ...this._config.gridConfig, minWidth: formatRem(safe) } };
    }
    handleGridGapHChange(event) {
        const raw = Number(event.target.value);
        const safe = Number.isFinite(raw) ? raw : GRID_SLIDER_RANGES.gapH.fallback;
        this._config = { ...this._config, gridConfig: { ...this._config.gridConfig, gapH: formatRem(safe) } };
    }
    handleGridGapVChange(event) {
        const raw = Number(event.target.value);
        const safe = Number.isFinite(raw) ? raw : GRID_SLIDER_RANGES.gapV.fallback;
        this._config = { ...this._config, gridConfig: { ...this._config.gridConfig, gapV: formatRem(safe) } };
    }

    // Slider getters — parse rem strings to numbers and format display values
    get gridMinWidthRange() { return GRID_SLIDER_RANGES.minWidth; }
    get gridGapHRange() { return GRID_SLIDER_RANGES.gapH; }
    get gridGapVRange() { return GRID_SLIDER_RANGES.gapV; }

    get gridMinWidthNumber() {
        return parseRemValue(this._config?.gridConfig?.minWidth, GRID_SLIDER_RANGES.minWidth.fallback);
    }
    get gridGapHNumber() {
        return parseRemValue(this._config?.gridConfig?.gapH, GRID_SLIDER_RANGES.gapH.fallback);
    }
    get gridGapVNumber() {
        return parseRemValue(this._config?.gridConfig?.gapV, GRID_SLIDER_RANGES.gapV.fallback);
    }
    get gridMinWidthDisplay() { return `${this.gridMinWidthNumber} rem`; }
    get gridGapHDisplay() { return `${this.gridGapHNumber} rem`; }
    get gridGapVDisplay() { return `${this.gridGapVNumber} rem`; }
    get gridMinWidthScaleMin() { return `${GRID_SLIDER_RANGES.minWidth.min} rem`; }
    get gridMinWidthScaleMax() { return `${GRID_SLIDER_RANGES.minWidth.max} rem`; }
    get gridGapHScaleMin() { return `${GRID_SLIDER_RANGES.gapH.min} rem`; }
    get gridGapHScaleMax() { return `${GRID_SLIDER_RANGES.gapH.max} rem`; }
    get gridGapVScaleMin() { return `${GRID_SLIDER_RANGES.gapV.min} rem`; }
    get gridGapVScaleMax() { return `${GRID_SLIDER_RANGES.gapV.max} rem`; }

    // ========================================================================
    // Behavior handlers
    // ========================================================================
    handleSelectionModeChange(event) {
        const mode = event.detail.value;
        const next = { ...this._config, selectionMode: mode };
        if (mode === 'multi') {
            next.autoAdvance = false;
            // None-option only makes sense in single-select (it's a way to
            // "clear" a radio choice). Silently turn it off in multi so the
            // admin doesn't see a ghost setting that won't apply.
            next.includeNoneOption = false;
            // Dropdown/radio are native single-select controls. Fall back to
            // grid so the admin isn't stuck with an unusable layout.
            if (next.layout === 'dropdown' || next.layout === 'radio') {
                next.layout = 'grid';
            }
        }
        this._config = next;
    }
    handleToggleChange(event) {
        const key = event.currentTarget.dataset.key;
        if (!key) return;
        // lightning-input (type=toggle/checkbox) exposes the state on .checked
        // of the event target, NOT as `event.detail.newValue`. Reading the
        // wrong path made every toggle save `false`.
        const checked = event.target?.checked ?? event.detail?.checked ?? false;
        this._config = { ...this._config, [key]: Boolean(checked) };
    }
    handleMinChange(event) {
        this._config = { ...this._config, minSelections: Number(event.target.value) || 0 };
    }
    handleMaxChange(event) {
        const raw = event.target.value;
        this._config = { ...this._config, maxSelections: raw === '' ? null : Number(raw) };
    }
    handleNoneOptionLabelChange(event) {
        const raw = this._readValue(event);
        // Empty string falls back to default at render time; preserve exact
        // admin input here so clearing feels non-destructive.
        this._config = { ...this._config, noneOptionLabel: raw };
    }
    // Derived gates for the Behavior-chapter None-option card.
    // (isSingleSelect is already defined earlier; reused as the availability gate.)
    get isNoneOptionAvailable() { return this.isSingleSelect; }
    get noneOptionValue() { return Boolean(this._config?.includeNoneOption); }
    get noneOptionLabelValue() { return this._config?.noneOptionLabel ?? '--None--'; }
    get noneOptionPositionValue() {
        return this._config?.noneOptionPosition === 'end' ? 'end' : 'start';
    }
    get isNoneOptionLabelDisabled() {
        // Disable the label input when None-option is off OR in multi-select mode
        return !this.isNoneOptionAvailable || !this.noneOptionValue;
    }
    // Position tiles use the same cardselect contract as other tile groups.
    // Mirrors LAYOUT_TILES shape ({value, label, sublabel, icon}) so we can
    // reuse the existing pickgroup CSS + atom tile rendering.
    get noneOptionPositionTiles() {
        const active = this.noneOptionPositionValue;
        const disabled = this.isNoneOptionLabelDisabled;
        return [
            {
                value: 'start',
                label: 'At start',
                sublabel: 'Before items',
                icon: 'utility:collapse_all',
                _selected: active === 'start',
                _disabled: disabled
            },
            {
                value: 'end',
                label: 'At end',
                sublabel: 'After items',
                icon: 'utility:expand_all',
                _selected: active === 'end',
                _disabled: disabled
            }
        ];
    }

    handleNoneOptionPositionChange(event) {
        const v = event.detail?.value;
        if (v !== 'start' && v !== 'end') return;
        this._config = { ...this._config, noneOptionPosition: v };
    }

    handleLabelChange(event) { this._config = { ...this._config, label: this._readValue(event) }; }
    handleHelpTextChange(event) { this._config = { ...this._config, helpText: this._readValue(event) }; }
    handleFieldLevelHelpChange(event) { this._config = { ...this._config, fieldLevelHelp: this._readValue(event) }; }
    handleErrorMessageChange(event) { this._config = { ...this._config, customErrorMessage: this._readValue(event) }; }
    handleEmptyStateChange(event) { this._config = { ...this._config, emptyStateMessage: this._readValue(event) }; }
    handleErrorStateChange(event) { this._config = { ...this._config, errorStateMessage: this._readValue(event) }; }

    // Preview state override — click to force the preview into empty / error.
    handlePreviewStateChange(event) {
        const next = event.currentTarget?.dataset?.state || '';
        this._forcedPreviewState = this._forcedPreviewState === next ? '' : next;
    }
    get previewForcedState() { return this._forcedPreviewState; }
    get previewStateButtons() {
        const active = this._forcedPreviewState;
        const base = 'pflow-studio__state-btn';
        const mk = (state, label, icon) => ({
            state, label, icon,
            className: state === active ? `${base} ${base}_active` : base,
            ariaPressed: String(state === active)
        });
        return [
            mk('',      'Populated', 'utility:success'),
            mk('empty', 'Empty',     'utility:filter_criteria'),
            mk('error', 'Error',     'utility:error')
        ];
    }

    // Unified event-value reader — lightning-input emits via target.value,
    // pflow-organism-resource-picker emits via detail.newValue.
    _readValue(event) {
        const fromDetail = event?.detail?.newValue;
        if (fromDetail !== undefined && fromDetail !== null) return String(fromDetail);
        const fromTarget = event?.target?.value;
        return fromTarget === undefined || fromTarget === null ? '' : String(fromTarget);
    }

    // ========================================================================
    // Preview
    // ========================================================================
    get hasPreviewableSource() {
        if (this.isPicklistMode || this.isSObjectMode || this.isCustomMode) return true;
        // String-collection mode is previewable as soon as the admin types at
        // least one sample value. Before that, fallback preview kicks in.
        if (this.isStringCollectionMode && this.stringCollectionSampleStrings.length > 0) return true;
        return false;
    }
    get showLivePreview() { return this.hasPreviewableSource; }
    get showFallbackPreview() {
        return !this.hasPreviewableSource && this.hasDataSource;
    }
    get previewEmpty() { return !this.hasDataSource; }
    get fallbackPreviewItems() { return SAMPLE_ITEMS.slice(0, 4); }
    get previewCaption() {
        if (!this.hasDataSource) return 'Pick a data source to see your picker come to life.';
        if (this.isCollectionMode) return 'Collection data resolves at runtime — showing sample rows.';
        if (this.isPicklistMode && !this._config?.picklist?.fieldApiName) {
            return 'Choose a picklist field to load real values.';
        }
        if (this.isSObjectMode && !this._config?.sobject?.sObjectApiName) {
            return 'Choose an SObject to preview real rows.';
        }
        if (this.isCustomMode && (this._config?.custom?.items?.length || 0) === 0) {
            return 'Add custom items in the Items section to see them here.';
        }
        return '';
    }
    get previewLayoutLabel() {
        return this._config?.layout === 'list' ? 'List' : 'Grid';
    }
    get previewSelectionLabel() {
        return this._config?.selectionMode === 'multi' ? 'Multi' : 'Single';
    }
    get organismPicklistConfig() { return this._config?.picklist || {}; }
    get organismCustomConfig() { return this._config?.custom || { items: [] }; }
    get organismStringCollectionConfig() {
        // Feeds the live preview. stringCollectionSampleStrings prefers the
        // bound variable's design-time values (resolved from builderContext)
        // and falls back to the admin's typed samples when the variable has
        // no design-time defaults. Runtime always uses the actual @api
        // `sourceStrings` value — this is design-time only.
        return { values: this.stringCollectionSampleStrings };
    }
    get organismSobjectConfig() { return this.buildSobjectConfigForQuery(); }
    get organismOverrides() { return this._config?.overrides || {}; }
    get organismDisplayConfig() {
        return this._config?.display || { sortBy: 'none', sortDirection: 'asc', limit: null };
    }
    get orgGridMinWidth() { return this._config?.gridConfig?.minWidth || '16rem'; }
    get orgGapHorizontal() { return this._config?.gridConfig?.gapH || '2rem'; }
    get orgGapVertical() { return this._config?.gridConfig?.gapV || '2rem'; }
    get orgSize() { return this._config?.gridConfig?.size || 'medium'; }
    get orgAspectRatio() { return this._config?.gridConfig?.aspectRatio || '1:1'; }
    get orgBadgePosition() { return this._config?.gridConfig?.badge?.position || 'bottom-inline'; }
    get orgBadgeVariant() { return this._config?.gridConfig?.badge?.variant || 'neutral'; }
    get orgBadgeShape() { return this._config?.gridConfig?.badge?.shape || 'pill'; }
    get orgColumns() {
        const n = Number(this._config?.gridConfig?.columns);
        return Number.isFinite(n) && n >= 1 && n <= 6 ? n : undefined;
    }
    get orgSelectionIndicator() { return this._config?.gridConfig?.selectionIndicator || 'checkmark'; }
    get orgElevation() { return this._config?.gridConfig?.elevation || 'outlined'; }
    get orgPattern() { return this._config?.gridConfig?.pattern || 'none'; }
    get orgPatternTone() { return this._config?.gridConfig?.patternTone || 'neutral'; }
    get orgCornerStyle() { return this._config?.gridConfig?.cornerStyle || 'none'; }
    get orgCornerTone() { return this._config?.gridConfig?.cornerTone || 'neutral'; }
    get orgSurfaceStyle() { return this._config?.gridConfig?.surfaceStyle || 'solid'; }
    get orgSurfaceTone() { return this._config?.gridConfig?.surfaceTone || 'neutral'; }
    get orgIconDecor() { return this._config?.gridConfig?.iconDecor || 'none'; }
    get orgIconShape() { return this._config?.gridConfig?.iconShape || 'none'; }
    get orgIconStyle() { return this._config?.gridConfig?.iconStyle || 'filled'; }
    get orgIconShading() { return this._config?.gridConfig?.iconShading || 'flat'; }
    get orgIconTone() { return this._config?.gridConfig?.iconTone || 'neutral'; }
    get orgIconGlyphTone() { return this._config?.gridConfig?.iconGlyphTone || 'auto'; }
    get orgIconGlyphToneHex() { return this._config?.gridConfig?.iconGlyphToneHex || ''; }
    get orgIconSize() {
        const raw = this._config?.gridConfig?.iconSize;
        return raw && raw !== 'auto' ? raw : 'large';
    }
    get orgIconToneHex() { return this._config?.gridConfig?.iconToneHex || ''; }
    get orgPatternToneHex() { return this._config?.gridConfig?.patternToneHex || ''; }
    get orgCornerToneHex() { return this._config?.gridConfig?.cornerToneHex || ''; }
    get orgSurfaceToneHex() { return this._config?.gridConfig?.surfaceToneHex || ''; }
    get orgBadgeVariantHex() { return this._config?.gridConfig?.badge?.variantHex || ''; }
    get orgShowIcons()  { return this._config?.gridConfig?.showIcons !== false; }
    get orgShowBadges() { return this._config?.gridConfig?.showBadges !== false; }
    get orgMarginTop() { return this._config?.gridConfig?.margin?.top ?? 'none'; }
    get orgMarginRight() { return this._config?.gridConfig?.margin?.right ?? 'none'; }
    get orgMarginBottom() { return this._config?.gridConfig?.margin?.bottom ?? 'none'; }
    get orgMarginLeft() { return this._config?.gridConfig?.margin?.left ?? 'none'; }
    get orgPaddingTop() { return this._config?.gridConfig?.padding?.top || undefined; }
    get orgPaddingRight() { return this._config?.gridConfig?.padding?.right || undefined; }
    get orgPaddingBottom() { return this._config?.gridConfig?.padding?.bottom || undefined; }
    get orgPaddingLeft() { return this._config?.gridConfig?.padding?.left || undefined; }
    get previewKey() { return JSON.stringify(this._config || {}); }

    // ========================================================================
    // Resizable panel grid (2 panels, 1 splitter)
    // ========================================================================
    get gridStyle() {
        return `--pflow-studio-left-w: ${this._leftWidth}px`;
    }

    handleSplitterPointerDown(event) {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        this._dragState = {
            startX: event.clientX,
            startLeft: this._leftWidth,
            pointerId: event.pointerId
        };
        event.preventDefault();
    }

    handleSplitterPointerMove(event) {
        const state = this._dragState;
        if (!state) return;
        const dx = event.clientX - state.startX;
        this._leftWidth = this._clampLeft(state.startLeft + dx);
    }

    handleSplitterPointerUp(event) {
        if (!this._dragState) return;
        event.currentTarget.releasePointerCapture?.(this._dragState.pointerId);
        this._dragState = null;
    }

    handleSplitterKeyDown(event) {
        const step = event.shiftKey ? 32 : 8;
        let handled = true;
        if (event.key === 'ArrowLeft') this._leftWidth = this._clampLeft(this._leftWidth - step);
        else if (event.key === 'ArrowRight') this._leftWidth = this._clampLeft(this._leftWidth + step);
        else if (event.key === 'Home') this._leftWidth = 240;
        else if (event.key === 'End') this._leftWidth = 520;
        else handled = false;
        if (handled) event.preventDefault();
    }

    _clampLeft(v) {
        return Math.max(240, Math.min(520, Math.round(v)));
    }

    get leftAriaValueNow() { return this._leftWidth; }

    // ========================================================================
    // Close
    // ========================================================================
    handleSave() {
        if (this.hasBlockingErrors) return;
        this.close({
            action: 'save',
            config: this._config,
            sourceRecordsRef: this._sourceRecordsRef,
            sourceStringsRef: this._sourceStringsRef
        });
    }
    handleCancel() {
        this.close({ action: 'cancel' });
    }
}
