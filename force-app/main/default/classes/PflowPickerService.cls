public with sharing class PflowPickerService {
  public static List<PflowPickerItemDTO> fetchItems(
    PflowPickerQueryDTO config
  ) {
    if (config == null) {
      throw new PflowPickerException('Query configuration is required.');
    }
    List<SObject> records = PflowPickerSelector.query(config);
    return mapRecords(records, config);
  }

  private static List<PflowPickerItemDTO> mapRecords(
    List<SObject> records,
    PflowPickerQueryDTO config
  ) {
    List<PflowPickerItemDTO> dtos = new List<PflowPickerItemDTO>();
    if (records == null || records.isEmpty()) {
      return dtos;
    }

    for (Integer i = 0; i < records.size(); i++) {
      SObject record = records[i];
      dtos.add(mapSingle(record, config, i));
    }
    return dtos;
  }

  private static PflowPickerItemDTO mapSingle(
    SObject record,
    PflowPickerQueryDTO config,
    Integer index
  ) {
    PflowPickerItemDTO dto = new PflowPickerItemDTO();
    dto.id = String.valueOf(record.Id != null ? record.Id : 'rec-' + index);
    dto.label = readString(record, config.labelField);
    dto.sublabel = readString(record, config.sublabelField);
    dto.icon = readString(record, config.iconField);
    dto.badge = readString(record, config.badgeField);
    dto.helpText = readString(record, config.helpField);
    dto.value = resolveValue(record, config, dto.id);
    dto.disabled = false;
    return dto;
  }

  private static String readString(SObject record, String fieldApiName) {
    if (String.isBlank(fieldApiName)) {
      return '';
    }
    Object raw = record.get(fieldApiName);
    return raw == null ? '' : String.valueOf(raw);
  }

  private static String resolveValue(
    SObject record,
    PflowPickerQueryDTO config,
    String fallbackId
  ) {
    if (String.isNotBlank(config.valueField)) {
      String v = readString(record, config.valueField);
      if (String.isNotBlank(v)) {
        return v;
      }
    }
    return fallbackId;
  }
}
