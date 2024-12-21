package com.example.androidapp.di

import com.example.androidapp.data.local.security.SecureStorageManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object SecurityModule {
    @Provides
    @Singleton
    fun provideSecureStorageManager(
        secureStorageManager: SecureStorageManager
    ): SecureStorageManager = secureStorageManager
}
