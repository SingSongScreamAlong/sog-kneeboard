package com.example.androidapp.di;

import com.example.androidapp.domain.usecase.image.GenerateImageUseCase;
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
public final class UseCaseModule_ProvideGenerateImageUseCaseFactory implements Factory<GenerateImageUseCase> {
  private final Provider<GenerateImageUseCase> useCaseProvider;

  public UseCaseModule_ProvideGenerateImageUseCaseFactory(
      Provider<GenerateImageUseCase> useCaseProvider) {
    this.useCaseProvider = useCaseProvider;
  }

  @Override
  public GenerateImageUseCase get() {
    return provideGenerateImageUseCase(useCaseProvider.get());
  }

  public static UseCaseModule_ProvideGenerateImageUseCaseFactory create(
      Provider<GenerateImageUseCase> useCaseProvider) {
    return new UseCaseModule_ProvideGenerateImageUseCaseFactory(useCaseProvider);
  }

  public static GenerateImageUseCase provideGenerateImageUseCase(GenerateImageUseCase useCase) {
    return Preconditions.checkNotNullFromProvides(UseCaseModule.INSTANCE.provideGenerateImageUseCase(useCase));
  }
}
