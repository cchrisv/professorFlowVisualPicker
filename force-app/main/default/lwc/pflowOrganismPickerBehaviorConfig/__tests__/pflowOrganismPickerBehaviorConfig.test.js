import { createElement } from "lwc";
import PflowOrganismPickerBehaviorConfig from "c/pflowOrganismPickerBehaviorConfig";

const BASE_CONFIG = {
  dataSource: "custom",
  selectionMode: "single",
  layout: "dropdown",
  required: false,
  autoAdvance: true,
  includeNoneOption: true,
  noneOptionLabel: "--None--",
  noneOptionPosition: "start",
  enableSearch: false,
  showSelectAll: false,
  minSelections: 0,
  maxSelections: null,
  customErrorMessage: ""
};

function mount(config = BASE_CONFIG) {
  const element = createElement("c-pflow-organism-picker-behavior-config", {
    is: PflowOrganismPickerBehaviorConfig
  });
  element.config = config;
  document.body.appendChild(element);
  return element;
}

function collect(element) {
  const events = [];
  element.addEventListener("configpatch", (event) => events.push(event.detail));
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

function toggleWithStaleTarget(node, currentChecked, nextChecked) {
  node.checked = currentChecked;
  node.dispatchEvent(
    new CustomEvent("toggle", {
      detail: { checked: nextChecked },
      bubbles: true,
      composed: true
    })
  );
}

function inputChange(node, value) {
  node.value = value;
  node.dispatchEvent(
    new CustomEvent("change", { bubbles: true, composed: true })
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

function byLabel(root, selector, label) {
  return [...root.querySelectorAll(selector)].find(
    (node) => node.label === label || node.getAttribute("label") === label
  );
}

describe("c-pflow-organism-picker-behavior-config events", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("emits multi-select normalization patch from the selection group", () => {
    const element = mount();
    const patches = collect(element);

    cardSelect(
      element.shadowRoot.querySelector('[aria-label="Selection mode"]'),
      "multi"
    );

    expect(patches[0].path).toEqual([]);
    expect(patches[0].value).toMatchObject({
      selectionMode: "multi",
      autoAdvance: false,
      includeNoneOption: false,
      layout: "grid"
    });
  });

  it("emits selection rule, search, and error message patches", () => {
    const element = mount({
      ...BASE_CONFIG,
      required: true,
      selectionMode: "multi"
    });
    const patches = collect(element);

    toggle(
      element.shadowRoot.querySelector(
        'c-pflow-atom-toggle[data-key="required"]'
      ),
      true
    );
    toggle(
      element.shadowRoot.querySelector(
        'c-pflow-atom-toggle[data-key="enableSearch"]'
      ),
      true
    );
    const inputs = [...element.shadowRoot.querySelectorAll("lightning-input")];
    inputChange(inputs[0], "2");
    inputChange(inputs[1], "");
    valueChanged(
      element.shadowRoot.querySelector("c-pflow-organism-resource-picker"),
      "Pick one"
    );

    expect(patches.at(-5).value.required).toBe(true);
    expect(patches.at(-4).value.enableSearch).toBe(true);
    expect(patches.at(-3).value.minSelections).toBe(2);
    expect(patches.at(-2).value.maxSelections).toBeNull();
    expect(patches.at(-1).value.customErrorMessage).toBe("Pick one");
  });

  it("uses toggle event detail when the component target still has the old checked value", () => {
    const element = mount({
      ...BASE_CONFIG,
      required: true,
      enableSearch: true
    });
    const patches = collect(element);

    toggleWithStaleTarget(
      element.shadowRoot.querySelector(
        'c-pflow-atom-toggle[data-key="required"]'
      ),
      true,
      false
    );
    toggleWithStaleTarget(
      element.shadowRoot.querySelector(
        'c-pflow-atom-toggle[data-key="enableSearch"]'
      ),
      true,
      false
    );

    expect(patches.at(-2).value.required).toBe(false);
    expect(patches.at(-1).value.enableSearch).toBe(false);
  });

  it("emits none option patches only for valid position changes", () => {
    const element = mount();
    const patches = collect(element);

    inputChange(
      byLabel(element.shadowRoot, "lightning-input", "None option label"),
      "No choice"
    );
    const positionGroup = element.shadowRoot.querySelector(
      '.pflow-studio__pickgroup[aria-label="None option position"]'
    );
    cardSelect(positionGroup, "end");
    cardSelect(positionGroup, "middle");

    expect(patches).toHaveLength(2);
    expect(patches[0].value.noneOptionLabel).toBe("No choice");
    expect(patches[1].value.noneOptionPosition).toBe("end");
  });
});
