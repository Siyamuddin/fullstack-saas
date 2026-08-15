package com.siyamuddin.saas.Repository;

import com.siyamuddin.saas.Entity.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppSettingRepo extends JpaRepository<AppSetting, Long> {
    
    Optional<AppSetting> findBySettingKey(String settingKey);
    
    List<AppSetting> findBySettingCategoryOrderBySettingKey(AppSetting.SettingCategory category);
    
    List<AppSetting> findAllByOrderBySettingCategory();
    
    boolean existsBySettingKey(String settingKey);
}

