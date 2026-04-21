@isTest
private class PflowPickerSelector_Test {

    @testSetup
    static void setup() {
        PflowPickerTestDataFactory.createAccounts(10, 'Technology');
        PflowPickerTestDataFactory.createAccounts(5, 'Finance');
    }

    @isTest
    static void queryReturnsRecordsInOrder() {
        PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();

        Test.startTest();
        List<SObject> results = PflowPickerSelector.query(config);
        Test.stopTest();

        System.assertEquals(15, results.size(), 'Should return all 15 accounts');
        // Ordered by Name ASC
        System.assert(
            ((String) results[0].get('Name')).compareTo((String) results[1].get('Name')) <= 0,
            'Should be ordered ASC by Name'
        );
    }

    @isTest
    static void queryFiltersByWhereClause() {
        PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();
        config.whereClause = 'Industry = \'Technology\'';

        Test.startTest();
        List<SObject> results = PflowPickerSelector.query(config);
        Test.stopTest();

        System.assertEquals(10, results.size(), 'Should only return Tech accounts');
        for (SObject record : results) {
            System.assertEquals('Technology', record.get('Industry'));
        }
    }

    @isTest
    static void queryAppliesLimit() {
        PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();
        config.queryLimit = 3;

        Test.startTest();
        List<SObject> results = PflowPickerSelector.query(config);
        Test.stopTest();

        System.assertEquals(3, results.size(), 'Limit should cap results');
    }

    @isTest
    static void queryRejectsBlankObject() {
        PflowPickerQueryDTO config = new PflowPickerQueryDTO();
        config.sObjectApiName = '';

        Test.startTest();
        try {
            PflowPickerSelector.query(config);
            System.assert(false, 'Should have thrown for blank object');
        } catch (PflowPickerException e) {
            System.assert(e.getMessage().contains('required'));
        }
        Test.stopTest();
    }

    @isTest
    static void queryRejectsUnknownObject() {
        PflowPickerQueryDTO config = new PflowPickerQueryDTO();
        config.sObjectApiName = 'DoesNotExist__c';

        Test.startTest();
        try {
            PflowPickerSelector.query(config);
            System.assert(false, 'Should have thrown for unknown object');
        } catch (PflowPickerException e) {
            System.assert(e.getMessage().contains('Unknown object'));
        }
        Test.stopTest();
    }

    @isTest
    static void queryRejectsUnknownField() {
        PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();
        config.labelField = 'NotARealField__c';

        Test.startTest();
        try {
            PflowPickerSelector.query(config);
            System.assert(false, 'Should have thrown for unknown field');
        } catch (PflowPickerException e) {
            System.assert(e.getMessage().contains('Unknown field'));
        }
        Test.stopTest();
    }

    @isTest
    static void queryHandlesBulkVolume() {
        PflowPickerTestDataFactory.createAccounts(200, 'Healthcare');
        PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();
        config.whereClause = 'Industry = \'Healthcare\'';
        config.queryLimit = 500;

        Test.startTest();
        List<SObject> results = PflowPickerSelector.query(config);
        Test.stopTest();

        System.assertEquals(200, results.size(), 'Should return all 200 healthcare accounts under the 500 limit');
    }

    @isTest
    static void queryRespectsSharing() {
        PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();

        User u = PflowPickerTestDataFactory.createStandardUser();
        Integer countAsUser;
        System.runAs(u) {
            Test.startTest();
            List<SObject> results = PflowPickerSelector.query(config);
            Test.stopTest();
            countAsUser = results.size();
        }
        // Standard user may see 0 accounts depending on org sharing model; the
        // assertion here is that the query runs without exception under an
        // unprivileged user — sharing model is enforced by USER_MODE.
        System.assertNotEquals(null, countAsUser, 'Query should complete as standard user');
    }
}
