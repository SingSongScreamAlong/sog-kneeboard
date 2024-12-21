package com.example.androidapp.data.remote.api;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u001e\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\bf\u0018\u00002\u00020\u0001J\"\u0010\u0002\u001a\u00020\u00032\b\b\u0001\u0010\u0004\u001a\u00020\u00052\b\b\u0001\u0010\u0006\u001a\u00020\u0007H\u00a7@\u00a2\u0006\u0002\u0010\b\u00a8\u0006\t"}, d2 = {"Lcom/example/androidapp/data/remote/api/ImageGenerationService;", "", "generateImage", "Lcom/example/androidapp/data/remote/api/ImageGenerationResponse;", "apiKey", "", "request", "Lcom/example/androidapp/data/remote/api/ImageGenerationRequest;", "(Ljava/lang/String;Lcom/example/androidapp/data/remote/api/ImageGenerationRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
public abstract interface ImageGenerationService {
    
    @retrofit2.http.POST(value = "v1/images/generations")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object generateImage(@retrofit2.http.Header(value = "Authorization")
    @org.jetbrains.annotations.NotNull
    java.lang.String apiKey, @retrofit2.http.Body
    @org.jetbrains.annotations.NotNull
    com.example.androidapp.data.remote.api.ImageGenerationRequest request, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.data.remote.api.ImageGenerationResponse> $completion);
}