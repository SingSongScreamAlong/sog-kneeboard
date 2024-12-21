package com.example.androidapp.data.remote.api.model;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\b\n\u0000\n\u0002\u0010\u0006\n\u0002\b\u0018\n\u0002\u0010\u000b\n\u0002\b\u0004\b\u0086\b\u0018\u00002\u00020\u0001BG\u0012\b\b\u0002\u0010\u0002\u001a\u00020\u0003\u0012\f\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005\u0012\b\b\u0002\u0010\u0007\u001a\u00020\b\u0012\b\b\u0002\u0010\t\u001a\u00020\n\u0012\b\b\u0002\u0010\u000b\u001a\u00020\n\u0012\n\b\u0002\u0010\f\u001a\u0004\u0018\u00010\b\u00a2\u0006\u0002\u0010\rJ\t\u0010\u001a\u001a\u00020\u0003H\u00c6\u0003J\u000f\u0010\u001b\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005H\u00c6\u0003J\t\u0010\u001c\u001a\u00020\bH\u00c6\u0003J\t\u0010\u001d\u001a\u00020\nH\u00c6\u0003J\t\u0010\u001e\u001a\u00020\nH\u00c6\u0003J\u0010\u0010\u001f\u001a\u0004\u0018\u00010\bH\u00c6\u0003\u00a2\u0006\u0002\u0010\u0015JR\u0010 \u001a\u00020\u00002\b\b\u0002\u0010\u0002\u001a\u00020\u00032\u000e\b\u0002\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00060\u00052\b\b\u0002\u0010\u0007\u001a\u00020\b2\b\b\u0002\u0010\t\u001a\u00020\n2\b\b\u0002\u0010\u000b\u001a\u00020\n2\n\b\u0002\u0010\f\u001a\u0004\u0018\u00010\bH\u00c6\u0001\u00a2\u0006\u0002\u0010!J\u0013\u0010\"\u001a\u00020#2\b\u0010$\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010%\u001a\u00020\bH\u00d6\u0001J\t\u0010&\u001a\u00020\u0003H\u00d6\u0001R\u0016\u0010\u0007\u001a\u00020\b8\u0006X\u0087\u0004\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000e\u0010\u000fR\u0017\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\u0011R\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0012\u0010\u0013R\u001a\u0010\f\u001a\u0004\u0018\u00010\b8\u0006X\u0087\u0004\u00a2\u0006\n\n\u0002\u0010\u0016\u001a\u0004\b\u0014\u0010\u0015R\u0011\u0010\t\u001a\u00020\n\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0017\u0010\u0018R\u0016\u0010\u000b\u001a\u00020\n8\u0006X\u0087\u0004\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0019\u0010\u0018\u00a8\u0006\'"}, d2 = {"Lcom/example/androidapp/data/remote/api/model/StoryRequest;", "", "model", "", "messages", "", "Lcom/example/androidapp/data/remote/api/model/Message;", "maxTokens", "", "temperature", "", "topP", "randomSeed", "(Ljava/lang/String;Ljava/util/List;IDDLjava/lang/Integer;)V", "getMaxTokens", "()I", "getMessages", "()Ljava/util/List;", "getModel", "()Ljava/lang/String;", "getRandomSeed", "()Ljava/lang/Integer;", "Ljava/lang/Integer;", "getTemperature", "()D", "getTopP", "component1", "component2", "component3", "component4", "component5", "component6", "copy", "(Ljava/lang/String;Ljava/util/List;IDDLjava/lang/Integer;)Lcom/example/androidapp/data/remote/api/model/StoryRequest;", "equals", "", "other", "hashCode", "toString", "app_release"})
public final class StoryRequest {
    @org.jetbrains.annotations.NotNull
    private final java.lang.String model = null;
    @org.jetbrains.annotations.NotNull
    private final java.util.List<com.example.androidapp.data.remote.api.model.Message> messages = null;
    @com.google.gson.annotations.SerializedName(value = "max_tokens")
    private final int maxTokens = 0;
    private final double temperature = 0.0;
    @com.google.gson.annotations.SerializedName(value = "top_p")
    private final double topP = 0.0;
    @com.google.gson.annotations.SerializedName(value = "random_seed")
    @org.jetbrains.annotations.Nullable
    private final java.lang.Integer randomSeed = null;
    
    public StoryRequest(@org.jetbrains.annotations.NotNull
    java.lang.String model, @org.jetbrains.annotations.NotNull
    java.util.List<com.example.androidapp.data.remote.api.model.Message> messages, int maxTokens, double temperature, double topP, @org.jetbrains.annotations.Nullable
    java.lang.Integer randomSeed) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.lang.String getModel() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.util.List<com.example.androidapp.data.remote.api.model.Message> getMessages() {
        return null;
    }
    
    public final int getMaxTokens() {
        return 0;
    }
    
    public final double getTemperature() {
        return 0.0;
    }
    
    public final double getTopP() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Integer getRandomSeed() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.lang.String component1() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.util.List<com.example.androidapp.data.remote.api.model.Message> component2() {
        return null;
    }
    
    public final int component3() {
        return 0;
    }
    
    public final double component4() {
        return 0.0;
    }
    
    public final double component5() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Integer component6() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.data.remote.api.model.StoryRequest copy(@org.jetbrains.annotations.NotNull
    java.lang.String model, @org.jetbrains.annotations.NotNull
    java.util.List<com.example.androidapp.data.remote.api.model.Message> messages, int maxTokens, double temperature, double topP, @org.jetbrains.annotations.Nullable
    java.lang.Integer randomSeed) {
        return null;
    }
    
    @java.lang.Override
    public boolean equals(@org.jetbrains.annotations.Nullable
    java.lang.Object other) {
        return false;
    }
    
    @java.lang.Override
    public int hashCode() {
        return 0;
    }
    
    @java.lang.Override
    @org.jetbrains.annotations.NotNull
    public java.lang.String toString() {
        return null;
    }
}