import { createElement } from "lwc";
import PflowAtomVisualPick from "c/pflowAtomVisualPick";

const SAMPLE_ITEM = {
  id: "i-1",
  label: "First option",
  sublabel: "Helpful subtitle",
  icon: "building-2",
  badge: "New",
  helpText: "Hover for info",
  value: "first",
  disabled: false
};

function mount(overrides = {}) {
  const el = createElement("c-pflow-atom-visual-pick", {
    is: PflowAtomVisualPick
  });
  el.item = { ...SAMPLE_ITEM, ...(overrides.item || {}) };
  if (overrides.variant !== undefined) el.variant = overrides.variant;
  if (overrides.selected !== undefined) el.selected = overrides.selected;
  if (overrides.selectionMode !== undefined)
    el.selectionMode = overrides.selectionMode;
  if (overrides.disabled !== undefined) el.disabled = overrides.disabled;
  if (overrides.groupName !== undefined) el.groupName = overrides.groupName;
  if (overrides.size !== undefined) el.size = overrides.size;
  if (overrides.aspectRatio !== undefined)
    el.aspectRatio = overrides.aspectRatio;
  if (overrides.badgePosition !== undefined)
    el.badgePosition = overrides.badgePosition;
  if (overrides.badgeVariant !== undefined)
    el.badgeVariant = overrides.badgeVariant;
  if (overrides.badgeShape !== undefined) el.badgeShape = overrides.badgeShape;
  if (overrides.selectionIndicator !== undefined)
    el.selectionIndicator = overrides.selectionIndicator;
  if (overrides.iconDecor !== undefined) el.iconDecor = overrides.iconDecor;
  if (overrides.iconTone !== undefined) el.iconTone = overrides.iconTone;
  if (overrides.showIcons !== undefined) el.showIcons = overrides.showIcons;
  if (overrides.showBadges !== undefined) el.showBadges = overrides.showBadges;
  document.body.appendChild(el);
  return el;
}

describe("c-pflow-atom-visual-pick", () => {
  afterEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild);
  });

  it("renders title, sub, and badge in grid variant", () => {
    const el = mount();
    const title = el.shadowRoot.querySelector(".pflow-vpick__title");
    const sub = el.shadowRoot.querySelector(".pflow-vpick__sub");
    const badge = el.shadowRoot.querySelector(".pflow-vpick__badge");
    expect(title.textContent).toBe("First option");
    expect(sub.textContent).toBe("Helpful subtitle");
    expect(badge.textContent).toBe("New");
  });

  it("applies pflow-vpick_list modifier in list variant", () => {
    const el = mount({ variant: "list" });
    const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
    expect(wrapper.classList.contains("pflow-vpick_list")).toBe(true);
  });

  it("applies pflow-vpick_grid modifier in grid variant", () => {
    const el = mount({ variant: "grid" });
    const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
    expect(wrapper.classList.contains("pflow-vpick_grid")).toBe(true);
  });

  it("applies pflow-vpick_selected and checks the input when selected", () => {
    const el = mount({ selected: true });
    const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
    const input = el.shadowRoot.querySelector("input");
    expect(wrapper.classList.contains("pflow-vpick_selected")).toBe(true);
    expect(input.checked).toBe(true);
  });

  it("applies size modifier class", () => {
    const el = mount({ size: "large" });
    const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
    expect(wrapper.classList.contains("pflow-vpick_size-large")).toBe(true);
  });

  it("applies aspect modifier class for non-auto aspect", () => {
    const el = mount({ aspectRatio: "4:3" });
    const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
    expect(wrapper.classList.contains("pflow-vpick_aspect-4-3")).toBe(true);
  });

  it("defaults aspect to 1:1 when none specified", () => {
    const el = mount();
    const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
    expect(wrapper.classList.contains("pflow-vpick_aspect-1-1")).toBe(true);
  });

  it('normalizes legacy aspect="auto" to 1:1', () => {
    const el = mount({ aspectRatio: "auto" });
    const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
    expect(wrapper.classList.contains("pflow-vpick_aspect-1-1")).toBe(true);
  });

  it("renders a radio input with groupName in single-select mode", () => {
    const el = mount({ selectionMode: "single", groupName: "my-group" });
    const input = el.shadowRoot.querySelector("input");
    expect(input.type).toBe("radio");
    expect(input.name).toBe("my-group");
  });

  it("renders a checkbox input with empty name in multi-select mode", () => {
    const el = mount({ selectionMode: "multi" });
    const input = el.shadowRoot.querySelector("input");
    expect(input.type).toBe("checkbox");
    expect(input.name).toBe("");
  });

  it("dispatches cardselect on change with value and id", () => {
    const el = mount();
    const handler = jest.fn();
    el.addEventListener("cardselect", handler);
    const input = el.shadowRoot.querySelector("input");
    input.dispatchEvent(new CustomEvent("change"));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({
      value: "first",
      id: "i-1"
    });
  });

  it("disables the input and suppresses events when disabled", () => {
    const el = mount({ disabled: true });
    const input = el.shadowRoot.querySelector("input");
    expect(input.disabled).toBe(true);
    const handler = jest.fn();
    el.addEventListener("cardselect", handler);
    input.dispatchEvent(new CustomEvent("change"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("respects item.disabled", () => {
    const el = mount({ item: { disabled: true } });
    const input = el.shadowRoot.querySelector("input");
    expect(input.disabled).toBe(true);
  });

  it("renders helpText with aria-describedby target", () => {
    const el = mount();
    const input = el.shadowRoot.querySelector("input");
    const helpId = input.getAttribute("aria-describedby");
    expect(helpId).toBeTruthy();
    const helpEl = el.shadowRoot.querySelector(".pflow-vpick__help");
    expect(helpEl).not.toBeNull();
    expect(helpEl.getAttribute("id")).toBe(helpId);
    expect(helpEl.textContent).toBe("Hover for info");
  });

  it("defaults badge to inline + neutral + pill", () => {
    const el = mount();
    const badge = el.shadowRoot.querySelector(".pflow-vpick__badge");
    expect(
      badge.classList.contains("pflow-vpick__badge_pos-bottom-inline")
    ).toBe(true);
    expect(badge.classList.contains("pflow-vpick__badge_variant-neutral")).toBe(
      true
    );
    expect(badge.classList.contains("pflow-vpick__badge_shape-pill")).toBe(
      true
    );
  });

  it("applies badge position/variant/shape modifier classes", () => {
    const el = mount({
      badgePosition: "top-right",
      badgeVariant: "success",
      badgeShape: "square"
    });
    const badge = el.shadowRoot.querySelector(".pflow-vpick__badge");
    expect(badge.classList.contains("pflow-vpick__badge_pos-top-right")).toBe(
      true
    );
    expect(badge.classList.contains("pflow-vpick__badge_variant-success")).toBe(
      true
    );
    expect(badge.classList.contains("pflow-vpick__badge_shape-square")).toBe(
      true
    );
  });

  it("normalizes invalid badge values to defaults", () => {
    const el = mount({
      badgePosition: "wacky",
      badgeVariant: "rainbow",
      badgeShape: "octagon"
    });
    const badge = el.shadowRoot.querySelector(".pflow-vpick__badge");
    expect(
      badge.classList.contains("pflow-vpick__badge_pos-bottom-inline")
    ).toBe(true);
    expect(badge.classList.contains("pflow-vpick__badge_variant-neutral")).toBe(
      true
    );
    expect(badge.classList.contains("pflow-vpick__badge_shape-pill")).toBe(
      true
    );
  });

  it("lets item.badgeVariant override the global variant", () => {
    const el = mount({
      badgeVariant: "neutral",
      item: { badgeVariant: "warning" }
    });
    const badge = el.shadowRoot.querySelector(".pflow-vpick__badge");
    expect(badge.classList.contains("pflow-vpick__badge_variant-warning")).toBe(
      true
    );
    expect(badge.classList.contains("pflow-vpick__badge_variant-neutral")).toBe(
      false
    );
  });

  it("applies the expanded selection indicator modifier classes", () => {
    ["frame", "spotlight", "ribbon", "pulse"].forEach((indicator) => {
      const el = mount({ selected: true, selectionIndicator: indicator });
      const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
      expect(wrapper.classList.contains(`pflow-vpick_sel-${indicator}`)).toBe(
        true
      );
      document.body.removeChild(el);
    });
  });

  it("normalizes invalid selection indicator values to checkmark", () => {
    const el = mount({ selectionIndicator: "sparkle" });
    const wrapper = el.shadowRoot.querySelector(".pflow-vpick");
    expect(wrapper.classList.contains("pflow-vpick_sel-checkmark")).toBe(true);
  });

  it("keeps no-decoration Lucide icons visible with the configured icon tone", () => {
    const el = mount({ iconDecor: "none", iconTone: "brand" });
    const iconWrap = el.shadowRoot.querySelector(".pflow-vpick__icon-wrap");
    expect(
      iconWrap.classList.contains("pflow-vpick__icon-wrap_decor-none")
    ).toBe(true);
    expect(
      iconWrap.classList.contains("pflow-vpick__icon-wrap_tone-brand")
    ).toBe(true);
    expect(
      iconWrap.classList.contains("pflow-vpick__icon-wrap_glyph-brand")
    ).toBe(true);
    expect(
      iconWrap.classList.contains("pflow-vpick__icon-wrap_glyph-contrast")
    ).toBe(false);
  });

  it("uses contrast glyphs only when a filled icon decoration is present", () => {
    const el = mount({ iconDecor: "badge", iconTone: "brand" });
    const iconWrap = el.shadowRoot.querySelector(".pflow-vpick__icon-wrap");
    expect(
      iconWrap.classList.contains("pflow-vpick__icon-wrap_decor-badge")
    ).toBe(true);
    expect(
      iconWrap.classList.contains("pflow-vpick__icon-wrap_shape-circle")
    ).toBe(true);
    expect(
      iconWrap.classList.contains("pflow-vpick__icon-wrap_glyph-contrast")
    ).toBe(true);
  });

  it("hides icons and badges for explicit false boolean or string values", () => {
    const boolOff = mount({ showIcons: false, showBadges: false });
    expect(
      boolOff.shadowRoot.querySelector(".pflow-vpick__icon-wrap")
    ).toBeNull();
    expect(boolOff.shadowRoot.querySelector(".pflow-vpick__badge")).toBeNull();
    document.body.removeChild(boolOff);

    const stringOff = mount({ showIcons: "false", showBadges: "false" });
    expect(
      stringOff.shadowRoot.querySelector(".pflow-vpick__icon-wrap")
    ).toBeNull();
    expect(
      stringOff.shadowRoot.querySelector(".pflow-vpick__badge")
    ).toBeNull();
  });
});
