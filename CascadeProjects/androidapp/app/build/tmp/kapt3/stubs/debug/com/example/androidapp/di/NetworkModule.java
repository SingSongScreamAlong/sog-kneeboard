package com.example.androidapp.di;

@dagger.Module
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00002\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0000\b\u00c7\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002J\b\u0010\u0005\u001a\u00020\u0006H\u0007J\u0012\u0010\u0007\u001a\u00020\b2\b\b\u0001\u0010\t\u001a\u00020\nH\u0007J\u0010\u0010\u000b\u001a\u00020\f2\u0006\u0010\r\u001a\u00020\u0006H\u0007J\u0010\u0010\u000e\u001a\u00020\n2\u0006\u0010\u000f\u001a\u00020\fH\u0007J\u0012\u0010\u0010\u001a\u00020\u00112\b\b\u0001\u0010\t\u001a\u00020\nH\u0007R\u000e\u0010\u0003\u001a\u00020\u0004X\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0012"}, d2 = {"Lcom/example/androidapp/di/NetworkModule;", "", "()V", "OPENAI_API_KEY", "", "provideAuthInterceptor", "Lokhttp3/Interceptor;", "provideImageGenerationService", "Lcom/example/androidapp/data/remote/api/ImageGenerationService;", "retrofit", "Lretrofit2/Retrofit;", "provideOkHttpClient", "Lokhttp3/OkHttpClient;", "authInterceptor", "provideOpenAIRetrofit", "okHttpClient", "provideStoryGenerationService", "Lcom/example/androidapp/data/remote/api/StoryGenerationService;", "app_debug"})
@dagger.hilt.InstallIn(value = {dagger.hilt.components.SingletonComponent.class})
public final class NetworkModule {
    @org.jetbrains.annotations.NotNull
    private static final java.lang.String OPENAI_API_KEY = "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";
    @org.jetbrains.annotations.NotNull
    public static final com.example.androidapp.di.NetworkModule INSTANCE = null;
    
    private NetworkModule() {
        super();
    }
    
    @dagger.Provides
    @javax.inject.Singleton
    @org.jetbrains.annotations.NotNull
    public final okhttp3.Interceptor provideAuthInterceptor() {
        return null;
    }
    
    @dagger.Provides
    @javax.inject.Singleton
    @org.jetbrains.annotations.NotNull
    public final okhttp3.OkHttpClient provideOkHttpClient(@org.jetbrains.annotations.NotNull
    okhttp3.Interceptor authInterceptor) {
        return null;
    }
    
    @dagger.Provides
    @javax.inject.Singleton
    @javax.inject.Named(value = "openai")
    @org.jetbrains.annotations.NotNull
    public final retrofit2.Retrofit provideOpenAIRetrofit(@org.jetbrains.annotations.NotNull
    okhttp3.OkHttpClient okHttpClient) {
        return null;
    }
    
    @dagger.Provides
    @javax.inject.Singleton
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.data.remote.api.StoryGenerationService provideStoryGenerationService(@javax.inject.Named(value = "openai")
    @org.jetbrains.annotations.NotNull
    retrofit2.Retrofit retrofit) {
        return null;
    }
    
    @dagger.Provides
    @javax.inject.Singleton
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.data.remote.api.ImageGenerationService provideImageGenerationService(@javax.inject.Named(value = "openai")
    @org.jetbrains.annotations.NotNull
    retrofit2.Retrofit retrofit) {
        return null;
    }
}