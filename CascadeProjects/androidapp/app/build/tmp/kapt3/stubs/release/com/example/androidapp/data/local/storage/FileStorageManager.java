package com.example.androidapp.data.local.storage;

@javax.inject.Singleton
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000:\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\t\n\u0002\u0010\u0002\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0012\n\u0002\b\u0004\b\u0007\u0018\u00002\u00020\u0001B\u0011\b\u0007\u0012\b\b\u0001\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u0010\u0010\u000f\u001a\u0004\u0018\u00010\u0010H\u0086@\u00a2\u0006\u0002\u0010\u0011J\u0016\u0010\u0012\u001a\u00020\u00102\u0006\u0010\u0013\u001a\u00020\u0014H\u0086@\u00a2\u0006\u0002\u0010\u0015J\u000e\u0010\u0016\u001a\u00020\u00142\u0006\u0010\u0013\u001a\u00020\u0014J\u000e\u0010\u0017\u001a\u00020\u00142\u0006\u0010\u0013\u001a\u00020\u0014J\u0018\u0010\u0018\u001a\u0004\u0018\u00010\u00192\u0006\u0010\u0013\u001a\u00020\u0014H\u0086@\u00a2\u0006\u0002\u0010\u0015J\u001e\u0010\u001a\u001a\u00020\u00142\u0006\u0010\u001b\u001a\u00020\u001c2\u0006\u0010\u0013\u001a\u00020\u0014H\u0086@\u00a2\u0006\u0002\u0010\u001dJ\u001e\u0010\u001e\u001a\u00020\u00142\u0006\u0010\u001f\u001a\u00020\u001c2\u0006\u0010\u0013\u001a\u00020\u0014H\u0086@\u00a2\u0006\u0002\u0010\u001dR\u0014\u0010\u0005\u001a\u00020\u00068BX\u0082\u0004\u00a2\u0006\u0006\u001a\u0004\b\u0007\u0010\bR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0014\u0010\t\u001a\u00020\u00068BX\u0082\u0004\u00a2\u0006\u0006\u001a\u0004\b\n\u0010\bR\u0014\u0010\u000b\u001a\u00020\u00068BX\u0082\u0004\u00a2\u0006\u0006\u001a\u0004\b\f\u0010\bR\u0014\u0010\r\u001a\u00020\u00068BX\u0082\u0004\u00a2\u0006\u0006\u001a\u0004\b\u000e\u0010\b\u00a8\u0006 "}, d2 = {"Lcom/example/androidapp/data/local/storage/FileStorageManager;", "", "context", "Landroid/content/Context;", "(Landroid/content/Context;)V", "baseDir", "Ljava/io/File;", "getBaseDir", "()Ljava/io/File;", "imageDir", "getImageDir", "modelDir", "getModelDir", "tempDir", "getTempDir", "clearTempFiles", "", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "deleteImage", "fileName", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getImagePath", "getModelPath", "loadImage", "Landroid/graphics/Bitmap;", "saveImage", "imageBytes", "", "([BLjava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "saveModel", "modelBytes", "app_release"})
public final class FileStorageManager {
    @org.jetbrains.annotations.NotNull
    private final android.content.Context context = null;
    
    @javax.inject.Inject
    public FileStorageManager(@dagger.hilt.android.qualifiers.ApplicationContext
    @org.jetbrains.annotations.NotNull
    android.content.Context context) {
        super();
    }
    
    private final java.io.File getBaseDir() {
        return null;
    }
    
    private final java.io.File getImageDir() {
        return null;
    }
    
    private final java.io.File getModelDir() {
        return null;
    }
    
    private final java.io.File getTempDir() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Object saveImage(@org.jetbrains.annotations.NotNull
    byte[] imageBytes, @org.jetbrains.annotations.NotNull
    java.lang.String fileName, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super java.lang.String> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Object loadImage(@org.jetbrains.annotations.NotNull
    java.lang.String fileName, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super android.graphics.Bitmap> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Object saveModel(@org.jetbrains.annotations.NotNull
    byte[] modelBytes, @org.jetbrains.annotations.NotNull
    java.lang.String fileName, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super java.lang.String> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Object deleteImage(@org.jetbrains.annotations.NotNull
    java.lang.String fileName, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Object clearTempFiles(@org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.lang.String getImagePath(@org.jetbrains.annotations.NotNull
    java.lang.String fileName) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.lang.String getModelPath(@org.jetbrains.annotations.NotNull
    java.lang.String fileName) {
        return null;
    }
}