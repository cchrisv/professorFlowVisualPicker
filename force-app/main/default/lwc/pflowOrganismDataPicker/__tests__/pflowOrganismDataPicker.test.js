import { createElement } from "lwc";
import PflowOrganismDataPicker from "c/pflowOrganismDataPicker";

function mount(overrides = {}) {
  const el = createElement("c-pflow-organism-data-picker", {
    is: PflowOrganismDataPicker
  });
  Object.assign(el, {
    sourceType: "custom",
    layout: "grid",
    selectionMode: "single",
    required: false,
    ...overrides
  });
  document.body.appendChild(el);
  return el;
}

describe("c-pflow-organism-data-picker", () => {
  afterEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild);
  });

  it("renders custom items in grid layout", async () => {
    const el = mount({
      customConfig: {
        items: [
          { label: "One", value: "1" },
          { label: "Two", value: "2" }
        ]
      }
    });
    await Promise.resolve();
    await Promise.resolve();
    const group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group).not.toBeNull();
    expect(group.items).toHaveLength(2);
  });

  it("hides custom items and overridden source items marked hidden", async () => {
    const el = mount({
      customConfig: {
        items: [
          { label: "One", value: "1" },
          { label: "Two", value: "2", hidden: true },
          { label: "Three", value: "3" }
        ]
      },
      overrides: {
        3: { hidden: true }
      }
    });
    await Promise.resolve();
    await Promise.resolve();

    const group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group.items.map((item) => item.value)).toEqual(["1"]);
  });

  it("shows empty state when no items and not previewing", async () => {
    const el = mount({ customConfig: { items: [] } });
    await Promise.resolve();
    await Promise.resolve();
    const empty = el.shadowRoot.querySelector(".pflow-state_empty");
    expect(empty).not.toBeNull();
  });

  it("validate() returns isValid=false when required but nothing selected", async () => {
    const el = mount({
      required: true,
      customConfig: { items: [{ label: "A", value: "a" }] }
    });
    await Promise.resolve();
    const result = el.validate();
    expect(result.isValid).toBe(false);
  });

  it("validate() returns isValid=true when required and single value is set", async () => {
    const el = mount({
      required: true,
      customConfig: { items: [{ label: "A", value: "a" }] }
    });
    el.value = "a";
    await Promise.resolve();
    const result = el.validate();
    expect(result.isValid).toBe(true);
  });

  it("validate() enforces minSelections for multi-select", async () => {
    const el = mount({
      selectionMode: "multi",
      minSelections: 2,
      customConfig: {
        items: [
          { label: "A", value: "a" },
          { label: "B", value: "b" }
        ]
      }
    });
    el.values = ["a"];
    await Promise.resolve();
    const result = el.validate();
    expect(result.isValid).toBe(false);
  });

  it("validate() always passes in preview mode", async () => {
    const el = mount({ required: true, previewMode: true });
    await Promise.resolve();
    expect(el.validate().isValid).toBe(true);
  });

  it("preselects sample values in preview mode so selected-state styling is visible", async () => {
    const el = mount({
      previewMode: true,
      customConfig: {
        items: [
          { label: "None-like", value: "" },
          { label: "A", value: "a" },
          { label: "B", value: "b" }
        ]
      }
    });
    await Promise.resolve();
    await Promise.resolve();

    const group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group.selectedValues).toEqual(["a"]);
  });

  it("preselects multiple sample values in multi-select preview mode", async () => {
    const el = mount({
      previewMode: true,
      selectionMode: "multi",
      maxSelections: 1,
      customConfig: {
        items: [
          { label: "A", value: "a" },
          { label: "B", value: "b" }
        ]
      }
    });
    await Promise.resolve();
    await Promise.resolve();

    const group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group.selectedValues).toEqual(["a"]);
  });

  it("rebuilds preview items when none option settings change after data loads", async () => {
    const el = mount({
      previewMode: true,
      includeNoneOption: true,
      noneOptionLabel: "No choice",
      noneOptionPosition: "start",
      customConfig: {
        items: [
          { label: "A", value: "a" },
          { label: "B", value: "b" }
        ]
      }
    });
    await Promise.resolve();
    await Promise.resolve();

    let group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group.items.map((item) => item.label)).toEqual([
      "No choice",
      "A",
      "B"
    ]);

    el.noneOptionPosition = "end";
    await Promise.resolve();
    await Promise.resolve();

    group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group.items.map((item) => item.label)).toEqual([
      "A",
      "B",
      "No choice"
    ]);

    el.noneOptionLabel = "Skip";
    await Promise.resolve();
    await Promise.resolve();

    group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group.items.map((item) => item.label)).toEqual(["A", "B", "Skip"]);
  });

  it("updates the preview search bar when enableSearch changes after render", async () => {
    const el = mount({
      previewMode: true,
      enableSearch: false,
      customConfig: {
        items: [
          { label: "A", value: "a" },
          { label: "B", value: "b" }
        ]
      }
    });
    await Promise.resolve();
    await Promise.resolve();

    let group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group.enableSearch).toBe(false);
    expect(group.shadowRoot.querySelector(".pflow-search-bar")).toBeNull();

    el.enableSearch = true;
    await Promise.resolve();
    await Promise.resolve();

    group = el.shadowRoot.querySelector("c-pflow-molecule-picker-group");
    expect(group.enableSearch).toBe(true);
    expect(group.shadowRoot.querySelector(".pflow-search-bar")).not.toBeNull();
  });
});
