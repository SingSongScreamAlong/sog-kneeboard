package com.example.androidapp.domain.usecase.settings;

import com.example.androidapp.data.local.datastore.UserPreferences;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class UpdateUserSettingsUseCase_Factory implements Factory<UpdateUserSettingsUseCase> {
  private final Provider<UserPreferences> userPreferencesProvider;

  public UpdateUserSettingsUseCase_Factory(Provider<UserPreferences> userPreferencesProvider) {
    this.userPreferencesProvider = userPreferencesProvider;
  }

  @Override
  public UpdateUserSettingsUseCase get() {
    return newInstance(userPreferencesProvider.get());
  }

  public static UpdateUserSettingsUseCase_Factory create(
      Provider<UserPreferences> userPreferencesProvider) {
    return new UpdateUserSettingsUseCase_Factory(userPreferencesProvider);
  }

  public static UpdateUserSettingsUseCase newInstance(UserPreferences userPreferences) {
    return new UpdateUserSettingsUseCase(userPreferences);
  }
}
