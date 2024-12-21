package com.example.androidapp.presentation.ui.gallery;

import com.example.androidapp.domain.usecase.image.GenerateImageUseCase;
import com.example.androidapp.domain.usecase.image.GetImagesUseCase;
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
public final class GalleryViewModel_Factory implements Factory<GalleryViewModel> {
  private final Provider<GetImagesUseCase> getImagesUseCaseProvider;

  private final Provider<GenerateImageUseCase> generateImageUseCaseProvider;

  public GalleryViewModel_Factory(Provider<GetImagesUseCase> getImagesUseCaseProvider,
      Provider<GenerateImageUseCase> generateImageUseCaseProvider) {
    this.getImagesUseCaseProvider = getImagesUseCaseProvider;
    this.generateImageUseCaseProvider = generateImageUseCaseProvider;
  }

  @Override
  public GalleryViewModel get() {
    return newInstance(getImagesUseCaseProvider.get(), generateImageUseCaseProvider.get());
  }

  public static GalleryViewModel_Factory create(Provider<GetImagesUseCase> getImagesUseCaseProvider,
      Provider<GenerateImageUseCase> generateImageUseCaseProvider) {
    return new GalleryViewModel_Factory(getImagesUseCaseProvider, generateImageUseCaseProvider);
  }

  public static GalleryViewModel newInstance(GetImagesUseCase getImagesUseCase,
      GenerateImageUseCase generateImageUseCase) {
    return new GalleryViewModel(getImagesUseCase, generateImageUseCase);
  }
}
