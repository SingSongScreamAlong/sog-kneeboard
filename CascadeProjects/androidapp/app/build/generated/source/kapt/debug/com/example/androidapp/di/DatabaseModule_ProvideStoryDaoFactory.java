package com.example.androidapp.di;

import com.example.androidapp.data.local.db.AppDatabase;
import com.example.androidapp.data.local.db.dao.StoryDao;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
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
public final class DatabaseModule_ProvideStoryDaoFactory implements Factory<StoryDao> {
  private final Provider<AppDatabase> databaseProvider;

  public DatabaseModule_ProvideStoryDaoFactory(Provider<AppDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public StoryDao get() {
    return provideStoryDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideStoryDaoFactory create(
      Provider<AppDatabase> databaseProvider) {
    return new DatabaseModule_ProvideStoryDaoFactory(databaseProvider);
  }

  public static StoryDao provideStoryDao(AppDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideStoryDao(database));
  }
}
