package com.example.androidapp.di;

@dagger.Module
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0014\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\b\u00c7\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002J\u0010\u0010\u0003\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\u0004H\u0007\u00a8\u0006\u0006"}, d2 = {"Lcom/example/androidapp/di/MLModule;", "", "()V", "provideMistralModelManager", "Lcom/example/androidapp/data/local/ml/MistralModelManager;", "mistralModelManager", "app_debug"})
@dagger.hilt.InstallIn(value = {dagger.hilt.components.SingletonComponent.class})
public final class MLModule {
    @org.jetbrains.annotations.NotNull
    public static final com.example.androidapp.di.MLModule INSTANCE = null;
    
    private MLModule() {
        super();
    }
    
    @dagger.Provides
    @javax.inject.Singleton
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.data.local.ml.MistralModelManager provideMistralModelManager(@org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.ml.MistralModelManager mistralModelManager) {
        return null;
    }
}