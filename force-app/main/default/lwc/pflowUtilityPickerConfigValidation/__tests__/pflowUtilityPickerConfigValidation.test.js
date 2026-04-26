import {
  activeSectionIssueList,
  sectionIssues,
  sectionStatus,
  totalIssueCount
} from "c/pflowUtilityPickerConfigValidation";

const BASE_CONFIG = {
  dataSource: "custom",
  selectionMode: "single",
  custom: { items: [{ label: "One", value: "one" }] },
  collection: { fieldMap: { label: "Name" } },
  stringCollection: { sampleValues: "" },
  picklist: { objectApiName: "Account", fieldApiName: "Type" },
  sobject: { sObjectApiName: "Account", labelField: "Name" }
};

describe("c-pflow-utility-picker-config-validation", () => {
  it("blocks collection mode without a Flow collection binding", () => {
    const issues = sectionIssues("data", {
      ...BASE_CONFIG,
      dataSource: "collection"
    });

    expect(issues.errors).toContain("Bind a Flow record collection variable.");
    expect(
      sectionStatus("data", { ...BASE_CONFIG, dataSource: "collection" })
    ).toBe("error");
  });

  it("blocks collection mode without a label field map", () => {
    const config = {
      ...BASE_CONFIG,
      dataSource: "collection",
      collection: { fieldMap: { label: "" } }
    };
    const refs = { sourceRecordsRef: "{!records}" };

    const issues = sectionIssues("data", config, refs);

    expect(issues.errors).toContain(
      "Map at least the Label field for the collection."
    );
    expect(totalIssueCount(config, refs, "errors")).toBe(1);
  });

  it("blocks string list mode without a Flow String collection binding", () => {
    const issues = sectionIssues("data", {
      ...BASE_CONFIG,
      dataSource: "stringCollection"
    });

    expect(issues.errors).toContain("Bind a Flow String[] variable.");
  });

  it("blocks custom mode without items and still warns about incomplete rows", () => {
    const emptyConfig = {
      ...BASE_CONFIG,
      dataSource: "custom",
      custom: { items: [] }
    };
    const incompleteConfig = {
      ...BASE_CONFIG,
      dataSource: "custom",
      custom: { items: [{ label: "", value: "missing-label" }] }
    };

    expect(sectionIssues("data", emptyConfig).errors).toContain(
      "Add at least one custom item."
    );
    expect(sectionIssues("data", incompleteConfig).warnings).toContain(
      "1 item missing a label."
    );
  });

  it("returns renderable active issue metadata for blocking and warning issues", () => {
    const config = {
      ...BASE_CONFIG,
      dataSource: "custom",
      custom: { items: [{ label: "", value: "missing-label" }] },
      selectionMode: "multi",
      minSelections: 3,
      maxSelections: 1
    };

    const dataIssues = activeSectionIssueList("data", config);
    const behaviorIssues = activeSectionIssueList("behavior", config);

    expect(dataIssues[0]).toEqual(
      expect.objectContaining({
        level: "warn",
        icon: "triangle-alert",
        message: "1 item missing a label."
      })
    );
    expect(behaviorIssues[0]).toEqual(
      expect.objectContaining({
        level: "error",
        icon: "circle-alert",
        message: expect.stringContaining("Max selections")
      })
    );
  });
});
