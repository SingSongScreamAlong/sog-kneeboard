package com.example.androidapp.di;

import com.example.androidapp.domain.usecase.story.GenerateStoryUseCase;
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
public final class UseCaseModule_ProvideGenerateStoryUseCaseFactory implements Factory<GenerateStoryUseCase> {
  private final Provider<GenerateStoryUseCase> useCaseProvider;

  public UseCaseModule_ProvideGenerateStoryUseCaseFactory(
      Provider<GenerateStoryUseCase> useCaseProvider) {
    this.useCaseProvider = useCaseProvider;
  }

  @Override
  public GenerateStoryUseCase get() {
    return provideGenerateStoryUseCase(useCaseProvider.get());
  }

  public static UseCaseModule_ProvideGenerateStoryUseCaseFactory create(
      Provider<GenerateStoryUseCase> useCaseProvider) {
    return new UseCaseModule_ProvideGenerateStoryUseCaseFactory(useCaseProvider);
  }

  public static GenerateStoryUseCase provideGenerateStoryUseCase(GenerateStoryUseCase useCase) {
    return Preconditions.checkNotNullFromProvides(UseCaseModule.INSTANCE.provideGenerateStoryUseCase(useCase));
  }
}
