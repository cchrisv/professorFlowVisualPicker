import { createElement } from "lwc";
import PflowAtomIcon from "c/pflowAtomIcon";

function mount(overrides = {}) {
  const el = createElement("c-pflow-atom-icon", {
    is: PflowAtomIcon
  });
  Object.assign(el, overrides);
  document.body.appendChild(el);
  return el;
}

describe("c-pflow-atom-icon", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders a local svg for known icons", async () => {
    const el = mount({
      name: "settings",
      alternativeText: "Settings"
    });

    await Promise.resolve();

    const svg = el.shadowRoot.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg.querySelector("circle")).not.toBeNull();
  });

  it("renders a visible fallback for unknown icons", async () => {
    const el = mount({ name: "not-real" });

    await Promise.resolve();

    const svg = el.shadowRoot.querySelector("svg");
    expect(svg.childNodes.length).toBeGreaterThan(0);
  });

  it("normalizes persisted legacy icon values into Lucide SVGs", async () => {
    const el = mount({ name: "standard:choice" });

    await Promise.resolve();

    const svg = el.shadowRoot.querySelector("svg");
    expect(svg.querySelector("path")).not.toBeNull();
    expect(svg.querySelector("circle")).toBeNull();
  });

  it("keeps icon color controlled by variant classes", async () => {
    const el = mount({ name: "check", variant: "success" });

    await Promise.resolve();

    const wrapper = el.shadowRoot.querySelector(".pflow-icon");
    expect(wrapper.className).toContain("pflow-icon_variant-success");
  });

  it.each([
    ["xx-small", "pflow-icon_size-xs"],
    ["x-small", "pflow-icon_size-sm"],
    ["small", "pflow-icon_size-md"],
    ["medium", "pflow-icon_size-lg"],
    ["large", "pflow-icon_size-xl"],
    ["sm", "pflow-icon_size-sm"],
    ["md", "pflow-icon_size-md"],
    ["lg", "pflow-icon_size-lg"]
  ])("maps %s to a bounded icon size", async (size, expectedClass) => {
    const el = mount({ name: "settings", size });

    await Promise.resolve();

    const wrapper = el.shadowRoot.querySelector(".pflow-icon");
    expect(wrapper.className).toContain(expectedClass);
  });

  it("applies centralized icon box contexts", async () => {
    const el = mount({ name: "x", size: "x-small", box: "button" });

    await Promise.resolve();

    const wrapper = el.shadowRoot.querySelector(".pflow-icon");
    expect(wrapper.className).toContain("pflow-icon_box-button");
  });
});
