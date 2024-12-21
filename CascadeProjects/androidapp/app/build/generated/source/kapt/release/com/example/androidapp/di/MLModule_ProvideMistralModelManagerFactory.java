package com.example.androidapp.di;

import com.example.androidapp.data.local.ml.MistralModelManager;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
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
public final class MLModule_ProvideMistralModelManagerFactory implements Factory<MistralModelManager> {
  private final Provider<MistralModelManager> mistralModelManagerProvider;

  public MLModule_ProvideMistralModelManagerFactory(
      Provider<MistralModelManager> mistralModelManagerProvider) {
    this.mistralModelManagerProvider = mistralModelManagerProvider;
  }

  @Override
  public MistralModelManager get() {
    return provideMistralModelManager(mistralModelManagerProvider.get());
  }

  public static MLModule_ProvideMistralModelManagerFactory create(
      Provider<MistralModelManager> mistralModelManagerProvider) {
    return new MLModule_ProvideMistralModelManagerFactory(mistralModelManagerProvider);
  }

  public static MistralModelManager provideMistralModelManager(
      MistralModelManager mistralModelManager) {
    return Preconditions.checkNotNullFromProvides(MLModule.INSTANCE.provideMistralModelManager(mistralModelManager));
  }
}
