package com.example.androidapp.data.local.ml;

import android.content.Context;
import com.example.androidapp.data.local.storage.FileStorageManager;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
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
public final class MistralModelManager_Factory implements Factory<MistralModelManager> {
  private final Provider<Context> contextProvider;

  private final Provider<FileStorageManager> fileStorageManagerProvider;

  public MistralModelManager_Factory(Provider<Context> contextProvider,
      Provider<FileStorageManager> fileStorageManagerProvider) {
    this.contextProvider = contextProvider;
    this.fileStorageManagerProvider = fileStorageManagerProvider;
  }

  @Override
  public MistralModelManager get() {
    return newInstance(contextProvider.get(), fileStorageManagerProvider.get());
  }

  public static MistralModelManager_Factory create(Provider<Context> contextProvider,
      Provider<FileStorageManager> fileStorageManagerProvider) {
    return new MistralModelManager_Factory(contextProvider, fileStorageManagerProvider);
  }

  public static MistralModelManager newInstance(Context context,
      FileStorageManager fileStorageManager) {
    return new MistralModelManager(context, fileStorageManager);
  }
}
