import { api, LightningElement } from "lwc";
import {
  defaultPickerConfig,
  formatRem,
  parseRemValue
} from "c/pflowUtilityPickerConfigDefaults";
import {
  ASPECT_TILES,
  BADGE_POSITIONS,
  BADGE_SHAPES,
  COLUMN_CHIPS,
  CORNER_TILES,
  ELEVATION_TILES,
  GRID_SLIDER_RANGES,
  ICON_SIZE_TILES,
  LAYOUT_TILES,
  PADDING_TILES,
  PATTERN_TILES,
  SELECTION_INDICATOR_TILES,
  SIDE_META,
  SIZE_LAYOUT_MAP,
  SIZE_TILES,
  SPACING_SIDES,
  SPACING_TILES,
  SURFACE_TILES,
  TONE_SWATCHES,
  spacingTileList
} from "c/pflowUtilityPickerConfigOptions";

export default class PflowOrganismPickerAppearanceConfig extends LightningElement {
  @api config;

  get _config() {
    return this.config || defaultPickerConfig();
  }
  set _config(value) {
    this.dispatchEvent(
      new CustomEvent("configpatch", { detail: { path: [], value } })
    );
  }
  get gridConfig() {
    return this._config.gridConfig || {};
  }
  get badgeCfg() {
    return this.gridConfig.badge || {};
  }
  get isLayoutSection() {
    return true;
  }

  get _currentLayout() {
    return this._config.layout || "grid";
  }
  get isTileLayout() {
    return (
      this._currentLayout !== "dropdown" && this._currentLayout !== "radio"
    );
  }
  get showTileSize() {
    return this.isTileLayout;
  }
  get showAspectRatio() {
    return (
      this._currentLayout === "grid" || this._currentLayout === "horizontal"
    );
  }
  get showColumns() {
    return this._currentLayout === "grid";
  }
  get showGridMinWidth() {
    return (
      this._currentLayout === "grid" || this._currentLayout === "horizontal"
    );
  }
  get showGapHorizontal() {
    return (
      this._currentLayout === "grid" || this._currentLayout === "horizontal"
    );
  }
  get showGapVertical() {
    return this._currentLayout === "grid" || this._currentLayout === "list";
  }
  get showGapCard() {
    return this.showGapHorizontal || this.showGapVertical;
  }
  get showSelectionIndicator() {
    return this.isTileLayout;
  }
  get showElevation() {
    return this.isTileLayout;
  }
  get showBadgeCard() {
    return this.isTileLayout;
  }
  get showMarginPadding() {
    return this.isTileLayout;
  }

  get layoutTiles() {
    const active = this._config.layout || "grid";
    const multi = this._config.selectionMode === "multi";
    return LAYOUT_TILES.map((tile) => {
      const singleOnly = tile.value === "dropdown" || tile.value === "radio";
      const disabled = multi && singleOnly;
      return {
        ...tile,
        id: tile.value,
        sublabel: disabled ? "Single-select only" : tile.sublabel,
        _selected: tile.value === active,
        _disabled: disabled
      };
    });
  }
  get sizeTiles() {
    return this.selectedTiles(SIZE_TILES, this.gridConfig.size || "medium");
  }
  get aspectTiles() {
    return this.selectedTiles(
      ASPECT_TILES,
      this.gridConfig.aspectRatio || "1:1"
    );
  }
  get columnChips() {
    const active = this.columnsValue;
    return COLUMN_CHIPS.map((chip) => ({
      ...chip,
      className:
        chip.value === active
          ? "pflow-studio__col-chip pflow-studio__col-chip_active"
          : "pflow-studio__col-chip",
      ariaPressed: String(chip.value === active)
    }));
  }
  get columnsValue() {
    const value = this.gridConfig.columns;
    return value == null ? "" : String(value);
  }
  get selectionIndicatorTiles() {
    return this.selectedTiles(
      SELECTION_INDICATOR_TILES,
      this.gridConfig.selectionIndicator || "checkmark"
    );
  }
  get elevationTiles() {
    return this.selectedTiles(
      ELEVATION_TILES,
      this.gridConfig.elevation || "outlined"
    );
  }

  get patternTiles() {
    return this.selectedTiles(PATTERN_TILES, this.gridConfig.pattern || "none");
  }
  get patternToneChips() {
    return this.buildToneChips(
      this.gridConfig.patternTone || "neutral",
      (this.gridConfig.pattern || "none") !== "none"
    );
  }
  get patternToneIsCustom() {
    return this.gridConfig.patternTone === "custom";
  }
  get patternToneHexValue() {
    return this.gridConfig.patternToneHex || "";
  }

  get cornerTiles() {
    return this.selectedTiles(
      CORNER_TILES,
      this.gridConfig.cornerStyle || "none"
    );
  }
  get cornerToneChips() {
    return this.buildToneChips(
      this.gridConfig.cornerTone || "neutral",
      (this.gridConfig.cornerStyle || "none") !== "none"
    );
  }
  get cornerToneIsCustom() {
    return this.gridConfig.cornerTone === "custom";
  }
  get cornerToneHexValue() {
    return this.gridConfig.cornerToneHex || "";
  }

  get surfaceTiles() {
    return this.selectedTiles(
      SURFACE_TILES,
      this.gridConfig.surfaceStyle || "solid"
    );
  }
  get surfaceToneChips() {
    return this.buildToneChips(
      this.gridConfig.surfaceTone || "neutral",
      (this.gridConfig.surfaceStyle || "solid") !== "solid"
    );
  }
  get surfaceToneIsCustom() {
    return this.gridConfig.surfaceTone === "custom";
  }
  get surfaceToneHexValue() {
    return this.gridConfig.surfaceToneHex || "";
  }

  get showIconsValue() {
    return this.gridConfig.showIcons !== false;
  }
  get showBadgesValue() {
    return this.gridConfig.showBadges !== false;
  }
  get iconSubchapterClass() {
    return this.showIconsValue
      ? "pflow-studio__subchapter"
      : "pflow-studio__subchapter pflow-studio__subchapter_off";
  }
  get badgeSubchapterClass() {
    return this.showBadgesValue
      ? "pflow-studio__subchapter"
      : "pflow-studio__subchapter pflow-studio__subchapter_off";
  }

  get iconSizeTiles() {
    return this.selectedTiles(
      [
        {
          value: "auto",
          label: "Auto",
          sublabel: "Match tile",
          icon: "refresh-cw"
        },
        ...ICON_SIZE_TILES
      ],
      this.gridConfig.iconSize || "auto",
      this.showIconsValue
    );
  }

  get showBadgeGroupCards() {
    return this.showBadgesValue;
  }
  get badgePosition() {
    return this.badgeCfg.position || "bottom-inline";
  }
  get badgeVariant() {
    return this.badgeCfg.variant || "neutral";
  }
  get badgeShape() {
    return this.badgeCfg.shape || "pill";
  }
  get badgePositionChips() {
    return BADGE_POSITIONS.map((chip) => ({
      ...chip,
      className: `pflow-badge-pos-chip pflow-badge-pos-chip_${chip.value}${
        chip.value === this.badgePosition ? " pflow-badge-pos-chip_active" : ""
      }`,
      dotClass: `pflow-badge-pos-chip__dot pflow-badge-pos-chip__dot_${chip.value}`
    }));
  }
  get badgeVariantChips() {
    const all = [...TONE_SWATCHES];
    all.splice(all.length - 1, 0, { value: "inverse", label: "Inverse" });
    return all.map((tone) => ({
      ...tone,
      className: this.toneChipClass(tone.value, this.badgeVariant, true),
      ariaPressed: String(tone.value === this.badgeVariant),
      dotClassName: `pflow-tone-chip__dot pflow-tone-chip__dot_${tone.value}`,
      disabled: false
    }));
  }
  get badgeVariantIsCustom() {
    return this.badgeVariant === "custom";
  }
  get badgeVariantHexValue() {
    return this.badgeCfg.variantHex || "";
  }
  get badgeShapeChips() {
    return BADGE_SHAPES.map((shape) => ({
      ...shape,
      className: `pflow-badge-shape-chip${
        shape.value === this.badgeShape ? " pflow-badge-shape-chip_active" : ""
      }`,
      badgeClass: `pflow-vpick__badge pflow-vpick__badge_variant-${this.badgeVariant} pflow-vpick__badge_shape-${shape.value}`
    }));
  }

  get gapHTiles() {
    return spacingTileList(SPACING_TILES, this.gridConfig.gapH ?? "7");
  }
  get gapVTiles() {
    return spacingTileList(SPACING_TILES, this.gridConfig.gapV ?? "7");
  }
  get marginLinked() {
    return this.gridConfig.margin?.linked !== false;
  }
  get paddingLinked() {
    return this.gridConfig.padding?.linked !== false;
  }
  get marginAllTiles() {
    return spacingTileList(
      SPACING_TILES,
      this.gridConfig.margin?.top ?? "none"
    );
  }
  get paddingAllTiles() {
    return spacingTileList(PADDING_TILES, this.gridConfig.padding?.top ?? "");
  }
  get marginSideSections() {
    return this.sideSections(
      SPACING_TILES,
      this.gridConfig.margin || {},
      "none"
    );
  }
  get paddingSideSections() {
    return this.sideSections(PADDING_TILES, this.gridConfig.padding || {}, "");
  }

  get gridMinWidthRange() {
    return GRID_SLIDER_RANGES.minWidth;
  }
  get gridMinWidthNumber() {
    return parseRemValue(
      this.gridConfig.minWidth,
      GRID_SLIDER_RANGES.minWidth.fallback
    );
  }
  get gridMinWidthDisplay() {
    return `${this.gridMinWidthNumber} rem`;
  }
  get gridMinWidthScaleMin() {
    return `${GRID_SLIDER_RANGES.minWidth.min} rem`;
  }
  get gridMinWidthScaleMax() {
    return `${GRID_SLIDER_RANGES.minWidth.max} rem`;
  }

  handleLayoutTileChange(event) {
    const value = event.detail?.value || "grid";
    if (
      this._config.selectionMode === "multi" &&
      (value === "dropdown" || value === "radio")
    ) {
      this._config = { ...this._config, layout: "grid" };
      return;
    }
    this._config = { ...this._config, layout: value };
  }
  handleSizeTileChange(event) {
    const value = event.detail?.value || "medium";
    const layout = SIZE_LAYOUT_MAP[value] || SIZE_LAYOUT_MAP.medium;
    this.patchGrid({ size: value, minWidth: layout.column });
  }
  handleAspectChange(event) {
    this.patchGrid({ aspectRatio: event.detail?.value || "1:1" });
  }
  handleColumnsChange(event) {
    const raw = event.currentTarget?.dataset?.value;
    this.patchGrid({ columns: raw === "" ? null : Number(raw) });
  }
  handleSelectionIndicatorChange(event) {
    this.patchGrid({ selectionIndicator: event.detail?.value || "checkmark" });
  }
  handleElevationChange(event) {
    this.patchGrid({ elevation: event.detail?.value || "outlined" });
  }
  handlePatternChange(event) {
    this.patchGrid({ pattern: event.detail?.value || "none" });
  }
  handleCornerChange(event) {
    this.patchGrid({ cornerStyle: event.detail?.value || "none" });
  }
  handleSurfaceChange(event) {
    this.patchGrid({ surfaceStyle: event.detail?.value || "solid" });
  }
  handleIconSizeChange(event) {
    this.patchGrid({ iconSize: event.detail?.value || "auto" });
  }
  handleGapHorizontalToken(event) {
    this.patchGrid({ gapH: event.detail?.value ?? "7" });
  }
  handleGapVerticalToken(event) {
    this.patchGrid({ gapV: event.detail?.value ?? "7" });
  }
  handleGridMinWidthChange(event) {
    const raw = Number(event.target.value);
    this.patchGrid({
      minWidth: formatRem(
        Number.isFinite(raw) ? raw : GRID_SLIDER_RANGES.minWidth.fallback
      )
    });
  }

  handlePatternToneChange(event) {
    this.patchDatasetGrid(event, "patternTone");
  }
  handleCornerToneChange(event) {
    this.patchDatasetGrid(event, "cornerTone");
  }
  handleSurfaceToneChange(event) {
    this.patchDatasetGrid(event, "surfaceTone");
  }
  handlePatternToneHexChange(event) {
    this.patchGrid({ patternToneHex: event.target?.value || "" });
  }
  handleCornerToneHexChange(event) {
    this.patchGrid({ cornerToneHex: event.target?.value || "" });
  }
  handleSurfaceToneHexChange(event) {
    this.patchGrid({ surfaceToneHex: event.target?.value || "" });
  }
  handleShowIconsToggle(event) {
    this.patchGrid({
      showIcons: Boolean(event.detail?.checked ?? event.target?.checked)
    });
  }
  handleShowBadgesToggle(event) {
    this.patchGrid({
      showBadges: Boolean(event.detail?.checked ?? event.target?.checked)
    });
  }
  handleBadgePositionChange(event) {
    this.patchDatasetBadge(event, "position");
  }
  handleBadgeVariantChange(event) {
    this.patchDatasetBadge(event, "variant");
  }
  handleBadgeShapeChange(event) {
    this.patchDatasetBadge(event, "shape");
  }
  handleBadgeVariantHexChange(event) {
    this.patchBadge({ variantHex: event.target?.value || "" });
  }

  handleMarginLinkToggle(event) {
    this.patchBox("margin", Boolean(event.detail?.checked), "none");
  }
  handlePaddingLinkToggle(event) {
    this.patchBox("padding", Boolean(event.detail?.checked), "");
  }
  handleMarginAllChange(event) {
    this.patchBoxAll("margin", event.detail?.value ?? "none");
  }
  handlePaddingAllChange(event) {
    this.patchBoxAll("padding", event.detail?.value ?? "");
  }
  handleMarginSideChange(event) {
    this.patchBoxSide(
      "margin",
      event.currentTarget?.dataset?.side,
      event.detail?.value ?? "none"
    );
  }
  handlePaddingSideChange(event) {
    this.patchBoxSide(
      "padding",
      event.currentTarget?.dataset?.side,
      event.detail?.value ?? ""
    );
  }

  selectedTiles(source, active, enabled = true) {
    return source.map((tile) => ({
      ...tile,
      id: tile.value,
      _selected: tile.value === active,
      _disabled: !enabled
    }));
  }
  buildToneChips(active, enabled) {
    return TONE_SWATCHES.map((tone) => ({
      ...tone,
      className: this.toneChipClass(tone.value, active, enabled),
      ariaPressed: String(tone.value === active),
      dotClassName: `pflow-tone-chip__dot pflow-tone-chip__dot_${tone.value}`,
      disabled: !enabled
    }));
  }
  toneChipClass(value, active, enabled) {
    return [
      "pflow-tone-chip",
      `pflow-tone-chip_${value}`,
      value === active ? "pflow-tone-chip_active" : "",
      enabled ? "" : "pflow-tone-chip_disabled"
    ]
      .filter(Boolean)
      .join(" ");
  }
  sideSections(source, config, fallback) {
    return SIDE_META.map((meta) => ({
      ...meta,
      tiles: spacingTileList(source, config[meta.side] ?? fallback)
    }));
  }
  patchDatasetGrid(event, key) {
    const value = event.currentTarget?.dataset?.value;
    if (value) this.patchGrid({ [key]: value });
  }
  patchDatasetBadge(event, key) {
    const value = event.currentTarget?.dataset?.value;
    if (value) this.patchBadge({ [key]: value });
  }
  patchGrid(values) {
    this._config = {
      ...this._config,
      gridConfig: { ...this.gridConfig, ...values }
    };
  }
  patchBadge(values) {
    this.patchGrid({ badge: { ...this.badgeCfg, ...values } });
  }
  patchBox(name, linked, fallback) {
    const box = { ...(this.gridConfig[name] || {}), linked };
    if (linked) {
      const base = box.top ?? fallback;
      box.top = box.right = box.bottom = box.left = base;
    }
    this.patchGrid({ [name]: box });
  }
  patchBoxAll(name, value) {
    this.patchGrid({
      [name]: {
        linked: true,
        top: value,
        right: value,
        bottom: value,
        left: value
      }
    });
  }
  patchBoxSide(name, side, value) {
    if (!SPACING_SIDES.includes(side)) return;
    this.patchGrid({
      [name]: { ...(this.gridConfig[name] || {}), [side]: value, linked: false }
    });
  }
}
