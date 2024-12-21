package com.example.androidapp.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000>\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\t\n\u0002\b\u0005\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0000\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0016\u0010\u0007\u001a\u00020\b2\u0006\u0010\t\u001a\u00020\nH\u0096@\u00a2\u0006\u0002\u0010\u000bJ\u001e\u0010\f\u001a\u00020\n2\u0006\u0010\r\u001a\u00020\u000e2\u0006\u0010\u000f\u001a\u00020\u0010H\u0096@\u00a2\u0006\u0002\u0010\u0011J\u0018\u0010\u0012\u001a\u0004\u0018\u00010\n2\u0006\u0010\u0013\u001a\u00020\u0010H\u0096@\u00a2\u0006\u0002\u0010\u0014J\u001c\u0010\u0015\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\n0\u00170\u00162\u0006\u0010\u000f\u001a\u00020\u0010H\u0016R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0018"}, d2 = {"Lcom/example/androidapp/data/repository/ImageRepositoryImpl;", "Lcom/example/androidapp/domain/repository/ImageRepository;", "imageDao", "Lcom/example/androidapp/data/local/db/dao/ImageDao;", "imageGenerationService", "Lcom/example/androidapp/data/remote/api/ImageGenerationService;", "(Lcom/example/androidapp/data/local/db/dao/ImageDao;Lcom/example/androidapp/data/remote/api/ImageGenerationService;)V", "deleteImage", "", "image", "Lcom/example/androidapp/domain/model/Image;", "(Lcom/example/androidapp/domain/model/Image;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "generateImage", "prompt", "", "storyId", "", "(Ljava/lang/String;JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getImageById", "id", "(JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getImagesForStory", "Lkotlinx/coroutines/flow/Flow;", "", "app_release"})
public final class ImageRepositoryImpl implements com.example.androidapp.domain.repository.ImageRepository {
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.data.local.db.dao.ImageDao imageDao = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.data.remote.api.ImageGenerationService imageGenerationService = null;
    
    @javax.inject.Inject
    public ImageRepositoryImpl(@org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.db.dao.ImageDao imageDao, @org.jetbrains.annotations.NotNull
    com.example.androidapp.data.remote.api.ImageGenerationService imageGenerationService) {
        super();
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.Nullable
    public java.lang.Object generateImage(@org.jetbrains.annotations.NotNull
    java.lang.String prompt, long storyId, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Image> $completion) {
        return null;
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.NotNull
    public kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.domain.model.Image>> getImagesForStory(long storyId) {
        return null;
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.Nullable
    public java.lang.Object getImageById(long id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.domain.model.Image> $completion) {
        return null;
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.Nullable
    public java.lang.Object deleteImage(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.model.Image image, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
}