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
public final class GenerateImageUseCase_Factory implements Factory<GenerateImageUseCase> {
  private final Provider<NonExistentClass> imageRepositoryProvider;

  public GenerateImageUseCase_Factory(Provider<NonExistentClass> imageRepositoryProvider) {
    this.imageRepositoryProvider = imageRepositoryProvider;
  }

  @Override
  public GenerateImageUseCase get() {
    return newInstance(imageRepositoryProvider.get());
  }

  public static GenerateImageUseCase_Factory create(
      Provider<NonExistentClass> imageRepositoryProvider) {
    return new GenerateImageUseCase_Factory(imageRepositoryProvider);
  }

  public static GenerateImageUseCase newInstance(NonExistentClass imageRepository) {
    return new GenerateImageUseCase(imageRepository);
  }
}
