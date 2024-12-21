package com.example.androidapp.di

import com.example.androidapp.domain.usecase.image.GenerateImageUseCase
import com.example.androidapp.domain.usecase.image.GetImagesUseCase
import com.example.androidapp.domain.usecase.settings.GetUserSettingsUseCase
import com.example.androidapp.domain.usecase.settings.UpdateUserSettingsUseCase
import com.example.androidapp.domain.usecase.story.GenerateStoryUseCase
import com.example.androidapp.domain.usecase.story.GetStoriesUseCase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object UseCaseModule {

    @Provides
    @ViewModelScoped
    fun provideGenerateStoryUseCase(useCase: GenerateStoryUseCase) = useCase

    @Provides
    @ViewModelScoped
    fun provideGetStoriesUseCase(useCase: GetStoriesUseCase) = useCase

    @Provides
    @ViewModelScoped
    fun provideGenerateImageUseCase(useCase: GenerateImageUseCase) = useCase

    @Provides
    @ViewModelScoped
    fun provideGetImagesUseCase(useCase: GetImagesUseCase) = useCase

    @Provides
    @ViewModelScoped
    fun provideGetUserSettingsUseCase(useCase: GetUserSettingsUseCase) = useCase

    @Provides
    @ViewModelScoped
    fun provideUpdateUserSettingsUseCase(useCase: UpdateUserSettingsUseCase) = useCase
}
