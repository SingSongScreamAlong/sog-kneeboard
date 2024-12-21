package com.example.androidapp.di;

import com.example.androidapp.data.remote.api.ImageGenerationService;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;
import retrofit2.Retrofit;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata("javax.inject.Named")
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
public final class NetworkModule_ProvideImageGenerationServiceFactory implements Factory<ImageGenerationService> {
  private final Provider<Retrofit> retrofitProvider;

  public NetworkModule_ProvideImageGenerationServiceFactory(Provider<Retrofit> retrofitProvider) {
    this.retrofitProvider = retrofitProvider;
  }

  @Override
  public ImageGenerationService get() {
    return provideImageGenerationService(retrofitProvider.get());
  }

  public static NetworkModule_ProvideImageGenerationServiceFactory create(
      Provider<Retrofit> retrofitProvider) {
    return new NetworkModule_ProvideImageGenerationServiceFactory(retrofitProvider);
  }

  public static ImageGenerationService provideImageGenerationService(Retrofit retrofit) {
    return Preconditions.checkNotNullFromProvides(NetworkModule.INSTANCE.provideImageGenerationService(retrofit));
  }
}
