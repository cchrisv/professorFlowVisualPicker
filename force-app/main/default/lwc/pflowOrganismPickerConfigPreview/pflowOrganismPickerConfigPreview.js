import { api, LightningElement } from "lwc";
import { SAMPLE_ITEMS } from "c/pflowUtilityPickerDataSources";
import { buildSobjectConfigForQuery } from "c/pflowUtilityPickerConfigState";

export default class PflowOrganismPickerConfigPreview extends LightningElement {
  @api config;
  @api forcedState = "";
  @api stringCollectionSampleStrings = [];

  handlePreviewStateChange(event) {
    this.dispatchEvent(
      new CustomEvent("previewstatechange", {
        detail: event.currentTarget?.dataset?.state || ""
      })
    );
  }

  get c() {
    return this.config || {};
  }
  get gridConfig() {
    return this.c.gridConfig || {};
  }
  get badgeConfig() {
    return this.gridConfig.badge || {};
  }
  get hasDataSource() {
    return Boolean(this.c.dataSource);
  }
  get isPicklistMode() {
    return this.c.dataSource === "picklist";
  }
  get isSObjectMode() {
    return this.c.dataSource === "sobject";
  }
  get isCustomMode() {
    return this.c.dataSource === "custom";
  }
  get isStringCollectionMode() {
    return this.c.dataSource === "stringCollection";
  }

  get previewStateButtons() {
    const active = this.forcedState;
    const base = "pflow-studio__state-btn";
    const makeButton = (state, label, icon) => ({
      state,
      label,
      icon,
      className: state === active ? `${base} ${base}_active` : base,
      ariaPressed: String(state === active)
    });
    return [
      makeButton("", "Populated", "circle-check"),
      makeButton("empty", "Empty", "funnel"),
      makeButton("error", "Error", "circle-alert")
    ];
  }

  get hasPreviewableSource() {
    if (this.isPicklistMode || this.isSObjectMode || this.isCustomMode)
      return true;
    return (
      this.isStringCollectionMode &&
      this.stringCollectionSampleStrings.length > 0
    );
  }
  get showLivePreview() {
    return this.hasPreviewableSource;
  }
  get showFallbackPreview() {
    return !this.hasPreviewableSource && this.hasDataSource;
  }
  get previewEmpty() {
    return !this.hasDataSource;
  }
  get fallbackPreviewItems() {
    return SAMPLE_ITEMS.slice(0, 4);
  }
  get fallbackCustomConfig() {
    return { items: this.fallbackPreviewItems };
  }

  get previewCaption() {
    if (!this.hasDataSource)
      return "Pick a data source to see your picker come to life.";
    if (this.c.dataSource === "collection")
      return "Collection data resolves at runtime — showing sample rows.";
    if (this.isPicklistMode && !this.c.picklist?.fieldApiName) {
      return "Choose a picklist field to load real values.";
    }
    if (this.isSObjectMode && !this.c.sobject?.sObjectApiName) {
      return "Choose an SObject to preview real rows.";
    }
    if (this.isCustomMode && (this.c.custom?.items?.length || 0) === 0) {
      return "Add custom items in the Items section to see them here.";
    }
    return "";
  }

  get previewLayoutLabel() {
    const labels = {
      grid: "Grid",
      list: "List",
      horizontal: "Horizontal",
      dropdown: "Dropdown",
      radio: "Radio"
    };
    return labels[this.c.layout] || "Grid";
  }
  get previewSelectionLabel() {
    return this.c.selectionMode === "multi" ? "Multi" : "Single";
  }
  get organismPicklistConfig() {
    return this.c.picklist || {};
  }
  get organismCustomConfig() {
    return this.c.custom || { items: [] };
  }
  get organismStringCollectionConfig() {
    return { values: this.stringCollectionSampleStrings };
  }
  get organismSobjectConfig() {
    return buildSobjectConfigForQuery(this.c);
  }
  get organismOverrides() {
    return this.c.overrides || {};
  }
  get organismDisplayConfig() {
    return (
      this.c.display || { sortBy: "none", sortDirection: "asc", limit: null }
    );
  }

  get noneOptionValue() {
    return this.c.includeNoneOption === true;
  }
  get noneOptionLabelValue() {
    return this.c.noneOptionLabel || "--None--";
  }
  get noneOptionPositionValue() {
    return this.c.noneOptionPosition || "start";
  }
  get orgGridMinWidth() {
    return this.gridConfig.minWidth || "16rem";
  }
  get orgGapHorizontal() {
    return this.gridConfig.gapH || "2rem";
  }
  get orgGapVertical() {
    return this.gridConfig.gapV || "2rem";
  }
  get orgSize() {
    return this.gridConfig.size || "medium";
  }
  get orgAspectRatio() {
    return this.gridConfig.aspectRatio || "1:1";
  }
  get orgBadgePosition() {
    return this.badgeConfig.position || "bottom-inline";
  }
  get orgBadgeVariant() {
    return this.badgeConfig.variant || "neutral";
  }
  get orgBadgeShape() {
    return this.badgeConfig.shape || "pill";
  }
  get orgColumns() {
    const n = Number(this.gridConfig.columns);
    return Number.isFinite(n) && n >= 1 && n <= 6 ? n : undefined;
  }
  get orgSelectionIndicator() {
    return this.gridConfig.selectionIndicator || "checkmark";
  }
  get orgElevation() {
    return this.gridConfig.elevation || "outlined";
  }
  get orgPattern() {
    return this.gridConfig.pattern || "none";
  }
  get orgPatternTone() {
    return this.gridConfig.patternTone || "neutral";
  }
  get orgCornerStyle() {
    return this.gridConfig.cornerStyle || "none";
  }
  get orgCornerTone() {
    return this.gridConfig.cornerTone || "neutral";
  }
  get orgSurfaceStyle() {
    return this.gridConfig.surfaceStyle || "solid";
  }
  get orgSurfaceTone() {
    return this.gridConfig.surfaceTone || "neutral";
  }
  get orgIconDecor() {
    return this.gridConfig.iconDecor || "none";
  }
  get orgIconStyle() {
    return this.gridConfig.iconStyle || "filled";
  }
  get orgIconShading() {
    return this.gridConfig.iconShading || "flat";
  }
  get orgIconTone() {
    return this.gridConfig.iconTone || "neutral";
  }
  get orgIconGlyphTone() {
    return this.gridConfig.iconGlyphTone || "auto";
  }
  get orgIconGlyphToneHex() {
    return this.gridConfig.iconGlyphToneHex || "";
  }
  get orgIconSize() {
    const raw = this.gridConfig.iconSize;
    return raw && raw !== "auto" ? raw : "large";
  }
  get orgIconToneHex() {
    return this.gridConfig.iconToneHex || "";
  }
  get orgPatternToneHex() {
    return this.gridConfig.patternToneHex || "";
  }
  get orgCornerToneHex() {
    return this.gridConfig.cornerToneHex || "";
  }
  get orgSurfaceToneHex() {
    return this.gridConfig.surfaceToneHex || "";
  }
  get orgBadgeVariantHex() {
    return this.badgeConfig.variantHex || "";
  }
  get orgShowIcons() {
    return this.gridConfig.showIcons !== false;
  }
  get orgShowBadges() {
    return this.gridConfig.showBadges !== false;
  }
  get orgMarginTop() {
    return this.gridConfig.margin?.top ?? "none";
  }
  get orgMarginRight() {
    return this.gridConfig.margin?.right ?? "none";
  }
  get orgMarginBottom() {
    return this.gridConfig.margin?.bottom ?? "none";
  }
  get orgMarginLeft() {
    return this.gridConfig.margin?.left ?? "none";
  }
  get orgPaddingTop() {
    return this.gridConfig.padding?.top || undefined;
  }
  get orgPaddingRight() {
    return this.gridConfig.padding?.right || undefined;
  }
  get orgPaddingBottom() {
    return this.gridConfig.padding?.bottom || undefined;
  }
  get orgPaddingLeft() {
    return this.gridConfig.padding?.left || undefined;
  }
}
