@isTest
private class PflowPickerController_Test {
  @testSetup
  static void setup() {
    PflowPickerTestDataFactory.createAccounts(3, 'Technology');
  }

  @isTest
  static void queryItemsSuccess() {
    PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();
    String configJson = JSON.serialize(config);

    Test.startTest();
    List<PflowPickerItemDTO> dtos = PflowPickerController.queryItems(
      configJson
    );
    Test.stopTest();

    System.assertEquals(3, dtos.size());
  }

  @isTest
  static void queryItemsRejectsBlankConfig() {
    Test.startTest();
    try {
      PflowPickerController.queryItems('');
      System.assert(false, 'Should have thrown for blank config');
    } catch (AuraHandledException e) {
      System.assert(true);
    }
    Test.stopTest();
  }

  @isTest
  static void queryItemsRejectsMalformedJson() {
    Test.startTest();
    try {
      PflowPickerController.queryItems('{ not valid json');
      System.assert(false, 'Should have thrown for malformed JSON');
    } catch (AuraHandledException e) {
      System.assert(true);
    }
    Test.stopTest();
  }

  @isTest
  static void queryItemsAppliesWhereClause() {
    PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();
    config.whereClause = 'Industry = \'Technology\'';
    String configJson = JSON.serialize(config);

    PflowPickerTestDataFactory.createAccounts(2, 'Banking');

    Test.startTest();
    List<PflowPickerItemDTO> techOnly = PflowPickerController.queryItems(
      configJson
    );
    Test.stopTest();

    System.assertEquals(
      3,
      techOnly.size(),
      'WHERE should filter to Technology only'
    );
  }

  @isTest
  static void queryItemsBulk() {
    PflowPickerTestDataFactory.createAccounts(200, 'Bulk');
    PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();
    config.whereClause = 'Industry = \'Bulk\'';
    config.queryLimit = 500;
    String configJson = JSON.serialize(config);

    Test.startTest();
    List<PflowPickerItemDTO> dtos = PflowPickerController.queryItems(
      configJson
    );
    Test.stopTest();

    System.assertEquals(200, dtos.size());
  }
}
