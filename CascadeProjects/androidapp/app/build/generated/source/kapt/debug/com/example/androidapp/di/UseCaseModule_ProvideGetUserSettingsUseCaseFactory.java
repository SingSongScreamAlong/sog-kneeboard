package com.example.androidapp.di;

import com.example.androidapp.domain.usecase.settings.GetUserSettingsUseCase;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("dagger.hilt.android.scopes.ViewModelScoped")
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
public final class UseCaseModule_ProvideGetUserSettingsUseCaseFactory implements Factory<GetUserSettingsUseCase> {
  private final Provider<GetUserSettingsUseCase> useCaseProvider;

  public UseCaseModule_ProvideGetUserSettingsUseCaseFactory(
      Provider<GetUserSettingsUseCase> useCaseProvider) {
    this.useCaseProvider = useCaseProvider;
  }

  @Override
  public GetUserSettingsUseCase get() {
    return provideGetUserSettingsUseCase(useCaseProvider.get());
  }

  public static UseCaseModule_ProvideGetUserSettingsUseCaseFactory create(
      Provider<GetUserSettingsUseCase> useCaseProvider) {
    return new UseCaseModule_ProvideGetUserSettingsUseCaseFactory(useCaseProvider);
  }

  public static GetUserSettingsUseCase provideGetUserSettingsUseCase(
      GetUserSettingsUseCase useCase) {
    return Preconditions.checkNotNullFromProvides(UseCaseModule.INSTANCE.provideGetUserSettingsUseCase(useCase));
  }
}
