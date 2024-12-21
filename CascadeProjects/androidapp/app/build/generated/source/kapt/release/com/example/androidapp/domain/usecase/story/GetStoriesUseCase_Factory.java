package com.example.androidapp.domain.usecase.story;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import error.NonExistentClass;
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
public final class GetStoriesUseCase_Factory implements Factory<GetStoriesUseCase> {
  private final Provider<NonExistentClass> storyRepositoryProvider;

  private final Provider<NonExistentClass> imageRepositoryProvider;

  public GetStoriesUseCase_Factory(Provider<NonExistentClass> storyRepositoryProvider,
      Provider<NonExistentClass> imageRepositoryProvider) {
    this.storyRepositoryProvider = storyRepositoryProvider;
    this.imageRepositoryProvider = imageRepositoryProvider;
  }

  @Override
  public GetStoriesUseCase get() {
    return newInstance(storyRepositoryProvider.get(), imageRepositoryProvider.get());
  }

  public static GetStoriesUseCase_Factory create(Provider<NonExistentClass> storyRepositoryProvider,
      Provider<NonExistentClass> imageRepositoryProvider) {
    return new GetStoriesUseCase_Factory(storyRepositoryProvider, imageRepositoryProvider);
  }

  public static GetStoriesUseCase newInstance(NonExistentClass storyRepository,
      NonExistentClass imageRepository) {
    return new GetStoriesUseCase(storyRepository, imageRepository);
  }
}
