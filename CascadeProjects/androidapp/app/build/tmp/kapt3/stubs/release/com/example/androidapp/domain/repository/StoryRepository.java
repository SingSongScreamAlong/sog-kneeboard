package com.example.androidapp.domain.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00002\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\t\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\b\u0004\bf\u0018\u00002\u00020\u0001J\u0016\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H\u00a6@\u00a2\u0006\u0002\u0010\u0006J&\u0010\u0007\u001a\u00020\b2\u0006\u0010\t\u001a\u00020\n2\u0006\u0010\u000b\u001a\u00020\n2\u0006\u0010\f\u001a\u00020\nH\u00a6@\u00a2\u0006\u0002\u0010\rJ\u0014\u0010\u000e\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u00100\u000fH&J\u001c\u0010\u0011\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u00100\u000f2\u0006\u0010\f\u001a\u00020\nH&J\u001c\u0010\u0012\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u00100\u000f2\u0006\u0010\u000b\u001a\u00020\nH&J\u0018\u0010\u0013\u001a\u0004\u0018\u00010\b2\u0006\u0010\u0004\u001a\u00020\u0005H\u00a6@\u00a2\u0006\u0002\u0010\u0006\u00a8\u0006\u0014"}, d2 = {"Lcom/example/androidapp/domain/repository/StoryRepository;", "", "deleteStory", "", "id", "", "(JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "generateStory", "Lcom/example/androidapp/domain/model/Story;", "prompt", "", "theme", "ageRange", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getAllStories", "Lkotlinx/coroutines/flow/Flow;", "", "getStoriesByAgeRange", "getStoriesByTheme", "getStoryById", "app_release"})
public abstract interface StoryRepository {
    
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object generateStory(@org.jetbrains.annotations.NotNull
    java.lang.String prompt, @org.jetbrains.annotations.NotNull
    java.lang.String theme, @org.jetbrains.annotations.NotNull
    java.lang.String ageRange, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Story> $completion);
    
    @org.jetbrains.annotations.NotNull
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.domain.model.Story>> getAllStories();
    
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getStoryById(long id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Story> $completion);
    
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object deleteStory(long id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @org.jetbrains.annotations.NotNull
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.domain.model.Story>> getStoriesByTheme(@org.jetbrains.annotations.NotNull
    java.lang.String theme);
    
    @org.jetbrains.annotations.NotNull
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.domain.model.Story>> getStoriesByAgeRange(@org.jetbrains.annotations.NotNull
    java.lang.String ageRange);
}