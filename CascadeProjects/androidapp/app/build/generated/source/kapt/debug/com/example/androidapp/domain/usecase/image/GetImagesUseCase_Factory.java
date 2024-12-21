package com.example.androidapp.domain.usecase.image;

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
public final class GetImagesUseCase_Factory implements Factory<GetImagesUseCase> {
  private final Provider<NonExistentClass> imageRepositoryProvider;

  public GetImagesUseCase_Factory(Provider<NonExistentClass> imageRepositoryProvider) {
    this.imageRepositoryProvider = imageRepositoryProvider;
  }

  @Override
  public GetImagesUseCase get() {
    return newInstance(imageRepositoryProvider.get());
  }

  public static GetImagesUseCase_Factory create(
      Provider<NonExistentClass> imageRepositoryProvider) {
    return new GetImagesUseCase_Factory(imageRepositoryProvider);
  }

  public static GetImagesUseCase newInstance(NonExistentClass imageRepository) {
    return new GetImagesUseCase(imageRepository);
  }
}
