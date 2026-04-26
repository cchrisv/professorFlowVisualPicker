const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  modulePathIgnorePatterns: ["<rootDir>/.localdevserver"],
  moduleNameMapper: {
    ...(jestConfig.moduleNameMapper || {}),
    "^c/pflowUtilityPickerConfigStyles$":
      "<rootDir>/force-app/test/jest-mocks/pflowUtilityPickerConfigStyles",
    "^lightning/flowSupport$":
      "<rootDir>/force-app/test/jest-mocks/lightning/flowSupport"
  }
};
