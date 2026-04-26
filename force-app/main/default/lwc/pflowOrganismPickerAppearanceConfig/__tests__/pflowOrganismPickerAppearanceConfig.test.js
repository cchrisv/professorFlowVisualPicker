import { createElement } from "lwc";
import PflowOrganismPickerAppearanceConfig from "c/pflowOrganismPickerAppearanceConfig";

const BASE_CONFIG = {
  dataSource: "custom",
  selectionMode: "single",
  layout: "grid",
  gridConfig: {
    size: "medium",
    minWidth: "14rem",
    columns: null,
    aspectRatio: "1:1",
    selectionIndicator: "checkmark",
    elevation: "outlined",
    pattern: "none",
    surfaceStyle: "solid",
    iconStyle: "filled",
    iconShading: "flat",
    iconSize: "auto",
    badge: {},
    margin: {
      linked: true,
      top: "none",
      right: "none",
      bottom: "none",
      left: "none"
    },
    padding: { linked: true, top: "", right: "", bottom: "", left: "" }
  }
};

function mount(config = BASE_CONFIG) {
  const element = createElement("c-pflow-organism-picker-appearance-config", {
    is: PflowOrganismPickerAppearanceConfig
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

function group(root, label) {
  return root.querySelector(`[aria-label="${label}"]`);
}

function byLabel(root, selector, label) {
  return [...root.querySelectorAll(selector)].find(
    (node) => node.label === label || node.getAttribute("label") === label
  );
}

describe("c-pflow-organism-picker-appearance-config events", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("emits layout patches and prevents single-select layouts for multi-select", () => {
    const element = mount({ ...BASE_CONFIG, selectionMode: "multi" });
    const patches = collect(element);

    cardSelect(group(element.shadowRoot, "Layout"), "dropdown");
    expect(patches[0].value.layout).toBe("grid");

    const singleSelect = mount(BASE_CONFIG);
    const singlePatches = collect(singleSelect);
    cardSelect(group(singleSelect.shadowRoot, "Layout"), "list");
    expect(singlePatches[0].value.layout).toBe("list");
  });

  it("emits grid sizing, spacing, and column patches from rendered controls", () => {
    const element = mount();
    const patches = collect(element);

    cardSelect(group(element.shadowRoot, "Tile size"), "large");
    cardSelect(group(element.shadowRoot, "Aspect ratio"), "16:9");
    click(
      element.shadowRoot.querySelector(
        ".pflow-studio__col-chip[data-value='3']"
      )
    );
    cardSelect(group(element.shadowRoot, "Horizontal gap"), "8");
    inputChange(
      byLabel(element.shadowRoot, "lightning-input", "Minimum column width"),
      "18"
    );

    expect(patches.at(-5).value.gridConfig.size).toBe("large");
    expect(patches.at(-4).value.gridConfig.aspectRatio).toBe("16:9");
    expect(patches.at(-3).value.gridConfig.columns).toBe(3);
    expect(patches.at(-2).value.gridConfig.gapH).toBe("8");
    expect(patches.at(-1).value.gridConfig.minWidth).toBe("18rem");
  });

  it("emits surface, icon, and badge patches from rendered controls", () => {
    const element = mount({
      ...BASE_CONFIG,
      gridConfig: {
        ...BASE_CONFIG.gridConfig,
        badge: { variant: "custom" }
      }
    });
    const patches = collect(element);

    cardSelect(group(element.shadowRoot, "Surface style"), "gradient-radial");
    cardSelect(group(element.shadowRoot, "Icon size"), "small");
    toggle(
      byLabel(element.shadowRoot, "c-pflow-atom-toggle", "Show icons"),
      false
    );
    click(
      group(element.shadowRoot, "Badge position").querySelector(
        "[data-value='top-right']"
      )
    );
    inputChange(
      element.shadowRoot.querySelector('input[aria-label="Hex color value"]'),
      "#123456"
    );

    expect(patches.at(-5).value.gridConfig.surfaceStyle).toBe(
      "gradient-radial"
    );
    expect(patches.at(-4).value.gridConfig.iconSize).toBe("small");
    expect(patches.at(-3).value.gridConfig.showIcons).toBe(false);
    expect(patches.at(-2).value.gridConfig.badge.position).toBe("top-right");
    expect(patches.at(-1).value.gridConfig.badge.variantHex).toBe("#123456");
  });

  it("uses toggle event detail so icon and badge off switches hide dependent CPE controls", async () => {
    const element = mount({
      ...BASE_CONFIG,
      gridConfig: {
        ...BASE_CONFIG.gridConfig,
        showIcons: true,
        showBadges: true
      }
    });
    const patches = collect(element);

    toggleWithStaleTarget(
      byLabel(element.shadowRoot, "c-pflow-atom-toggle", "Show icons"),
      true,
      false
    );
    await Promise.resolve();
    expect(patches.at(-1).value.gridConfig.showIcons).toBe(false);

    element.config = patches.at(-1).value;
    await Promise.resolve();
    expect(group(element.shadowRoot, "Icon size")).toBeNull();

    toggleWithStaleTarget(
      byLabel(element.shadowRoot, "c-pflow-atom-toggle", "Show badges"),
      true,
      false
    );
    await Promise.resolve();
    expect(patches.at(-1).value.gridConfig.showBadges).toBe(false);

    element.config = patches.at(-1).value;
    await Promise.resolve();
    expect(group(element.shadowRoot, "Badge position")).toBeNull();
    expect(group(element.shadowRoot, "Badge color")).toBeNull();
    expect(group(element.shadowRoot, "Badge shape")).toBeNull();
  });

  it("emits linked and per-side margin and padding patches", () => {
    const unlinked = {
      ...BASE_CONFIG,
      gridConfig: {
        ...BASE_CONFIG.gridConfig,
        margin: { ...BASE_CONFIG.gridConfig.margin, linked: false }
      }
    };
    const element = mount(unlinked);
    const patches = collect(element);

    toggle(
      byLabel(element.shadowRoot, "c-pflow-atom-toggle", "Link all sides"),
      true
    );
    cardSelect(
      element.shadowRoot.querySelector('[aria-label^="Padding"]'),
      "4"
    );
    cardSelect(
      element.shadowRoot.querySelector(
        '.pflow-studio__pickgroup[data-side="left"]'
      ),
      "7"
    );

    expect(patches.at(-3).value.gridConfig.margin.linked).toBe(true);
    expect(patches.at(-2).value.gridConfig.padding).toMatchObject({
      linked: true,
      top: "4",
      right: "4",
      bottom: "4",
      left: "4"
    });
    expect(patches.at(-1).value.gridConfig.margin).toMatchObject({
      left: "7",
      linked: false
    });
  });
});
