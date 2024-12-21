package com.example.androidapp.di;

import com.example.androidapp.data.local.db.AppDatabase;
import com.example.androidapp.data.local.db.dao.ImageDao;
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
public final class DatabaseModule_ProvideImageDaoFactory implements Factory<ImageDao> {
  private final Provider<AppDatabase> databaseProvider;

  public DatabaseModule_ProvideImageDaoFactory(Provider<AppDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public ImageDao get() {
    return provideImageDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideImageDaoFactory create(
      Provider<AppDatabase> databaseProvider) {
    return new DatabaseModule_ProvideImageDaoFactory(databaseProvider);
  }

  public static ImageDao provideImageDao(AppDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideImageDao(database));
  }
}
