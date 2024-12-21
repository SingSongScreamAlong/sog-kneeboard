package com.example.androidapp.presentation.ui.home;

import com.example.androidapp.domain.usecase.story.GenerateStoryUseCase;
import com.example.androidapp.domain.usecase.story.GetStoriesUseCase;
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
public final class HomeViewModel_Factory implements Factory<HomeViewModel> {
  private final Provider<GenerateStoryUseCase> generateStoryUseCaseProvider;

  private final Provider<GetStoriesUseCase> getStoriesUseCaseProvider;

  private final Provider<NonExistentClass> deleteStoryUseCaseProvider;

  public HomeViewModel_Factory(Provider<GenerateStoryUseCase> generateStoryUseCaseProvider,
      Provider<GetStoriesUseCase> getStoriesUseCaseProvider,
      Provider<NonExistentClass> deleteStoryUseCaseProvider) {
    this.generateStoryUseCaseProvider = generateStoryUseCaseProvider;
    this.getStoriesUseCaseProvider = getStoriesUseCaseProvider;
    this.deleteStoryUseCaseProvider = deleteStoryUseCaseProvider;
  }

  @Override
  public HomeViewModel get() {
    return newInstance(generateStoryUseCaseProvider.get(), getStoriesUseCaseProvider.get(), deleteStoryUseCaseProvider.get());
  }

  public static HomeViewModel_Factory create(
      Provider<GenerateStoryUseCase> generateStoryUseCaseProvider,
      Provider<GetStoriesUseCase> getStoriesUseCaseProvider,
      Provider<NonExistentClass> deleteStoryUseCaseProvider) {
    return new HomeViewModel_Factory(generateStoryUseCaseProvider, getStoriesUseCaseProvider, deleteStoryUseCaseProvider);
  }

  public static HomeViewModel newInstance(GenerateStoryUseCase generateStoryUseCase,
      GetStoriesUseCase getStoriesUseCase, NonExistentClass deleteStoryUseCase) {
    return new HomeViewModel(generateStoryUseCase, getStoriesUseCase, deleteStoryUseCase);
  }
}
