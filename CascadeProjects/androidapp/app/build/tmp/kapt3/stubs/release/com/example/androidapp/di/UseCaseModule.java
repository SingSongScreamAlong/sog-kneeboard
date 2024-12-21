package com.example.androidapp.di;

@dagger.Module
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00002\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\b\u00c7\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002J\u0010\u0010\u0003\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\u0004H\u0007J\u0010\u0010\u0006\u001a\u00020\u00072\u0006\u0010\u0005\u001a\u00020\u0007H\u0007J\u0010\u0010\b\u001a\u00020\t2\u0006\u0010\u0005\u001a\u00020\tH\u0007J\u0010\u0010\n\u001a\u00020\u000b2\u0006\u0010\u0005\u001a\u00020\u000bH\u0007J\u0010\u0010\f\u001a\u00020\r2\u0006\u0010\u0005\u001a\u00020\rH\u0007J\u0010\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0005\u001a\u00020\u000fH\u0007\u00a8\u0006\u0010"}, d2 = {"Lcom/example/androidapp/di/UseCaseModule;", "", "()V", "provideGenerateImageUseCase", "Lcom/example/androidapp/domain/usecase/image/GenerateImageUseCase;", "useCase", "provideGenerateStoryUseCase", "Lcom/example/androidapp/domain/usecase/story/GenerateStoryUseCase;", "provideGetImagesUseCase", "Lcom/example/androidapp/domain/usecase/image/GetImagesUseCase;", "provideGetStoriesUseCase", "Lcom/example/androidapp/domain/usecase/story/GetStoriesUseCase;", "provideGetUserSettingsUseCase", "Lcom/example/androidapp/domain/usecase/settings/GetUserSettingsUseCase;", "provideUpdateUserSettingsUseCase", "Lcom/example/androidapp/domain/usecase/settings/UpdateUserSettingsUseCase;", "app_release"})
@dagger.hilt.InstallIn(value = {dagger.hilt.android.components.ViewModelComponent.class})
public final class UseCaseModule {
    @org.jetbrains.annotations.NotNull
    public static final com.example.androidapp.di.UseCaseModule INSTANCE = null;
    
    private UseCaseModule() {
        super();
    }
    
    @dagger.Provides
    @dagger.hilt.android.scopes.ViewModelScoped
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.domain.usecase.story.GenerateStoryUseCase provideGenerateStoryUseCase(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.story.GenerateStoryUseCase useCase) {
        return null;
    }
    
    @dagger.Provides
    @dagger.hilt.android.scopes.ViewModelScoped
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.domain.usecase.story.GetStoriesUseCase provideGetStoriesUseCase(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.story.GetStoriesUseCase useCase) {
        return null;
    }
    
    @dagger.Provides
    @dagger.hilt.android.scopes.ViewModelScoped
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.domain.usecase.image.GenerateImageUseCase provideGenerateImageUseCase(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.image.GenerateImageUseCase useCase) {
        return null;
    }
    
    @dagger.Provides
    @dagger.hilt.android.scopes.ViewModelScoped
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.domain.usecase.image.GetImagesUseCase provideGetImagesUseCase(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.image.GetImagesUseCase useCase) {
        return null;
    }
    
    @dagger.Provides
    @dagger.hilt.android.scopes.ViewModelScoped
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.domain.usecase.settings.GetUserSettingsUseCase provideGetUserSettingsUseCase(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.settings.GetUserSettingsUseCase useCase) {
        return null;
    }
    
    @dagger.Provides
    @dagger.hilt.android.scopes.ViewModelScoped
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.domain.usecase.settings.UpdateUserSettingsUseCase provideUpdateUserSettingsUseCase(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.settings.UpdateUserSettingsUseCase useCase) {
        return null;
    }
}