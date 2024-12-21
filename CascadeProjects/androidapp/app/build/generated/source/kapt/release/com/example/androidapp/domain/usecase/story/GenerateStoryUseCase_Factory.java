package com.example.androidapp.domain.usecase.story;

import com.example.androidapp.data.local.datastore.UserPreferences;
import com.example.androidapp.data.local.ml.MistralModelManager;
import com.example.androidapp.domain.usecase.image.GenerateImageUseCase;
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
public final class GenerateStoryUseCase_Factory implements Factory<GenerateStoryUseCase> {
  private final Provider<NonExistentClass> storyRepositoryProvider;

  private final Provider<UserPreferences> userPreferencesProvider;

  private final Provider<MistralModelManager> mistralModelManagerProvider;

  private final Provider<GenerateImageUseCase> generateImageUseCaseProvider;

  public GenerateStoryUseCase_Factory(Provider<NonExistentClass> storyRepositoryProvider,
      Provider<UserPreferences> userPreferencesProvider,
      Provider<MistralModelManager> mistralModelManagerProvider,
      Provider<GenerateImageUseCase> generateImageUseCaseProvider) {
    this.storyRepositoryProvider = storyRepositoryProvider;
    this.userPreferencesProvider = userPreferencesProvider;
    this.mistralModelManagerProvider = mistralModelManagerProvider;
    this.generateImageUseCaseProvider = generateImageUseCaseProvider;
  }

  @Override
  public GenerateStoryUseCase get() {
    return newInstance(storyRepositoryProvider.get(), userPreferencesProvider.get(), mistralModelManagerProvider.get(), generateImageUseCaseProvider.get());
  }

  public static GenerateStoryUseCase_Factory create(
      Provider<NonExistentClass> storyRepositoryProvider,
      Provider<UserPreferences> userPreferencesProvider,
      Provider<MistralModelManager> mistralModelManagerProvider,
      Provider<GenerateImageUseCase> generateImageUseCaseProvider) {
    return new GenerateStoryUseCase_Factory(storyRepositoryProvider, userPreferencesProvider, mistralModelManagerProvider, generateImageUseCaseProvider);
  }

  public static GenerateStoryUseCase newInstance(NonExistentClass storyRepository,
      UserPreferences userPreferences, MistralModelManager mistralModelManager,
      GenerateImageUseCase generateImageUseCase) {
    return new GenerateStoryUseCase(storyRepository, userPreferences, mistralModelManager, generateImageUseCase);
  }
}
