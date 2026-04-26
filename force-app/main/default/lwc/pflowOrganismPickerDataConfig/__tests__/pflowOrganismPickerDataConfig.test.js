import { createElement } from "lwc";
import PflowOrganismPickerDataConfig from "c/pflowOrganismPickerDataConfig";
import searchLookupDatasetFieldsForObject from "@salesforce/apex/PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject";
import queryItems from "@salesforce/apex/PflowPickerController.queryItems";

jest.mock(
  "@salesforce/apex/PFlowCpeChoiceEngineController.searchSObjectTypes",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject",
  () => ({ default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/PflowPickerController.queryItems",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

const BASE_CONFIG = {
  dataSource: "custom",
  picklist: {},
  collection: { fieldMap: {} },
  stringCollection: { sampleValues: "Alpha\nBeta" },
  sobject: {
    sObjectApiName: "Account",
    labelField: "Name",
    valueField: "Id",
    orderDirection: "ASC",
    limit: 25
  },
  custom: {
    items: [
      { label: "One", value: "one", icon: "circle" },
      { label: "Two", value: "two", icon: "" }
    ]
  },
  overrides: {},
  display: {}
};

const flushPromises = () => Promise.resolve();

function mount(props = {}) {
  const element = createElement("c-pflow-organism-picker-data-config", {
    is: PflowOrganismPickerDataConfig
  });
  Object.assign(element, { config: BASE_CONFIG, ...props });
  document.body.appendChild(element);
  return element;
}

function collect(element, eventName = "configpatch") {
  const events = [];
  element.addEventListener(eventName, (event) => events.push(event.detail));
  return events;
}

function cardSelect(node, value) {
  node.dispatchEvent(
    new CustomEvent("cardselect", {
      detail: { value },
      bubbles: true,
      composed: true
    })
  );
}

function valueChanged(node, newValue) {
  node.dispatchEvent(
    new CustomEvent("valuechanged", {
      detail: { newValue },
      bubbles: true,
      composed: true
    })
  );
}

function iconSelected(node, iconName) {
  node.dispatchEvent(
    new CustomEvent("iconselect", {
      detail: { iconName },
      bubbles: true,
      composed: true
    })
  );
}

function change(node, value) {
  node.value = value;
  node.dispatchEvent(
    new CustomEvent("change", {
      detail: { value },
      bubbles: true,
      composed: true
    })
  );
}

function click(node) {
  node.dispatchEvent(
    new MouseEvent("click", { bubbles: true, composed: true })
  );
}

function toggle(node, checked) {
  node.checked = checked;
  node.dispatchEvent(
    new CustomEvent("toggle", {
      detail: { checked },
      bubbles: true,
      composed: true
    })
  );
}

function byLabel(root, selector, label) {
  return [...root.querySelectorAll(selector)].find(
    (node) => node.label === label || node.getAttribute("label") === label
  );
}

describe("c-pflow-organism-picker-data-config events", () => {
  beforeEach(() => {
    searchLookupDatasetFieldsForObject.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("emits source and reference changes without mutating input config", () => {
    const element = mount();
    const patches = collect(element);

    cardSelect(
      element.shadowRoot.querySelector('[aria-label="Data source"]'),
      "collection"
    );

    expect(patches).toHaveLength(1);
    expect(patches[0].path).toEqual([]);
    expect(patches[0].value.dataSource).toBe("collection");
    expect(element.config.dataSource).toBe("custom");

    const collectionElement = mount({
      config: { ...BASE_CONFIG, dataSource: "collection" }
    });
    const collectionRefs = collect(collectionElement, "refchange");
    valueChanged(
      collectionElement.shadowRoot.querySelector(
        "c-pflow-organism-resource-picker"
      ),
      "{!records}"
    );

    const stringElement = mount({
      config: { ...BASE_CONFIG, dataSource: "stringCollection" }
    });
    const stringRefs = collect(stringElement, "refchange");
    valueChanged(
      stringElement.shadowRoot.querySelector(
        "c-pflow-organism-resource-picker"
      ),
      "{!strings}"
    );

    expect(collectionRefs).toEqual([
      { name: "sourceRecordsRef", value: "{!records}" }
    ]);
    expect(stringRefs).toEqual([
      { name: "sourceStringsRef", value: "{!strings}" }
    ]);
  });

  it("emits custom item add, edit, duplicate, move, and remove patches", () => {
    const element = mount();
    const patches = collect(element);

    click(element.shadowRoot.querySelector("lightning-button"));
    expect(patches.at(-1).value.custom.items).toHaveLength(3);

    valueChanged(
      element.shadowRoot.querySelector(
        'c-pflow-organism-resource-picker[data-index="0"][data-field="label"]'
      ),
      "Uno"
    );
    expect(patches.at(-1).value.custom.items[0].label).toBe("Uno");

    iconSelected(
      element.shadowRoot.querySelector(
        'c-pflow-molecule-icon-picker[data-index="1"]'
      ),
      "list-checks"
    );
    expect(patches.at(-1).value.custom.items[1].icon).toBe("list-checks");

    toggle(
      element.shadowRoot.querySelector('c-pflow-atom-toggle[data-index="1"]'),
      true
    );
    expect(patches.at(-1).value.custom.items[1].hidden).toBe(true);

    const firstRowButtons = [
      ...element.shadowRoot.querySelectorAll(
        'lightning-button-icon[data-index="0"]'
      )
    ];

    click(firstRowButtons[2]);
    expect(patches.at(-1).value.custom.items).toEqual([
      BASE_CONFIG.custom.items[0],
      BASE_CONFIG.custom.items[0],
      BASE_CONFIG.custom.items[1]
    ]);

    click(firstRowButtons[1]);
    expect(patches.at(-1).value.custom.items[0].value).toBe("two");

    click(firstRowButtons[3]);
    expect(patches.at(-1).value.custom.items).toEqual([
      BASE_CONFIG.custom.items[1]
    ]);
  });

  it("emits override and bulk override patches", async () => {
    const element = mount({
      config: { ...BASE_CONFIG, dataSource: "stringCollection" }
    });
    const patches = collect(element);

    click(byLabel(element.shadowRoot, "lightning-button", "Select filtered"));
    await flushPromises();

    expect(
      element.shadowRoot.querySelector(".pflow-studio__bulk")
    ).not.toBeNull();

    valueChanged(
      element.shadowRoot.querySelectorAll(
        ".pflow-studio__bulk c-pflow-organism-resource-picker"
      )[1],
      "Featured"
    );
    iconSelected(
      element.shadowRoot.querySelector(
        ".pflow-studio__bulk c-pflow-molecule-icon-picker"
      ),
      "star"
    );
    click(byLabel(element.shadowRoot, "lightning-button", "Apply to selected"));

    expect(patches.at(-1).value.overrides).toEqual({
      Alpha: { icon: "star", badge: "Featured" },
      Beta: { icon: "star", badge: "Featured" }
    });

    click(
      element.shadowRoot.querySelector(
        '.pflow-studio__overrides-trigger[data-value="Alpha"]'
      )
    );
    await flushPromises();
    valueChanged(
      element.shadowRoot.querySelector(
        'c-pflow-organism-resource-picker[data-value="Alpha"][data-field="label"]'
      ),
      "Alpha label"
    );
    expect(patches.at(-1).value.overrides.Alpha.label).toBe("Alpha label");

    toggle(
      element.shadowRoot.querySelector(
        'c-pflow-atom-toggle[data-value="Alpha"]'
      ),
      true
    );
    expect(patches.at(-1).value.overrides.Alpha.hidden).toBe(true);

    toggle(
      element.shadowRoot.querySelector(
        'c-pflow-atom-toggle[data-value="Alpha"]'
      ),
      false
    );
    expect(patches.at(-1).value.overrides.Alpha).toBeUndefined();
  });

  it("loads and reports sObject sample rows", async () => {
    queryItems.mockResolvedValue([{ value: "001xx", label: "Acme" }]);
    const element = mount({
      config: { ...BASE_CONFIG, dataSource: "sobject" }
    });

    click(byLabel(element.shadowRoot, "lightning-button", "Load sample rows"));
    await flushPromises();
    await flushPromises();

    expect(queryItems).toHaveBeenCalledWith({
      configJson: expect.stringContaining("Account")
    });
    expect(
      byLabel(element.shadowRoot, "lightning-button", "Reload sample rows")
    ).not.toBeNull();
  });

  it("captures sObject sample load failures", async () => {
    queryItems.mockRejectedValue({ body: { message: "No access" } });
    const element = mount({
      config: { ...BASE_CONFIG, dataSource: "sobject" }
    });

    click(byLabel(element.shadowRoot, "lightning-button", "Load sample rows"));
    await flushPromises();
    await flushPromises();

    expect(element.shadowRoot.textContent).toContain("No access");
  });

  it("emits display sorting patches", () => {
    const element = mount({
      config: { ...BASE_CONFIG, display: { sortBy: "label" } }
    });
    const patches = collect(element);

    change(
      byLabel(element.shadowRoot, "lightning-combobox", "Sort by"),
      "label"
    );
    change(
      byLabel(element.shadowRoot, "lightning-combobox", "Direction"),
      "desc"
    );
    change(
      byLabel(element.shadowRoot, "lightning-input", "Maximum options"),
      "3"
    );

    expect(patches.at(-3).value.display.sortBy).toBe("label");
    expect(patches.at(-2).value.display.sortDirection).toBe("desc");
    expect(patches.at(-1).value.display.limit).toBe(3);
  });
});
