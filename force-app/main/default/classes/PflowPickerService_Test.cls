@isTest
private class PflowPickerService_Test {

    @testSetup
    static void setup() {
        PflowPickerTestDataFactory.createAccounts(5, 'Technology');
    }

    @isTest
    static void fetchItemsReturnsNormalizedDtos() {
        PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();

        Test.startTest();
        List<PflowPickerItemDTO> dtos = PflowPickerService.fetchItems(config);
        Test.stopTest();

        System.assertEquals(5, dtos.size(), 'Should return 5 items');
        for (PflowPickerItemDTO dto : dtos) {
            System.assertNotEquals(null, dto.id, 'DTO should have an id');
            System.assertNotEquals('', dto.label, 'DTO should have a label');
            System.assertEquals('Technology', dto.sublabel, 'Sublabel should map to Industry');
            System.assertEquals(false, dto.disabled, 'Disabled defaults to false');
        }
    }

    @isTest
    static void fetchItemsRejectsNullConfig() {
        Test.startTest();
        try {
            PflowPickerService.fetchItems(null);
            System.assert(false, 'Should have thrown for null config');
        } catch (PflowPickerException e) {
            System.assert(e.getMessage().contains('required'));
        }
        Test.stopTest();
    }

    @isTest
    static void fetchItemsHandlesBulkMapping() {
        PflowPickerTestDataFactory.createAccounts(195, 'Retail');
        PflowPickerQueryDTO config = PflowPickerTestDataFactory.buildSimpleAccountConfig();
        config.whereClause = 'Industry = \'Retail\'';
        config.queryLimit = 500;

        Test.startTest();
        List<PflowPickerItemDTO> dtos = PflowPickerService.fetchItems(config);
        Test.stopTest();

        System.assertEquals(195, dtos.size(), 'Bulk mapping should handle all records');
    }
}
