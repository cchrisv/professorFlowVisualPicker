import { defaultPickerConfig } from "c/pflowUtilityPickerConfigDefaults";

const BUILDER_CONTEXT_RESOURCE_BUCKETS = [
  "variables",
  "constants",
  "choices",
  "dynamicChoiceSets",
  "picklistChoiceSets",
  "recordChoiceSets",
  "collectionChoiceSets",
  "formulas",
  "textTemplates"
];

export function mergePickerConfig(initialConfig) {
  const base = defaultPickerConfig();
  const incoming = initialConfig
    ? JSON.parse(JSON.stringify(initialConfig))
    : {};

  return {
    ...base,
    ...incoming,
    picklist: { ...base.picklist, ...(incoming.picklist || {}) },
    collection: {
      ...base.collection,
      ...(incoming.collection || {}),
      fieldMap: {
        ...base.collection.fieldMap,
        ...(incoming.collection?.fieldMap || {})
      }
    },
    sobject: { ...base.sobject, ...(incoming.sobject || {}) },
    custom: { items: incoming.custom?.items || [] },
    stringCollection: {
      sampleValues: incoming.stringCollection?.sampleValues || ""
    },
    overrides:
      incoming.overrides && typeof incoming.overrides === "object"
        ? incoming.overrides
        : {},
    display: { ...base.display, ...(incoming.display || {}) },
    gridConfig: {
      ...base.gridConfig,
      ...(incoming.gridConfig || {}),
      margin: {
        ...base.gridConfig.margin,
        ...(incoming.gridConfig?.margin || {})
      },
      padding: {
        ...base.gridConfig.padding,
        ...(incoming.gridConfig?.padding || {})
      },
      badge: {
        ...base.gridConfig.badge,
        ...(incoming.gridConfig?.badge || {})
      }
    }
  };
}

export function setConfigPath(config, path, value) {
  if (!Array.isArray(path)) return config;
  if (path.length === 0) return value;
  const [head, ...tail] = path;
  if (tail.length === 0) {
    return { ...(config || {}), [head]: value };
  }
  return {
    ...(config || {}),
    [head]: setConfigPath(config?.[head] || {}, tail, value)
  };
}

export function buildSobjectConfigForQuery(config) {
  const sobject = config?.sobject || {};
  return {
    sObjectApiName: sobject.sObjectApiName || "",
    whereClause: sobject.whereClause || "",
    orderByField: sobject.orderByField || "",
    orderByDirection: sobject.orderByDirection || "ASC",
    queryLimit: Number(sobject.limit || 20),
    labelField: sobject.labelField || "Name",
    valueField: sobject.valueField || "Id",
    sublabelField: sobject.sublabelField || "",
    iconField: sobject.iconField || "",
    badgeField: sobject.badgeField || "",
    helpField: sobject.helpField || ""
  };
}

export function resolveStringValuesFromBuilderContext(builderContext, rawRef) {
  if (!rawRef || !builderContext) return [];
  const ref = normalizeFlowReference(rawRef);
  if (!ref) return [];

  for (const bucket of BUILDER_CONTEXT_RESOURCE_BUCKETS) {
    const list = builderContext[bucket];
    if (!Array.isArray(list)) continue;
    const match = list.find((resource) => resource?.name === ref);
    if (!match) continue;

    const candidates = [
      match.value,
      match.defaultValue,
      match.values,
      match.defaultValues,
      match.options,
      match.items
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate
          .map((entry) => coerceStringFromResourceValue(entry))
          .filter((value) => value.length > 0);
      }
      if (
        typeof candidate === "string" &&
        candidate.length > 0 &&
        match.isCollection !== true
      ) {
        return [candidate];
      }
    }
  }
  return [];
}

export function stringCollectionSamples(
  config,
  builderContext,
  sourceStringsRef
) {
  const fromContext = resolveStringValuesFromBuilderContext(
    builderContext,
    sourceStringsRef
  );
  if (fromContext.length > 0) return fromContext;
  const raw = config?.stringCollection?.sampleValues || "";
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function resolvedStringValuePreview(
  builderContext,
  sourceStringsRef,
  cap = 24
) {
  const values = resolveStringValuesFromBuilderContext(
    builderContext,
    sourceStringsRef
  );
  const pills = values.slice(0, cap).map((label, index) => ({
    key: `rsv-${index}`,
    label
  }));
  if (values.length > cap) {
    pills.push({ key: "rsv-more", label: `+${values.length - cap} more` });
  }
  return pills;
}

function normalizeFlowReference(rawRef) {
  return String(rawRef)
    .trim()
    .replace(/^\{!\s*/, "")
    .replace(/\s*\}$/, "")
    .trim();
}

function coerceStringFromResourceValue(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return String(value.value ?? value.stringValue ?? value.label ?? "");
  }
  return String(value ?? "");
}
