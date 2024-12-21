package com.example.androidapp.presentation.ui.settings;

import com.example.androidapp.domain.usecase.settings.GetUserSettingsUseCase;
import com.example.androidapp.domain.usecase.settings.UpdateUserSettingsUseCase;
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
public final class SettingsViewModel_Factory implements Factory<SettingsViewModel> {
  private final Provider<GetUserSettingsUseCase> getUserSettingsUseCaseProvider;

  private final Provider<UpdateUserSettingsUseCase> updateUserSettingsUseCaseProvider;

  public SettingsViewModel_Factory(Provider<GetUserSettingsUseCase> getUserSettingsUseCaseProvider,
      Provider<UpdateUserSettingsUseCase> updateUserSettingsUseCaseProvider) {
    this.getUserSettingsUseCaseProvider = getUserSettingsUseCaseProvider;
    this.updateUserSettingsUseCaseProvider = updateUserSettingsUseCaseProvider;
  }

  @Override
  public SettingsViewModel get() {
    return newInstance(getUserSettingsUseCaseProvider.get(), updateUserSettingsUseCaseProvider.get());
  }

  public static SettingsViewModel_Factory create(
      Provider<GetUserSettingsUseCase> getUserSettingsUseCaseProvider,
      Provider<UpdateUserSettingsUseCase> updateUserSettingsUseCaseProvider) {
    return new SettingsViewModel_Factory(getUserSettingsUseCaseProvider, updateUserSettingsUseCaseProvider);
  }

  public static SettingsViewModel newInstance(GetUserSettingsUseCase getUserSettingsUseCase,
      UpdateUserSettingsUseCase updateUserSettingsUseCase) {
    return new SettingsViewModel(getUserSettingsUseCase, updateUserSettingsUseCase);
  }
}
