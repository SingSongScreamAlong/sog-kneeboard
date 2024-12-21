package com.example.androidapp.di;

import com.example.androidapp.domain.usecase.story.GetStoriesUseCase;
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
public final class UseCaseModule_ProvideGetStoriesUseCaseFactory implements Factory<GetStoriesUseCase> {
  private final Provider<GetStoriesUseCase> useCaseProvider;

  public UseCaseModule_ProvideGetStoriesUseCaseFactory(
      Provider<GetStoriesUseCase> useCaseProvider) {
    this.useCaseProvider = useCaseProvider;
  }

  @Override
  public GetStoriesUseCase get() {
    return provideGetStoriesUseCase(useCaseProvider.get());
  }

  public static UseCaseModule_ProvideGetStoriesUseCaseFactory create(
      Provider<GetStoriesUseCase> useCaseProvider) {
    return new UseCaseModule_ProvideGetStoriesUseCaseFactory(useCaseProvider);
  }

  public static GetStoriesUseCase provideGetStoriesUseCase(GetStoriesUseCase useCase) {
    return Preconditions.checkNotNullFromProvides(UseCaseModule.INSTANCE.provideGetStoriesUseCase(useCase));
  }
}
