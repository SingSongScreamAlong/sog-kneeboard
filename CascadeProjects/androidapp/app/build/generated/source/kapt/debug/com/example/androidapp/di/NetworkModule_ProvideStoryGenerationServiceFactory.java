package com.example.androidapp.di;

import com.example.androidapp.data.remote.api.StoryGenerationService;
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
public final class NetworkModule_ProvideStoryGenerationServiceFactory implements Factory<StoryGenerationService> {
  private final Provider<Retrofit> retrofitProvider;

  public NetworkModule_ProvideStoryGenerationServiceFactory(Provider<Retrofit> retrofitProvider) {
    this.retrofitProvider = retrofitProvider;
  }

  @Override
  public StoryGenerationService get() {
    return provideStoryGenerationService(retrofitProvider.get());
  }

  public static NetworkModule_ProvideStoryGenerationServiceFactory create(
      Provider<Retrofit> retrofitProvider) {
    return new NetworkModule_ProvideStoryGenerationServiceFactory(retrofitProvider);
  }

  public static StoryGenerationService provideStoryGenerationService(Retrofit retrofit) {
    return Preconditions.checkNotNullFromProvides(NetworkModule.INSTANCE.provideStoryGenerationService(retrofit));
  }
}
