public with sharing class PflowPickerSelector {

    private static final Integer MAX_LIMIT = 2000;
    private static final Set<String> ALLOWED_DIRECTIONS = new Set<String>{ 'ASC', 'DESC' };

    public static List<SObject> query(PflowPickerQueryDTO config) {
        validateObject(config.sObjectApiName);
        List<String> fields = collectFields(config);
        validateFields(config.sObjectApiName, fields);

        String soql = buildSoql(config, fields);
        return Database.queryWithBinds(
            soql,
            new Map<String, Object>(),
            AccessLevel.USER_MODE
        );
    }

    private static void validateObject(String apiName) {
        if (String.isBlank(apiName)) {
            throw new PflowPickerException('Object API name is required.');
        }
        Schema.SObjectType type = Schema.getGlobalDescribe().get(apiName);
        if (type == null) {
            throw new PflowPickerException('Unknown object: ' + apiName);
        }
        if (!type.getDescribe().isQueryable() || !type.getDescribe().isAccessible()) {
            throw new PflowPickerException('Object not accessible: ' + apiName);
        }
    }

    private static List<String> collectFields(PflowPickerQueryDTO config) {
        Set<String> fieldSet = new Set<String>{ 'Id' };
        addIfPresent(fieldSet, config.labelField);
        addIfPresent(fieldSet, config.valueField);
        addIfPresent(fieldSet, config.sublabelField);
        addIfPresent(fieldSet, config.iconField);
        addIfPresent(fieldSet, config.badgeField);
        addIfPresent(fieldSet, config.helpField);
        addIfPresent(fieldSet, config.orderByField);
        return new List<String>(fieldSet);
    }

    private static void addIfPresent(Set<String> target, String value) {
        if (String.isNotBlank(value)) target.add(value);
    }

    private static void validateFields(String apiName, List<String> fields) {
        Schema.SObjectType type = Schema.getGlobalDescribe().get(apiName);
        Map<String, Schema.SObjectField> fieldMap = type.getDescribe().fields.getMap();
        for (String f : fields) {
            String key = f.toLowerCase();
            Schema.SObjectField token = fieldMap.get(key);
            if (token == null) {
                throw new PflowPickerException('Unknown field on ' + apiName + ': ' + f);
            }
            if (!token.getDescribe().isAccessible()) {
                throw new PflowPickerException('Field not accessible on ' + apiName + ': ' + f);
            }
        }
    }

    private static String buildSoql(PflowPickerQueryDTO config, List<String> fields) {
        String selectClause = String.join(fields, ', ');
        String sObjectName = String.escapeSingleQuotes(config.sObjectApiName);
        String soql = 'SELECT ' + selectClause + ' FROM ' + sObjectName;
        soql += buildWhere(config);
        soql += buildOrderBy(config);
        soql += buildLimit(config);
        return soql;
    }

    private static String buildWhere(PflowPickerQueryDTO config) {
        if (String.isBlank(config.whereClause)) return '';
        return ' WHERE (' + config.whereClause + ')';
    }

    private static String buildOrderBy(PflowPickerQueryDTO config) {
        if (String.isBlank(config.orderByField)) return '';
        String direction = String.isBlank(config.orderByDirection)
            ? 'ASC'
            : config.orderByDirection.toUpperCase();
        if (!ALLOWED_DIRECTIONS.contains(direction)) direction = 'ASC';
        return ' ORDER BY ' + String.escapeSingleQuotes(config.orderByField) + ' ' + direction;
    }

    private static String buildLimit(PflowPickerQueryDTO config) {
        Integer effective = (config.queryLimit == null || config.queryLimit <= 0) ? 50 : config.queryLimit;
        if (effective > MAX_LIMIT) effective = MAX_LIMIT;
        return ' LIMIT ' + effective;
    }
}
