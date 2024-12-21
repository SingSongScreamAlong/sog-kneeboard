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
public final class GetUserSettingsUseCase_Factory implements Factory<GetUserSettingsUseCase> {
  private final Provider<UserPreferences> userPreferencesProvider;

  public GetUserSettingsUseCase_Factory(Provider<UserPreferences> userPreferencesProvider) {
    this.userPreferencesProvider = userPreferencesProvider;
  }

  @Override
  public GetUserSettingsUseCase get() {
    return newInstance(userPreferencesProvider.get());
  }

  public static GetUserSettingsUseCase_Factory create(
      Provider<UserPreferences> userPreferencesProvider) {
    return new GetUserSettingsUseCase_Factory(userPreferencesProvider);
  }

  public static GetUserSettingsUseCase newInstance(UserPreferences userPreferences) {
    return new GetUserSettingsUseCase(userPreferences);
  }
}
