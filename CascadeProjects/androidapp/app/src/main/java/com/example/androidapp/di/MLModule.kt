package com.example.androidapp.di

import com.example.androidapp.data.local.ml.MistralModelManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object MLModule {
    @Provides
    @Singleton
    fun provideMistralModelManager(
        mistralModelManager: MistralModelManager
    ): MistralModelManager = mistralModelManager
}
