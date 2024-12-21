package com.example.androidapp.data.local.ml;

@javax.inject.Singleton
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000@\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0010$\n\u0002\u0010\b\n\u0000\n\u0002\u0010\u0002\n\u0002\b\u0002\n\u0002\u0010\u0015\n\u0002\b\f\b\u0007\u0018\u0000 \u001e2\u00020\u0001:\u0001\u001eB\u0019\b\u0007\u0012\b\b\u0001\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0006\u0010\u000f\u001a\u00020\u0010J\u0010\u0010\u0011\u001a\u00020\n2\u0006\u0010\u0012\u001a\u00020\u0013H\u0002J\u0018\u0010\u0014\u001a\u00020\u00132\u0006\u0010\u0015\u001a\u00020\u00132\u0006\u0010\u0016\u001a\u00020\u000eH\u0002J\u0018\u0010\u0017\u001a\u00020\n2\u0006\u0010\u0018\u001a\u00020\n2\b\b\u0002\u0010\u0016\u001a\u00020\u000eJ\b\u0010\u0019\u001a\u00020\u0010H\u0002J\b\u0010\u001a\u001a\u00020\u0010H\u0002J\u0010\u0010\u001b\u001a\u00020\u000e2\u0006\u0010\u0015\u001a\u00020\u0013H\u0002J\u0010\u0010\u001c\u001a\u00020\u00132\u0006\u0010\u001d\u001a\u00020\nH\u0002R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0010\u0010\u0007\u001a\u0004\u0018\u00010\bX\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u000e\u0010\t\u001a\u00020\nX\u0082D\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000b\u001a\u00020\nX\u0082D\u00a2\u0006\u0002\n\u0000R\u001a\u0010\f\u001a\u000e\u0012\u0004\u0012\u00020\n\u0012\u0004\u0012\u00020\u000e0\rX\u0082\u000e\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u001f"}, d2 = {"Lcom/example/androidapp/data/local/ml/MistralModelManager;", "", "context", "Landroid/content/Context;", "fileStorageManager", "Lcom/example/androidapp/data/local/storage/FileStorageManager;", "(Landroid/content/Context;Lcom/example/androidapp/data/local/storage/FileStorageManager;)V", "interpreter", "Lorg/tensorflow/lite/Interpreter;", "modelName", "", "vocabFile", "vocabulary", "", "", "close", "", "detokenize", "ids", "", "generateSequence", "inputIds", "maxLength", "generateStory", "prompt", "loadModel", "loadVocabulary", "predict", "tokenize", "text", "Companion", "app_debug"})
public final class MistralModelManager {
    @org.jetbrains.annotations.NotNull
    private final android.content.Context context = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.data.local.storage.FileStorageManager fileStorageManager = null;
    @org.jetbrains.annotations.Nullable
    private org.tensorflow.lite.Interpreter interpreter;
    @org.jetbrains.annotations.NotNull
    private final java.lang.String modelName = "mistral_7b_quantized.tflite";
    @org.jetbrains.annotations.NotNull
    private final java.lang.String vocabFile = "mistral_vocab.txt";
    @org.jetbrains.annotations.NotNull
    private java.util.Map<java.lang.String, java.lang.Integer> vocabulary;
    private static final int EOS_TOKEN = 2;
    @org.jetbrains.annotations.NotNull
    public static final com.example.androidapp.data.local.ml.MistralModelManager.Companion Companion = null;
    
    @javax.inject.Inject
    public MistralModelManager(@dagger.hilt.android.qualifiers.ApplicationContext
    @org.jetbrains.annotations.NotNull
    android.content.Context context, @org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.storage.FileStorageManager fileStorageManager) {
        super();
    }
    
    private final void loadModel() {
    }
    
    private final void loadVocabulary() {
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.lang.String generateStory(@org.jetbrains.annotations.NotNull
    java.lang.String prompt, int maxLength) {
        return null;
    }
    
    private final int[] tokenize(java.lang.String text) {
        return null;
    }
    
    private final int[] generateSequence(int[] inputIds, int maxLength) {
        return null;
    }
    
    private final int predict(int[] inputIds) {
        return 0;
    }
    
    private final java.lang.String detokenize(int[] ids) {
        return null;
    }
    
    public final void close() {
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0012\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\b\n\u0000\b\u0086\u0003\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002R\u000e\u0010\u0003\u001a\u00020\u0004X\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0005"}, d2 = {"Lcom/example/androidapp/data/local/ml/MistralModelManager$Companion;", "", "()V", "EOS_TOKEN", "", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
    }
}