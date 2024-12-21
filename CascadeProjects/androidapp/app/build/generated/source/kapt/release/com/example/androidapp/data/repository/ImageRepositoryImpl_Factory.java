package com.example.androidapp.data.repository;

import com.example.androidapp.data.local.db.dao.ImageDao;
import com.example.androidapp.data.remote.api.ImageGenerationService;
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
public final class ImageRepositoryImpl_Factory implements Factory<ImageRepositoryImpl> {
  private final Provider<ImageDao> imageDaoProvider;

  private final Provider<ImageGenerationService> imageGenerationServiceProvider;

  public ImageRepositoryImpl_Factory(Provider<ImageDao> imageDaoProvider,
      Provider<ImageGenerationService> imageGenerationServiceProvider) {
    this.imageDaoProvider = imageDaoProvider;
    this.imageGenerationServiceProvider = imageGenerationServiceProvider;
  }

  @Override
  public ImageRepositoryImpl get() {
    return newInstance(imageDaoProvider.get(), imageGenerationServiceProvider.get());
  }

  public static ImageRepositoryImpl_Factory create(Provider<ImageDao> imageDaoProvider,
      Provider<ImageGenerationService> imageGenerationServiceProvider) {
    return new ImageRepositoryImpl_Factory(imageDaoProvider, imageGenerationServiceProvider);
  }

  public static ImageRepositoryImpl newInstance(ImageDao imageDao,
      ImageGenerationService imageGenerationService) {
    return new ImageRepositoryImpl(imageDao, imageGenerationService);
  }
}
