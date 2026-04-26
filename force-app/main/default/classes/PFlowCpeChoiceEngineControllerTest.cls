/**
 * @description Tests for PFlowCpeChoiceEngineController — covers the three AuraEnabled methods
 * exposed to the pack's LWCs: searchSObjectTypes, searchLookupDatasetFieldsForObject, getObjectFields.
 */
@IsTest
private class PFlowCpeChoiceEngineControllerTest {
  // ── getObjectFields ─────────────────────────────────────

  @IsTest
  static void testGetObjectFieldsReturnsAccountFields() {
    Test.startTest();
    List<PFlowCpeChoiceEngineController.Field> fields = PFlowCpeChoiceEngineController.getObjectFields(
      'Account'
    );
    Test.stopTest();

    Boolean accountOk =
      Schema.getGlobalDescribe().containsKey('Account') &&
      Schema.getGlobalDescribe().get('Account').getDescribe().isAccessible();
    Assert.isTrue(
      accountOk,
      'Account should be accessible in describe for this org'
    );

    if (fields.isEmpty()) {
      return;
    }
    Boolean hasName = false;
    for (PFlowCpeChoiceEngineController.Field f : fields) {
      if (f.name == 'Name') {
        hasName = true;
        break;
      }
    }
    Assert.isTrue(
      hasName,
      'Account.Name should be present when any Account fields are readable'
    );
  }

  @IsTest
  static void testGetObjectFieldsBlankNameReturnsEmpty() {
    Assert.areEqual(
      0,
      PFlowCpeChoiceEngineController.getObjectFields(null).size()
    );
    Assert.areEqual(
      0,
      PFlowCpeChoiceEngineController.getObjectFields('').size()
    );
    Assert.areEqual(
      0,
      PFlowCpeChoiceEngineController.getObjectFields('   ').size()
    );
  }

  @IsTest
  static void testGetObjectFieldsInvalidTypeReturnsEmpty() {
    Assert.areEqual(
      0,
      PFlowCpeChoiceEngineController.getObjectFields('NotARealObjectZZZ999')
        .size()
    );
  }

  @IsTest
  static void testGetObjectFieldsIncludesReferenceMetadata() {
    Test.startTest();
    List<PFlowCpeChoiceEngineController.Field> fields = PFlowCpeChoiceEngineController.getObjectFields(
      'Contact'
    );
    Test.stopTest();
    Boolean sawAccountLookup = false;
    for (PFlowCpeChoiceEngineController.Field f : fields) {
      if (f.name == 'AccountId' && f.parentObjectName == 'Account') {
        sawAccountLookup = true;
        Assert.areEqual('Account', f.relationshipName);
        break;
      }
    }
    if (!fields.isEmpty()) {
      Assert.isTrue(
        sawAccountLookup,
        'Contact.AccountId should resolve to Account with relationshipName=Account'
      );
    }
  }

  // ── searchSObjectTypes ──────────────────────────────────

  @IsTest
  static void testSearchSObjectTypesReturnsAccount() {
    List<PFlowCpeChoiceEngineController.ChoiceOption> rows = PFlowCpeChoiceEngineController.searchSObjectTypes(
      'accoun'
    );
    Assert.isTrue(!rows.isEmpty());
    Boolean found = false;
    for (PFlowCpeChoiceEngineController.ChoiceOption r : rows) {
      if (r.value == 'Account') {
        found = true;
        break;
      }
    }
    Assert.isTrue(found);
  }

  @IsTest
  static void testSearchSObjectTypesBlankReturnsRows() {
    List<PFlowCpeChoiceEngineController.ChoiceOption> rows = PFlowCpeChoiceEngineController.searchSObjectTypes(
      ''
    );
    Assert.isTrue(!rows.isEmpty());
  }

  @IsTest
  static void testSearchSObjectTypesNoMatchReturnsEmpty() {
    List<PFlowCpeChoiceEngineController.ChoiceOption> rows = PFlowCpeChoiceEngineController.searchSObjectTypes(
      'zzzzzznomatchobject99999'
    );
    Assert.areEqual(0, rows.size());
  }

  @IsTest
  static void testSearchSObjectTypesNullSafe() {
    Assert.isTrue(
      !PFlowCpeChoiceEngineController.searchSObjectTypes(null).isEmpty()
    );
  }

  // ── searchLookupDatasetFieldsForObject ──────────────────

  @IsTest
  static void testSearchLookupDatasetFieldsForAccount() {
    List<PFlowCpeChoiceEngineController.ChoiceOption> rows = PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject(
      'Account',
      ''
    );
    Assert.isTrue(!rows.isEmpty());
    Boolean sawName = false;
    for (PFlowCpeChoiceEngineController.ChoiceOption r : rows) {
      if (r != null && r.value == 'Name') {
        sawName = true;
        break;
      }
    }
    Assert.isTrue(
      sawName,
      'Account.Name should be present in the field lookup'
    );
  }

  @IsTest
  static void testSearchLookupDatasetFieldsForLead() {
    if (!Schema.getGlobalDescribe().containsKey('Lead')) {
      return;
    }
    List<PFlowCpeChoiceEngineController.ChoiceOption> rows = PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject(
      'Lead',
      ''
    );
    Assert.isTrue(!rows.isEmpty());
  }

  @IsTest
  static void testSearchLookupDatasetFieldsBlankObjectReturnsEmpty() {
    Assert.areEqual(
      0,
      PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject('', 'x')
        .size()
    );
    Assert.areEqual(
      0,
      PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject(
          null,
          'x'
        )
        .size()
    );
  }

  @IsTest
  static void testSearchLookupDatasetFieldsBogusObjectReturnsEmpty() {
    Assert.areEqual(
      0,
      PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject(
          'NotAnObjectZZZ__c',
          ''
        )
        .size()
    );
  }

  @IsTest
  static void testSearchLookupDatasetFieldsFiltersByKey() {
    List<PFlowCpeChoiceEngineController.ChoiceOption> rows = PFlowCpeChoiceEngineController.searchLookupDatasetFieldsForObject(
      'Account',
      'name'
    );
    if (rows.isEmpty()) {
      return;
    }
    for (PFlowCpeChoiceEngineController.ChoiceOption r : rows) {
      String nm = r.value == null ? '' : r.value.toLowerCase();
      String lab = r.label == null ? '' : r.label.toLowerCase();
      Assert.isTrue(nm.contains('name') || lab.contains('name'));
    }
  }
}
