import { LightningElement, api, track } from "lwc";
import searchLookupDatasetFieldsForObject from "@salesforce/apex/PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject";

// ── Operator sets by field type ──────────────────────────────

const OPS_TEXT = [
  { label: "=", value: "=" },
  { label: "!=", value: "!=" },
  { label: "LIKE", value: "LIKE" },
  { label: "NOT LIKE", value: "NOT LIKE" },
  { label: "IN", value: "IN" },
  { label: "NOT IN", value: "NOT IN" }
];

const OPS_NUMBER = [
  { label: "=", value: "=" },
  { label: "!=", value: "!=" },
  { label: "<", value: "<" },
  { label: ">", value: ">" },
  { label: "<=", value: "<=" },
  { label: ">=", value: ">=" }
];

const OPS_BOOLEAN = [
  { label: "=", value: "=" },
  { label: "!=", value: "!=" }
];

const OPS_DATE = [
  { label: "=", value: "=" },
  { label: "!=", value: "!=" },
  { label: "<", value: "<" },
  { label: ">", value: ">" },
  { label: "<=", value: "<=" },
  { label: ">=", value: ">=" }
];

const OPS_PICKLIST = [
  { label: "=", value: "=" },
  { label: "!=", value: "!=" },
  { label: "IN", value: "IN" },
  { label: "NOT IN", value: "NOT IN" }
];

const OPS_MULTIPICKLIST = [
  { label: "INCLUDES", value: "INCLUDES" },
  { label: "EXCLUDES", value: "EXCLUDES" }
];

const OPS_REFERENCE = [
  { label: "=", value: "=" },
  { label: "!=", value: "!=" },
  { label: "IN", value: "IN" },
  { label: "NOT IN", value: "NOT IN" }
];

export function operatorsForType(fieldType) {
  const t = (fieldType || "").toUpperCase();
  switch (t) {
    case "STRING":
    case "TEXTAREA":
    case "URL":
    case "EMAIL":
    case "PHONE":
    case "ENCRYPTEDSTRING":
      return OPS_TEXT;
    case "INTEGER":
    case "LONG":
    case "DOUBLE":
    case "CURRENCY":
    case "PERCENT":
      return OPS_NUMBER;
    case "BOOLEAN":
      return OPS_BOOLEAN;
    case "DATE":
    case "DATETIME":
    case "TIME":
      return OPS_DATE;
    case "PICKLIST":
    case "COMBOBOX":
      return OPS_PICKLIST;
    case "MULTIPICKLIST":
      return OPS_MULTIPICKLIST;
    case "REFERENCE":
    case "ID":
      return OPS_REFERENCE;
    default:
      return OPS_TEXT;
  }
}

const LOGIC_OPTIONS = [
  { label: "AND", value: "AND" },
  { label: "OR", value: "OR" }
];

const LOGIC_MODES = [
  { label: "All", value: "ALL" },
  { label: "Any", value: "ANY" },
  { label: "Custom", value: "CUSTOM" }
];

const BOOLEAN_OPTIONS = [
  { label: "TRUE", value: "TRUE" },
  { label: "FALSE", value: "FALSE" }
];

let _condSeq = 0;

// ── Serialization ────────────────────────────────────────────

function escapeString(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function serializeValue(raw, fieldType, operator) {
  const t = (fieldType || "").toUpperCase();
  const op = (operator || "").toUpperCase();

  if (
    op === "IN" ||
    op === "NOT IN" ||
    op === "INCLUDES" ||
    op === "EXCLUDES"
  ) {
    const rawStr = String(raw);
    // Merge field as entire collection value: Field IN {!CollectionVar}
    if (rawStr.startsWith("{!") || rawStr.startsWith("{$")) {
      return rawStr;
    }
    const items = rawStr
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (
      t === "INTEGER" ||
      t === "LONG" ||
      t === "DOUBLE" ||
      t === "CURRENCY" ||
      t === "PERCENT"
    ) {
      return "(" + items.join(", ") + ")";
    }
    return "(" + items.map((v) => "'" + escapeString(v) + "'").join(", ") + ")";
  }
  if (t === "BOOLEAN") {
    return String(raw).toUpperCase() === "TRUE" ? "TRUE" : "FALSE";
  }
  if (
    t === "INTEGER" ||
    t === "LONG" ||
    t === "DOUBLE" ||
    t === "CURRENCY" ||
    t === "PERCENT"
  ) {
    return String(raw);
  }
  if (t === "DATE" || t === "DATETIME") {
    return String(raw);
  }
  // Merge fields pass through unquoted
  const str = String(raw);
  if (str.startsWith("{!") || str.startsWith("{$")) {
    return str;
  }
  if (op === "LIKE" || op === "NOT LIKE") {
    if (!str.includes("%") && !str.includes("_")) {
      return "'%" + escapeString(str) + "%'";
    }
    return "'" + escapeString(str) + "'";
  }
  return "'" + escapeString(raw) + "'";
}

function fragmentFor(c) {
  if (!c.field || !c.operator || (c.value === "" && c.value !== 0)) return null;
  const fieldType = c._fieldType || "";
  const val = serializeValue(c.value, fieldType, c.operator);
  return `${c.field} ${c.operator} ${val}`;
}

export function serializeConditions(conditions, logic) {
  const parts = [];
  for (const c of conditions) {
    const frag = fragmentFor(c);
    if (frag) parts.push(frag);
  }
  return parts.join(` ${logic} `);
}

/**
 * Serialize conditions using a custom logic expression like "1 AND (2 OR 3)".
 * Returns empty string when the expression is invalid or references an incomplete condition.
 */
export function serializeConditionsWithCustomLogic(conditions, customLogic) {
  if (!customLogic || !customLogic.trim()) return "";
  const fragments = conditions.map((c) => fragmentFor(c));
  const refs = (customLogic.match(/\d+/g) || []).map(Number);
  for (const n of refs) {
    if (n < 1 || n > fragments.length) return "";
    if (fragments[n - 1] == null) return ""; // incomplete → empty preview
  }
  return customLogic.replace(/\d+/g, (m) => `(${fragments[Number(m) - 1]})`);
}

/**
 * Validate a custom logic expression. Returns { valid, error }.
 */
export function validateCustomLogic(expr, count) {
  if (!expr || !expr.trim())
    return { valid: false, error: "Custom logic is required." };
  const s = expr.trim();

  // Balanced parens
  let depth = 0;
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (depth < 0) return { valid: false, error: "Unbalanced parentheses." };
  }
  if (depth !== 0) return { valid: false, error: "Unbalanced parentheses." };

  // Tokenize
  const flat = s.replace(/[()]/g, " ");
  const tokens = flat.split(/\s+/).filter(Boolean);
  if (!tokens.length) return { valid: false, error: "Expression is empty." };

  for (const t of tokens) {
    if (/^\d+$/.test(t)) {
      const n = Number(t);
      if (n < 1 || n > count) {
        return {
          valid: false,
          error: `Condition #${t} doesn't exist (only ${count} condition${count === 1 ? "" : "s"}).`
        };
      }
    } else if (!/^(AND|OR)$/i.test(t)) {
      return {
        valid: false,
        error: `Unexpected token "${t}". Use numbers, AND, OR, and parentheses.`
      };
    }
  }

  // Alternation check
  const kinds = tokens.map((t) => (/^\d+$/.test(t) ? "N" : "OP"));
  for (let i = 0; i < kinds.length - 1; i++) {
    if (kinds[i] === "OP" && kinds[i + 1] === "OP")
      return { valid: false, error: "Two operators in a row." };
    if (kinds[i] === "N" && kinds[i + 1] === "N")
      return { valid: false, error: "Missing AND / OR between conditions." };
  }
  if (kinds[0] === "OP")
    return { valid: false, error: "Expression starts with an operator." };
  if (kinds[kinds.length - 1] === "OP")
    return { valid: false, error: "Expression ends with an operator." };

  return { valid: true, error: "" };
}

/**
 * Renumber a custom logic expression after a condition is removed.
 * Strips references to the removed index, decrements higher indices, tidies dangling operators.
 */
export function renumberCustomLogic(expr, removedIndex) {
  if (!expr) return "";
  let result = expr;
  // Drop references to the removed index (and an adjacent operator if present)
  const escaped = String(removedIndex);
  result = result.replace(
    new RegExp(`\\s*(AND|OR)\\s+${escaped}\\b`, "gi"),
    ""
  );
  result = result.replace(
    new RegExp(`\\b${escaped}\\s+(AND|OR)\\s*`, "gi"),
    ""
  );
  result = result.replace(new RegExp(`\\b${escaped}\\b`, "g"), "");
  // Decrement higher indices
  result = result.replace(/\b(\d+)\b/g, (m) => {
    const n = Number(m);
    return n > removedIndex ? String(n - 1) : m;
  });
  // Collapse empty parens and simplify single-number parens, normalize whitespace, trim dangling operators
  let prev;
  do {
    prev = result;
    result = result.replace(/\(\s*\)/g, "");
    result = result.replace(/\(\s*(\d+)\s*\)/g, "$1");
  } while (result !== prev);
  result = result.replace(/\s+/g, " ").trim();
  result = result
    .replace(/^\s*(AND|OR)\s+/i, "")
    .replace(/\s+(AND|OR)\s*$/i, "");
  return result.trim();
}

// ── Parsing (best-effort) ────────────────────────────────────

export function parseWhereClause(str) {
  if (!str || !str.trim()) {
    return { conditions: [], logic: "AND" };
  }
  const s = str.trim();
  let logic = "AND";
  let segments;
  if (/ AND /i.test(s) && !/ OR /i.test(s)) {
    logic = "AND";
    segments = s.split(/ AND /i);
  } else if (/ OR /i.test(s) && !/ AND /i.test(s)) {
    logic = "OR";
    segments = s.split(/ OR /i);
  } else if (!/ AND /i.test(s) && !/ OR /i.test(s)) {
    segments = [s];
  } else {
    return null; // Mixed AND/OR — too complex
  }

  const conditions = [];
  const opPattern =
    /^(\w+(?:\.\w+)?)\s+(=|!=|<>|<=|>=|<|>|LIKE|NOT\s+LIKE|NOT\s+IN|IN|INCLUDES|EXCLUDES)\s+(.+)$/i;
  for (const seg of segments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;
    const m = trimmed.match(opPattern);
    if (!m) {
      return null; // Unparseable segment
    }
    const field = m[1];
    const operator = m[2].toUpperCase().replace(/\s+/g, " ");
    let value = m[3].trim();
    // Strip surrounding quotes for simple string values
    if (value.startsWith("'") && value.endsWith("'") && !value.includes("(")) {
      value = value.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\");
      // Strip wrapping % from LIKE values
      if (
        (operator === "LIKE" || operator === "NOT LIKE") &&
        value.startsWith("%") &&
        value.endsWith("%")
      ) {
        value = value.slice(1, -1);
      }
    }
    // Strip parens from IN values
    if (value.startsWith("(") && value.endsWith(")")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((v) => {
          const t = v.trim();
          return t.startsWith("'") && t.endsWith("'") ? t.slice(1, -1) : t;
        })
        .join(", ");
    }
    conditions.push({
      id: `c${++_condSeq}`,
      field,
      operator,
      value,
      _fieldType: ""
    });
  }
  return { conditions, logic };
}

/**
 * Parse an arbitrary SOQL WHERE clause that may mix AND/OR and use parentheses for grouping.
 * Returns { conditions, logicMode, customLogic } or null if unparseable.
 * When the expression is simple (pure AND or pure OR with no parens), returns mode 'ALL' or 'ANY'
 * with customLogic=''.
 */
export function parseCustomWhereClause(str) {
  if (!str || !str.trim()) return null;

  const s = str.trim();
  const parser = {
    pos: 0,
    conditions: [],
    skipWs() {
      while (this.pos < s.length && /\s/.test(s[this.pos])) this.pos++;
    },
    peek() {
      return s[this.pos];
    },
    tryKeyword(kw) {
      this.skipWs();
      const slice = s.substr(this.pos, kw.length);
      if (slice.toUpperCase() !== kw.toUpperCase()) return false;
      const after = this.pos + kw.length;
      if (after < s.length && /\w/.test(s[after])) return false;
      this.pos = after;
      return true;
    },
    parseExpression() {
      const parts = [this.parseTerm()];
      while (true) {
        const before = this.pos;
        if (this.tryKeyword("AND")) {
          parts.push(" AND ");
        } else if (this.tryKeyword("OR")) {
          parts.push(" OR ");
        } else {
          break;
        }
        const right = this.parseTerm();
        if (right == null) {
          this.pos = before;
          parts.pop();
          break;
        }
        parts.push(right);
      }
      return parts.join("");
    },
    parseTerm() {
      this.skipWs();
      if (this.peek() === "(") {
        // Could be a grouping paren. Try to parse as expression.
        const save = this.pos;
        this.pos++; // consume (
        try {
          const inner = this.parseExpression();
          this.skipWs();
          if (this.peek() !== ")") throw new Error("Expected )");
          this.pos++; // consume )
          return "(" + inner + ")";
        } catch {
          this.pos = save;
          return null;
        }
      }
      return this.parseCondition();
    },
    parseCondition() {
      this.skipWs();
      const saveStart = this.pos;
      let field;
      try {
        field = this.parseIdentifier();
      } catch (e) {
        this.pos = saveStart;
        throw e;
      }
      this.skipWs();
      const op = this.parseOperator();
      this.skipWs();
      const rawValue = this.parseValue();
      const value = this.normalizeValue(rawValue, op);
      this.conditions.push({
        id: `c${++_condSeq}`,
        field,
        operator: op,
        value,
        _fieldType: ""
      });
      return String(this.conditions.length);
    },
    parseIdentifier() {
      const start = this.pos;
      while (this.pos < s.length && /[\w.]/.test(s[this.pos])) this.pos++;
      if (this.pos === start) throw new Error("Expected field name");
      return s.slice(start, this.pos);
    },
    parseOperator() {
      const ops = [
        "!=",
        "<>",
        "<=",
        ">=",
        "=",
        "<",
        ">",
        "NOT LIKE",
        "NOT IN",
        "LIKE",
        "IN",
        "INCLUDES",
        "EXCLUDES"
      ];
      const upper = s.substr(this.pos).toUpperCase();
      for (const op of ops) {
        if (upper.startsWith(op)) {
          const afterPos = this.pos + op.length;
          const lastOpChar = op[op.length - 1];
          if (
            /\w/.test(lastOpChar) &&
            afterPos < s.length &&
            /\w/.test(s[afterPos])
          )
            continue;
          this.pos = afterPos;
          return op.replace(/\s+/g, " ");
        }
      }
      throw new Error("Expected operator");
    },
    parseValue() {
      this.skipWs();
      const start = this.pos;
      const firstChar = s[this.pos];

      if (firstChar === "'") {
        this.pos++;
        while (this.pos < s.length) {
          if (s[this.pos] === "\\") {
            this.pos += 2;
            continue;
          }
          if (s[this.pos] === "'") {
            this.pos++;
            return s.slice(start, this.pos);
          }
          this.pos++;
        }
        throw new Error("Unterminated string");
      }

      if (firstChar === "(") {
        // IN list — balanced parens, skip strings
        let depth = 0;
        while (this.pos < s.length) {
          const ch = s[this.pos];
          if (ch === "'") {
            this.pos++;
            while (this.pos < s.length && s[this.pos] !== "'") {
              if (s[this.pos] === "\\") this.pos++;
              this.pos++;
            }
            this.pos++;
            continue;
          }
          if (ch === "(") depth++;
          else if (ch === ")") {
            depth--;
            if (depth === 0) {
              this.pos++;
              return s.slice(start, this.pos);
            }
          }
          this.pos++;
        }
        throw new Error("Unterminated list");
      }

      if (firstChar === "{") {
        while (this.pos < s.length && s[this.pos] !== "}") this.pos++;
        if (this.pos < s.length) this.pos++;
        return s.slice(start, this.pos);
      }

      // Number, boolean, date-literal
      while (this.pos < s.length && /[\w:.\-+]/.test(s[this.pos])) this.pos++;
      if (this.pos === start) throw new Error("Expected value");
      return s.slice(start, this.pos);
    },
    normalizeValue(raw, op) {
      let value = raw;
      const operator = op.toUpperCase();
      if (
        value.startsWith("'") &&
        value.endsWith("'") &&
        !value.includes("(")
      ) {
        value = value.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        if (
          (operator === "LIKE" || operator === "NOT LIKE") &&
          value.startsWith("%") &&
          value.endsWith("%")
        ) {
          value = value.slice(1, -1);
        }
      }
      if (value.startsWith("(") && value.endsWith(")")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((v) => {
            const t = v.trim();
            return t.startsWith("'") && t.endsWith("'") ? t.slice(1, -1) : t;
          })
          .join(", ");
      }
      return value;
    }
  };

  try {
    const expression = parser.parseExpression();
    parser.skipWs();
    if (parser.pos < s.length) return null;
    if (!parser.conditions.length) return null;

    // Classify the resulting expression
    const hasParens = /\(|\)/.test(expression);
    const onlyAnd = /^\s*\d+(?:\s+AND\s+\d+)*\s*$/i.test(expression);
    const onlyOr = /^\s*\d+(?:\s+OR\s+\d+)*\s*$/i.test(expression);

    if (!hasParens && onlyAnd)
      return {
        conditions: parser.conditions,
        logicMode: "ALL",
        customLogic: ""
      };
    if (!hasParens && onlyOr)
      return {
        conditions: parser.conditions,
        logicMode: "ANY",
        customLogic: ""
      };

    // Simplify (N) → N repeatedly so extra parens around single references collapse
    let clean = expression.trim();
    let simPrev;
    do {
      simPrev = clean;
      clean = clean.replace(/\(\s*(\d+)\s*\)/g, "$1");
    } while (clean !== simPrev);
    // Strip redundant outermost parens when the whole expression is wrapped
    while (/^\(.*\)$/.test(clean)) {
      let depth = 0;
      let redundant = true;
      for (let i = 0; i < clean.length - 1; i++) {
        if (clean[i] === "(") depth++;
        else if (clean[i] === ")") depth--;
        if (depth === 0 && i < clean.length - 1) {
          redundant = false;
          break;
        }
      }
      if (!redundant) break;
      clean = clean.slice(1, -1).trim();
    }

    return {
      conditions: parser.conditions,
      logicMode: "CUSTOM",
      customLogic: clean
    };
  } catch {
    return null;
  }
}

// ── Component ────────────────────────────────────────────────

export default class PflowOrganismWhereBuilder extends LightningElement {
  @track conditions = [];
  @track logicOperator = "AND";
  @track logicMode = "ALL";
  @track customLogic = "";
  @track customLogicError = "";
  @track _fieldOptions = [];

  _loadedObject = "";
  _rawFieldMap = {};
  _initialized = false;
  _connected = false;

  @api disabled = false;
  @api builderContext;
  @api automaticOutputVariables;
  @api maxWidth = 280;

  _objectApiName = "";
  _value = "";

  @api
  get objectApiName() {
    return this._objectApiName;
  }
  set objectApiName(v) {
    const next = v == null ? "" : String(v).trim();
    if (next === this._objectApiName) return;
    this._objectApiName = next;
    if (this._connected) this._loadFieldOptions();
  }

  @api
  get value() {
    return this._value;
  }
  set value(v) {
    const next = v == null ? "" : String(v);
    if (next === this._value) return;
    this._value = next;
    if (this._suppressReparse) {
      this._suppressReparse = false;
      return;
    }
    this._initFromValue();
  }

  get logicOptions() {
    return LOGIC_OPTIONS;
  }

  get showLogic() {
    return this.conditions.length > 1;
  }

  get logicSegments() {
    const current = (this.logicMode || "ALL").toUpperCase();
    return LOGIC_MODES.map((opt) => {
      const active = opt.value === current;
      return {
        value: opt.value,
        label: opt.label,
        cssClass: active
          ? "cc-where-logic-btn cc-where-logic-btn_active"
          : "cc-where-logic-btn",
        ariaPressed: String(active)
      };
    });
  }

  get showCustomLogicInput() {
    return this.logicMode === "CUSTOM" && this.conditions.length > 1;
  }

  get customLogicPlaceholder() {
    return "e.g. 1 AND (2 OR 3)";
  }

  get hasCustomLogicError() {
    return Boolean(this.customLogicError);
  }

  get conditionRows() {
    return this.conditions.map((c, i) => {
      const fieldType = this._resolveFieldType(c.field);
      const fieldSelection = c.field
        ? {
            id: c.field,
            title: this._fieldLabel(c.field),
            subtitle: "",
            icon: "type"
          }
        : null;
      return {
        ...c,
        index: i,
        number: i + 1,
        numberTitle: `Condition ${i + 1}`,
        removable: this.conditions.length > 1,
        showLogicDivider: false,
        operatorOptions: operatorsForType(fieldType),
        isBooleanValue: fieldType.toUpperCase() === "BOOLEAN",
        isDateValue:
          fieldType.toUpperCase() === "DATE" ||
          fieldType.toUpperCase() === "DATETIME",
        isListOperator:
          c.operator === "IN" ||
          c.operator === "NOT IN" ||
          c.operator === "INCLUDES" ||
          c.operator === "EXCLUDES",
        booleanOptions: BOOLEAN_OPTIONS,
        fieldSelection,
        valueName: `where_val_${i}`
      };
    });
  }

  _fieldLabel(apiName) {
    if (!apiName) return "";
    const f = this._rawFieldMap[apiName.toLowerCase()];
    return f ? f.label || apiName : apiName;
  }

  @api
  get isParseable() {
    if (!this._value) return true;
    if (parseWhereClause(this._value) !== null) return true;
    return parseCustomWhereClause(this._value) !== null;
  }

  connectedCallback() {
    this._connected = true;
    if (this._objectApiName && !this._loadedObject) {
      this._loadFieldOptions();
    }
    if (!this._initialized) {
      this._initFromValue();
    }
  }

  disconnectedCallback() {
    this._connected = false;
  }

  _initFromValue() {
    this._initialized = true;
    if (!this._value) {
      this.conditions = [
        {
          id: `c${++_condSeq}`,
          field: "",
          operator: "=",
          value: "",
          _fieldType: ""
        }
      ];
      this.logicMode = "ALL";
      this.logicOperator = "AND";
      this.customLogic = "";
      this.customLogicError = "";
      return;
    }

    // Try simple parse first
    const simple = parseWhereClause(this._value);
    if (simple && simple.conditions.length) {
      this.logicOperator = simple.logic;
      this.logicMode = simple.logic === "OR" ? "ANY" : "ALL";
      this.customLogic = "";
      this.customLogicError = "";
      this.conditions = simple.conditions.map((c) => ({
        ...c,
        _fieldType: this._resolveFieldType(c.field)
      }));
      return;
    }

    // Fall through to custom parse
    const custom = parseCustomWhereClause(this._value);
    if (custom && custom.conditions.length) {
      this.logicMode = custom.logicMode;
      this.logicOperator = custom.logicMode === "ANY" ? "OR" : "AND";
      this.customLogic = custom.customLogic || "";
      this.customLogicError =
        custom.logicMode === "CUSTOM"
          ? validateCustomLogic(this.customLogic, custom.conditions.length)
              .error
          : "";
      this.conditions = custom.conditions.map((c) => ({
        ...c,
        _fieldType: this._resolveFieldType(c.field)
      }));
      return;
    }

    // Unparseable — single blank condition
    this.conditions = [
      {
        id: `c${++_condSeq}`,
        field: "",
        operator: "=",
        value: "",
        _fieldType: ""
      }
    ];
    this.logicMode = "ALL";
    this.logicOperator = "AND";
    this.customLogic = "";
    this.customLogicError = "";
  }

  _loadFieldOptions() {
    const obj = this._objectApiName;
    if (!obj) {
      this._fieldOptions = [];
      this._rawFieldMap = {};
      this._loadedObject = "";
      return;
    }
    if (obj === this._loadedObject) return;
    searchLookupDatasetFieldsForObject({ objectApiName: obj, searchKey: "" })
      .then((rows) => {
        if (!this._connected || this._objectApiName !== obj) return;
        this._rawFieldMap = {};
        (rows || []).forEach((r) => {
          const sub = String(r.subtitle || "");
          const sep = sub.lastIndexOf("—");
          const fieldType = sep >= 0 ? sub.substring(sep + 1).trim() : "";
          const apiName = String(r.value || r.id || "");
          if (apiName) {
            this._rawFieldMap[apiName.toLowerCase()] = {
              name: apiName,
              label: r.label || apiName,
              type: fieldType
            };
          }
        });
        this._fieldOptions = (rows || []).map((r) => ({
          label: `${r.label || r.value} (${r.value})`,
          value: r.value || r.id || ""
        }));
        this._loadedObject = obj;
        this.conditions = this.conditions.map((c) => ({
          ...c,
          _fieldType: this._resolveFieldType(c.field)
        }));
      })
      .catch(() => {
        this._fieldOptions = [];
      });
  }

  _resolveFieldType(fieldApiName) {
    if (!fieldApiName) return "";
    const f = this._rawFieldMap[fieldApiName.toLowerCase()];
    return f ? f.type || "" : "";
  }

  _defaultCustomLogic() {
    const nums = this.conditions.map((_, i) => String(i + 1));
    const joiner = ` ${this.logicOperator === "OR" ? "OR" : "AND"} `;
    return nums.join(joiner);
  }

  handleLogicChange(event) {
    // Backwards-compat: external callers that set the raw AND/OR
    this.logicOperator = event.detail.value;
    this.logicMode = this.logicOperator === "OR" ? "ANY" : "ALL";
    this._emitChange();
  }

  handleLogicSegmentClick(event) {
    const next = event.currentTarget.dataset.value;
    if (!next || next === this.logicMode) return;
    this.logicMode = next;
    if (next === "ALL") {
      this.logicOperator = "AND";
    } else if (next === "ANY") {
      this.logicOperator = "OR";
    } else if (next === "CUSTOM") {
      if (!this.customLogic || !this.customLogic.trim()) {
        this.customLogic = this._defaultCustomLogic();
      }
      this.customLogicError = validateCustomLogic(
        this.customLogic,
        this.conditions.length
      ).error;
    }
    this._emitChange();
  }

  handleCustomLogicInput(event) {
    this.customLogic = event.target.value || "";
    this.customLogicError = validateCustomLogic(
      this.customLogic,
      this.conditions.length
    ).error;
    this._emitChange();
  }

  handleFieldSearch(event) {
    const lu = event.currentTarget;
    const obj = this._objectApiName;
    if (!obj) {
      lu.setSearchResults([]);
      return;
    }
    const term =
      event.detail.rawSearchTerm != null
        ? String(event.detail.rawSearchTerm)
        : "";
    searchLookupDatasetFieldsForObject({ objectApiName: obj, searchKey: term })
      .then((rows) => lu.setSearchResults(rows || []))
      .catch(() => lu.setSearchResults([]));
  }

  handleFieldSelectionChange(event) {
    const lu = event.currentTarget;
    const idx = Number(lu.dataset.index);
    const sel = lu.getSelection?.();
    const row = Array.isArray(sel) ? sel[0] : sel;
    const fieldName = row?.id ? String(row.id) : "";
    const fieldType = this._resolveFieldType(fieldName);
    const ops = operatorsForType(fieldType);
    const c = this.conditions[idx];
    const currentOpValid = c && ops.some((o) => o.value === c.operator);
    this.conditions = this.conditions.map((item, i) => {
      return i === idx
        ? {
            ...item,
            field: fieldName,
            _fieldType: fieldType,
            operator: currentOpValid ? item.operator : ops[0].value,
            value: ""
          }
        : item;
    });
    this._emitChange();
  }

  handleOperatorChange(event) {
    const idx = Number(event.currentTarget.dataset.index);
    this.conditions = this.conditions.map((item, i) => {
      return i === idx ? { ...item, operator: event.detail.value } : item;
    });
    this._emitChange();
  }

  handleValueChange(event) {
    const idx = Number(event.currentTarget.dataset.index);
    const val = event.detail?.value ?? event.target?.value ?? "";
    this.conditions = this.conditions.map((item, i) => {
      return i === idx ? { ...item, value: val } : item;
    });
    this._emitChange();
  }

  handleResourceValueChange(event) {
    event.stopPropagation();
    const id = event.detail?.id || event.detail?.name || "";
    const match = id.match(/where_val_(\d+)/);
    if (!match) return;
    const idx = Number(match[1]);
    const val = event.detail?.newValue ?? "";
    this.conditions = this.conditions.map((item, i) => {
      return i === idx ? { ...item, value: val } : item;
    });
    this._emitChange();
  }

  handleAddCondition() {
    const nextIndex = this.conditions.length + 1;
    this.conditions = [
      ...this.conditions,
      {
        id: `c${++_condSeq}`,
        field: "",
        operator: "=",
        value: "",
        _fieldType: ""
      }
    ];
    // In CUSTOM mode, append the new condition to the existing expression
    if (this.logicMode === "CUSTOM") {
      if (!this.customLogic || !this.customLogic.trim()) {
        this.customLogic = this._defaultCustomLogic();
      } else {
        this.customLogic = `${this.customLogic} AND ${nextIndex}`;
      }
      this.customLogicError = validateCustomLogic(
        this.customLogic,
        this.conditions.length
      ).error;
    }
    this._emitChange();
  }

  handleRemoveCondition(event) {
    const idx = Number(event.currentTarget.dataset.index);
    const removed1Based = idx + 1;
    this.conditions = this.conditions.filter((_, i) => i !== idx);
    if (!this.conditions.length) {
      this.conditions = [
        {
          id: `c${++_condSeq}`,
          field: "",
          operator: "=",
          value: "",
          _fieldType: ""
        }
      ];
    }
    if (this.logicMode === "CUSTOM") {
      this.customLogic = renumberCustomLogic(this.customLogic, removed1Based);
      this.customLogicError = validateCustomLogic(
        this.customLogic,
        this.conditions.length
      ).error;
      // If only one condition left, drop out of CUSTOM mode
      if (this.conditions.length < 2) {
        this.logicMode = "ALL";
        this.logicOperator = "AND";
        this.customLogic = "";
        this.customLogicError = "";
      }
    }
    this._emitChange();
  }

  _emitChange() {
    const withTypes = this.conditions.map((c) => ({
      ...c,
      _fieldType: this._resolveFieldType(c.field) || c._fieldType
    }));

    let soql;
    if (this.logicMode === "CUSTOM" && this.conditions.length > 1) {
      const validation = validateCustomLogic(
        this.customLogic,
        this.conditions.length
      );
      soql = validation.valid
        ? serializeConditionsWithCustomLogic(withTypes, this.customLogic)
        : "";
    } else {
      soql = serializeConditions(withTypes, this.logicOperator);
    }

    if (soql !== this._value) {
      this._suppressReparse = true;
      this._value = soql;
    }
    this.dispatchEvent(
      new CustomEvent("change", { detail: { value: soql || null } })
    );
  }

  /** Render-time SOQL preview. Empty when no complete conditions yet. */
  get previewSoql() {
    const withTypes = this.conditions.map((c) => ({
      ...c,
      _fieldType: this._resolveFieldType(c.field) || c._fieldType
    }));
    if (this.logicMode === "CUSTOM" && this.conditions.length > 1) {
      const v = validateCustomLogic(this.customLogic, this.conditions.length);
      return v.valid
        ? serializeConditionsWithCustomLogic(withTypes, this.customLogic)
        : "";
    }
    return serializeConditions(withTypes, this.logicOperator);
  }

  get hasPreviewSoql() {
    return Boolean(this.previewSoql);
  }
}
