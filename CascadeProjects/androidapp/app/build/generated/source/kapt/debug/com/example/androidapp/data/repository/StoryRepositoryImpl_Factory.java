package com.example.androidapp.data.repository;

import com.example.androidapp.data.local.db.dao.StoryDao;
import com.example.androidapp.data.remote.api.StoryGenerationService;
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
public final class StoryRepositoryImpl_Factory implements Factory<StoryRepositoryImpl> {
  private final Provider<StoryDao> storyDaoProvider;

  private final Provider<StoryGenerationService> storyGenerationServiceProvider;

  public StoryRepositoryImpl_Factory(Provider<StoryDao> storyDaoProvider,
      Provider<StoryGenerationService> storyGenerationServiceProvider) {
    this.storyDaoProvider = storyDaoProvider;
    this.storyGenerationServiceProvider = storyGenerationServiceProvider;
  }

  @Override
  public StoryRepositoryImpl get() {
    return newInstance(storyDaoProvider.get(), storyGenerationServiceProvider.get());
  }

  public static StoryRepositoryImpl_Factory create(Provider<StoryDao> storyDaoProvider,
      Provider<StoryGenerationService> storyGenerationServiceProvider) {
    return new StoryRepositoryImpl_Factory(storyDaoProvider, storyGenerationServiceProvider);
  }

  public static StoryRepositoryImpl newInstance(StoryDao storyDao,
      StoryGenerationService storyGenerationService) {
    return new StoryRepositoryImpl(storyDao, storyGenerationService);
  }
}
