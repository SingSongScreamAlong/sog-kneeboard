package com.example.androidapp.di;

import com.example.androidapp.domain.usecase.settings.UpdateUserSettingsUseCase;
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
public final class UseCaseModule_ProvideUpdateUserSettingsUseCaseFactory implements Factory<UpdateUserSettingsUseCase> {
  private final Provider<UpdateUserSettingsUseCase> useCaseProvider;

  public UseCaseModule_ProvideUpdateUserSettingsUseCaseFactory(
      Provider<UpdateUserSettingsUseCase> useCaseProvider) {
    this.useCaseProvider = useCaseProvider;
  }

  @Override
  public UpdateUserSettingsUseCase get() {
    return provideUpdateUserSettingsUseCase(useCaseProvider.get());
  }

  public static UseCaseModule_ProvideUpdateUserSettingsUseCaseFactory create(
      Provider<UpdateUserSettingsUseCase> useCaseProvider) {
    return new UseCaseModule_ProvideUpdateUserSettingsUseCaseFactory(useCaseProvider);
  }

  public static UpdateUserSettingsUseCase provideUpdateUserSettingsUseCase(
      UpdateUserSettingsUseCase useCase) {
    return Preconditions.checkNotNullFromProvides(UseCaseModule.INSTANCE.provideUpdateUserSettingsUseCase(useCase));
  }
}
