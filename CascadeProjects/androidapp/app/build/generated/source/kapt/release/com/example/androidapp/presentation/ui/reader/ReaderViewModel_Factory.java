package com.example.androidapp.presentation.ui.reader;

import com.example.androidapp.domain.usecase.story.GetStoriesUseCase;
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
public final class ReaderViewModel_Factory implements Factory<ReaderViewModel> {
  private final Provider<GetStoriesUseCase> getStoriesUseCaseProvider;

  public ReaderViewModel_Factory(Provider<GetStoriesUseCase> getStoriesUseCaseProvider) {
    this.getStoriesUseCaseProvider = getStoriesUseCaseProvider;
  }

  @Override
  public ReaderViewModel get() {
    return newInstance(getStoriesUseCaseProvider.get());
  }

  public static ReaderViewModel_Factory create(
      Provider<GetStoriesUseCase> getStoriesUseCaseProvider) {
    return new ReaderViewModel_Factory(getStoriesUseCaseProvider);
  }

  public static ReaderViewModel newInstance(GetStoriesUseCase getStoriesUseCase) {
    return new ReaderViewModel(getStoriesUseCase);
  }
}
