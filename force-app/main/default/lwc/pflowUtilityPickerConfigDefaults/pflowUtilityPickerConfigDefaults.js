export function parseRemValue(value, fallback) {
  if (value == null || value === "") return fallback;
  const match = String(value)
    .trim()
    .match(/^([\d.]+)\s*rem$/i);
  if (!match) return fallback;
  const n = parseFloat(match[1]);
  return Number.isFinite(n) ? n : fallback;
}

export function formatRem(n) {
  const rounded = Math.round(n * 100) / 100;
  return `${rounded}rem`;
}

export function defaultPickerConfig() {
  return {
    dataSource: "",
    layout: "grid",
    selectionMode: "single",
    autoAdvance: false,
    enableSearch: false,
    showSelectAll: false,
    minSelections: 0,
    maxSelections: null,
    required: false,
    customErrorMessage: "",
    label: "",
    helpText: "",
    fieldLevelHelp: "",
    emptyStateMessage: "No options available.",
    errorStateMessage: "Could not load options.",
    picklist: {
      objectApiName: "",
      fieldApiName: "",
      recordTypeId: "",
      valueSource: "apiName"
    },
    collection: {
      fieldMap: {
        label: "",
        sublabel: "",
        icon: "",
        value: "",
        badge: "",
        helpText: ""
      }
    },
    sobject: {
      sObjectApiName: "",
      whereClause: "",
      orderByField: "",
      orderByDirection: "ASC",
      limit: 50,
      labelField: "Name",
      valueField: "Id",
      sublabelField: "",
      iconField: "",
      badgeField: "",
      helpField: ""
    },
    custom: { items: [] },
    stringCollection: { sampleValues: "" },
    includeNoneOption: false,
    noneOptionLabel: "--None--",
    noneOptionPosition: "start",
    manualInput: {
      enabled: false,
      label: "Other",
      minLength: 0,
      maxLength: null
    },
    overrides: {},
    display: { sortBy: "none", sortDirection: "asc", limit: null },
    gridConfig: {
      minWidth: "16rem",
      gapH: "7",
      gapV: "7",
      margin: {
        top: "none",
        right: "none",
        bottom: "none",
        left: "none",
        linked: true
      },
      padding: { top: "", right: "", bottom: "", left: "", linked: true },
      size: "medium",
      aspectRatio: "1:1",
      badge: {
        position: "bottom-inline",
        variant: "neutral",
        shape: "pill",
        variantHex: ""
      },
      columns: null,
      selectionIndicator: "checkmark",
      elevation: "outlined",
      pattern: "none",
      patternTone: "neutral",
      patternHoverTone: "neutral",
      patternSelectedTone: "brand",
      patternDisabledTone: "neutral",
      cornerStyle: "none",
      cornerTone: "neutral",
      surfaceStyle: "solid",
      surfaceTone: "neutral",
      surfaceHoverTone: "neutral",
      surfaceSelectedTone: "brand",
      surfaceDisabledTone: "neutral",
      iconDecor: "none",
      iconStyle: "filled",
      iconShading: "flat",
      iconTone: "neutral",
      iconToneHex: "",
      iconGlyphTone: "auto",
      iconGlyphToneHex: "",
      patternToneHex: "",
      patternHoverToneHex: "",
      patternSelectedToneHex: "",
      patternDisabledToneHex: "",
      cornerToneHex: "",
      surfaceToneHex: "",
      surfaceHoverToneHex: "",
      surfaceSelectedToneHex: "",
      surfaceDisabledToneHex: "",
      showIcons: true,
      showBadges: true
    }
  };
}
