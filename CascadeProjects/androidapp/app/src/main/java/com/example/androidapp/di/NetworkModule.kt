package com.example.androidapp.di

import com.example.androidapp.data.remote.api.ImageGenerationService
import com.example.androidapp.data.remote.api.StoryGenerationService
import com.google.gson.GsonBuilder
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.Interceptor
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

  private const val OPENAI_API_KEY = "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"

    @Provides
    @Singleton
    fun provideAuthInterceptor(): Interceptor {
        return Interceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $OPENAI_API_KEY")
                .build()
            chain.proceed(request)
        }
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: Interceptor): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .addInterceptor(authInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    @Named("openai")
    fun provideOpenAIRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.openai.com/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(GsonBuilder().create()))
            .build()
    }

    @Provides
    @Singleton
    fun provideStoryGenerationService(@Named("openai") retrofit: Retrofit): StoryGenerationService {
        return retrofit.create(StoryGenerationService::class.java)
    }

    @Provides
    @Singleton
    fun provideImageGenerationService(@Named("openai") retrofit: Retrofit): ImageGenerationService {
        return retrofit.create(ImageGenerationService::class.java)
    }
}
