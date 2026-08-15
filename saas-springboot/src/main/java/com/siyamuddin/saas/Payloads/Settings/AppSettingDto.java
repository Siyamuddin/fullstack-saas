package com.siyamuddin.saas.Payloads.Settings;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppSettingDto {
    private Long id;
    private String settingKey;
    private String settingValue;
    private String settingCategory;
    private String description;
    private String dataType;
    private Boolean isSensitive;
    private String updatedAt;
    private Integer updatedBy;
}

