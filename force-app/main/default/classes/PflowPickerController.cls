public with sharing class PflowPickerController {
  @AuraEnabled(cacheable=true)
  public static List<PflowPickerItemDTO> queryItems(String configJson) {
    try {
      if (String.isBlank(configJson)) {
        throw new PflowPickerException('Picker configuration is required.');
      }
      PflowPickerQueryDTO config = (PflowPickerQueryDTO) JSON.deserialize(
        configJson,
        PflowPickerQueryDTO.class
      );
      return PflowPickerService.fetchItems(config);
    } catch (PflowPickerException e) {
      throw new AuraHandledException(e.getMessage());
    } catch (System.JSONException e) {
      throw new AuraHandledException('Invalid picker configuration.');
    } catch (Exception e) {
      throw new AuraHandledException('Unable to load picker options.');
    }
  }
}
