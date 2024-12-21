package com.example.androidapp.domain.usecase.story;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000H\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0006\n\u0002\u0010\u0002\n\u0002\b\u0002\n\u0002\u0010\t\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\u0018\u00002\u00020\u0001B\'\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u0012\u0006\u0010\b\u001a\u00020\t\u00a2\u0006\u0002\u0010\nJ \u0010\f\u001a\u00020\r2\u0006\u0010\u000e\u001a\u00020\r2\u0006\u0010\u000f\u001a\u00020\r2\u0006\u0010\u0010\u001a\u00020\rH\u0002J\u0010\u0010\u0011\u001a\u00020\r2\u0006\u0010\u0012\u001a\u00020\rH\u0002J\u001e\u0010\u0013\u001a\u00020\u00142\u0006\u0010\u0015\u001a\u00020\u00032\u0006\u0010\u0016\u001a\u00020\u0017H\u0082@\u00a2\u0006\u0002\u0010\u0018J&\u0010\u0019\u001a\u00020\u001a2\u0006\u0010\u000e\u001a\u00020\r2\u0006\u0010\u000f\u001a\u00020\r2\u0006\u0010\u0010\u001a\u00020\rH\u0082@\u00a2\u0006\u0002\u0010\u001bJ&\u0010\u001c\u001a\u00020\u001a2\u0006\u0010\u000e\u001a\u00020\r2\u0006\u0010\u000f\u001a\u00020\r2\u0006\u0010\u0010\u001a\u00020\rH\u0082@\u00a2\u0006\u0002\u0010\u001bJ,\u0010\u001d\u001a\b\u0012\u0004\u0012\u00020\u001a0\u001e2\u0006\u0010\u000e\u001a\u00020\r2\u0006\u0010\u000f\u001a\u00020\rH\u0086B\u00f8\u0001\u0000\u00f8\u0001\u0001\u00a2\u0006\u0004\b\u001f\u0010 R\u000e\u0010\b\u001a\u00020\tX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0010\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0004\n\u0002\u0010\u000bR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u0082\u0002\u000b\n\u0002\b!\n\u0005\b\u00a1\u001e0\u0001\u00a8\u0006!"}, d2 = {"Lcom/example/androidapp/domain/usecase/story/GenerateStoryUseCase;", "", "storyRepository", "error/NonExistentClass", "userPreferences", "Lcom/example/androidapp/data/local/datastore/UserPreferences;", "mistralModelManager", "Lcom/example/androidapp/data/local/ml/MistralModelManager;", "generateImageUseCase", "Lcom/example/androidapp/domain/usecase/image/GenerateImageUseCase;", "(Lerror/NonExistentClass;Lcom/example/androidapp/data/local/datastore/UserPreferences;Lcom/example/androidapp/data/local/ml/MistralModelManager;Lcom/example/androidapp/domain/usecase/image/GenerateImageUseCase;)V", "Lerror/NonExistentClass;", "buildPrompt", "", "prompt", "theme", "ageRange", "extractTitle", "content", "generateImagesForStory", "", "template", "storyId", "", "(Lerror/NonExistentClass;JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "generateOfflineStory", "Lcom/example/androidapp/domain/model/Story;", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "generateOnlineStory", "invoke", "Lkotlin/Result;", "invoke-0E7RQCE", "(Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public final class GenerateStoryUseCase {
    @org.jetbrains.annotations.NotNull
    private final error.NonExistentClass storyRepository = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.data.local.datastore.UserPreferences userPreferences = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.data.local.ml.MistralModelManager mistralModelManager = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.domain.usecase.image.GenerateImageUseCase generateImageUseCase = null;
    
    @javax.inject.Inject
    public GenerateStoryUseCase(@org.jetbrains.annotations.NotNull
    error.NonExistentClass storyRepository, @org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.datastore.UserPreferences userPreferences, @org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.ml.MistralModelManager mistralModelManager, @org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.image.GenerateImageUseCase generateImageUseCase) {
        super();
    }
    
    private final java.lang.Object generateOfflineStory(java.lang.String prompt, java.lang.String theme, java.lang.String ageRange, kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Story> $completion) {
        return null;
    }
    
    private final java.lang.Object generateOnlineStory(java.lang.String prompt, java.lang.String theme, java.lang.String ageRange, kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Story> $completion) {
        return null;
    }
    
    private final java.lang.Object generateImagesForStory(error.NonExistentClass template, long storyId, kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    private final java.lang.String buildPrompt(java.lang.String prompt, java.lang.String theme, java.lang.String ageRange) {
        return null;
    }
    
    private final java.lang.String extractTitle(java.lang.String content) {
        return null;
    }
}