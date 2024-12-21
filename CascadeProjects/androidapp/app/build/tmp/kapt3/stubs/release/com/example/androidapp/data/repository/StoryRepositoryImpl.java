package com.example.androidapp.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000B\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\b\u0004\n\u0002\u0010\t\n\u0002\b\u0002\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0016\u0010\u0007\u001a\u00020\b2\u0006\u0010\t\u001a\u00020\nH\u0096@\u00a2\u0006\u0002\u0010\u000bJ&\u0010\f\u001a\u00020\n2\u0006\u0010\r\u001a\u00020\u000e2\u0006\u0010\u000f\u001a\u00020\u000e2\u0006\u0010\u0010\u001a\u00020\u000eH\u0096@\u00a2\u0006\u0002\u0010\u0011J\u0014\u0010\u0012\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\n0\u00140\u0013H\u0016J\u001c\u0010\u0015\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\n0\u00140\u00132\u0006\u0010\u0010\u001a\u00020\u000eH\u0016J\u001c\u0010\u0016\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\n0\u00140\u00132\u0006\u0010\u000f\u001a\u00020\u000eH\u0016J\u0018\u0010\u0017\u001a\u0004\u0018\u00010\n2\u0006\u0010\u0018\u001a\u00020\u0019H\u0096@\u00a2\u0006\u0002\u0010\u001aR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u001b"}, d2 = {"Lcom/example/androidapp/data/repository/StoryRepositoryImpl;", "Lcom/example/androidapp/domain/repository/StoryRepository;", "storyDao", "Lcom/example/androidapp/data/local/db/dao/StoryDao;", "storyGenerationService", "Lcom/example/androidapp/data/remote/api/StoryGenerationService;", "(Lcom/example/androidapp/data/local/db/dao/StoryDao;Lcom/example/androidapp/data/remote/api/StoryGenerationService;)V", "deleteStory", "", "story", "Lcom/example/androidapp/domain/model/Story;", "(Lcom/example/androidapp/domain/model/Story;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "generateStory", "prompt", "", "theme", "ageRange", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getStories", "Lkotlinx/coroutines/flow/Flow;", "", "getStoriesByAgeRange", "getStoriesByTheme", "getStoryById", "id", "", "(JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public final class StoryRepositoryImpl implements com.example.androidapp.domain.repository.StoryRepository {
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.data.local.db.dao.StoryDao storyDao = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.data.remote.api.StoryGenerationService storyGenerationService = null;
    
    @javax.inject.Inject
    public StoryRepositoryImpl(@org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.db.dao.StoryDao storyDao, @org.jetbrains.annotations.NotNull
    com.example.androidapp.data.remote.api.StoryGenerationService storyGenerationService) {
        super();
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.Nullable
    public java.lang.Object generateStory(@org.jetbrains.annotations.NotNull
    java.lang.String prompt, @org.jetbrains.annotations.NotNull
    java.lang.String theme, @org.jetbrains.annotations.NotNull
    java.lang.String ageRange, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Story> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.domain.model.Story>> getStories() {
        return null;
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.Nullable
    public java.lang.Object getStoryById(long id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Story> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public java.lang.Object deleteStory(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.model.Story story, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.NotNull
    public kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.domain.model.Story>> getStoriesByTheme(@org.jetbrains.annotations.NotNull
    java.lang.String theme) {
        return null;
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.NotNull
    public kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.domain.model.Story>> getStoriesByAgeRange(@org.jetbrains.annotations.NotNull
    java.lang.String ageRange) {
        return null;
    }
}