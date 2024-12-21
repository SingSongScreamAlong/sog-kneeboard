package com.example.androidapp.domain.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\t\n\u0002\b\u0005\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0000\bf\u0018\u00002\u00020\u0001J\u0016\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H\u00a6@\u00a2\u0006\u0002\u0010\u0006J\u001e\u0010\u0007\u001a\u00020\u00052\u0006\u0010\b\u001a\u00020\t2\u0006\u0010\n\u001a\u00020\u000bH\u00a6@\u00a2\u0006\u0002\u0010\fJ\u0018\u0010\r\u001a\u0004\u0018\u00010\u00052\u0006\u0010\u000e\u001a\u00020\u000bH\u00a6@\u00a2\u0006\u0002\u0010\u000fJ\u001c\u0010\u0010\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00050\u00120\u00112\u0006\u0010\n\u001a\u00020\u000bH&\u00a8\u0006\u0013"}, d2 = {"Lcom/example/androidapp/domain/repository/ImageRepository;", "", "deleteImage", "", "image", "Lcom/example/androidapp/domain/model/Image;", "(Lcom/example/androidapp/domain/model/Image;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "generateImage", "prompt", "", "storyId", "", "(Ljava/lang/String;JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getImageById", "id", "(JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getImagesForStory", "Lkotlinx/coroutines/flow/Flow;", "", "app_release"})
public abstract interface ImageRepository {
    
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object generateImage(@org.jetbrains.annotations.NotNull
    java.lang.String prompt, long storyId, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Image> $completion);
    
    @org.jetbrains.annotations.NotNull
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.domain.model.Image>> getImagesForStory(long storyId);
    
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getImageById(long id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Image> $completion);
    
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object deleteImage(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.model.Image image, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
}