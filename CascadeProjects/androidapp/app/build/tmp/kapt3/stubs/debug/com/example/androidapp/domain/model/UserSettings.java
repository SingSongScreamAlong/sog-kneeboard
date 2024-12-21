package com.example.androidapp.domain.model;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000(\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0010\n\u0002\u0010\b\n\u0002\b\u0002\b\u0086\b\u0018\u00002\u00020\u0001B/\u0012\b\b\u0002\u0010\u0002\u001a\u00020\u0003\u0012\b\b\u0002\u0010\u0004\u001a\u00020\u0003\u0012\b\b\u0002\u0010\u0005\u001a\u00020\u0006\u0012\n\b\u0002\u0010\u0007\u001a\u0004\u0018\u00010\b\u00a2\u0006\u0002\u0010\tJ\t\u0010\u0011\u001a\u00020\u0003H\u00c6\u0003J\t\u0010\u0012\u001a\u00020\u0003H\u00c6\u0003J\t\u0010\u0013\u001a\u00020\u0006H\u00c6\u0003J\u000b\u0010\u0014\u001a\u0004\u0018\u00010\bH\u00c6\u0003J3\u0010\u0015\u001a\u00020\u00002\b\b\u0002\u0010\u0002\u001a\u00020\u00032\b\b\u0002\u0010\u0004\u001a\u00020\u00032\b\b\u0002\u0010\u0005\u001a\u00020\u00062\n\b\u0002\u0010\u0007\u001a\u0004\u0018\u00010\bH\u00c6\u0001J\u0013\u0010\u0016\u001a\u00020\u00032\b\u0010\u0017\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010\u0018\u001a\u00020\u0019H\u00d6\u0001J\t\u0010\u001a\u001a\u00020\u0006H\u00d6\u0001R\u0011\u0010\u0005\u001a\u00020\u0006\u00a2\u0006\b\n\u0000\u001a\u0004\b\n\u0010\u000bR\u0013\u0010\u0007\u001a\u0004\u0018\u00010\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\rR\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000e\u0010\u000fR\u0011\u0010\u0004\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\u000f\u00a8\u0006\u001b"}, d2 = {"Lcom/example/androidapp/domain/model/UserSettings;", "", "offlineModeEnabled", "", "parentalControlEnabled", "ageRange", "", "apiKeys", "Lcom/example/androidapp/domain/model/ApiKeys;", "(ZZLjava/lang/String;Lcom/example/androidapp/domain/model/ApiKeys;)V", "getAgeRange", "()Ljava/lang/String;", "getApiKeys", "()Lcom/example/androidapp/domain/model/ApiKeys;", "getOfflineModeEnabled", "()Z", "getParentalControlEnabled", "component1", "component2", "component3", "component4", "copy", "equals", "other", "hashCode", "", "toString", "app_debug"})
public final class UserSettings {
    private final boolean offlineModeEnabled = false;
    private final boolean parentalControlEnabled = false;
    @org.jetbrains.annotations.NotNull
    private final java.lang.String ageRange = null;
    @org.jetbrains.annotations.Nullable
    private final com.example.androidapp.domain.model.ApiKeys apiKeys = null;
    
    public UserSettings(boolean offlineModeEnabled, boolean parentalControlEnabled, @org.jetbrains.annotations.NotNull
    java.lang.String ageRange, @org.jetbrains.annotations.Nullable
    com.example.androidapp.domain.model.ApiKeys apiKeys) {
        super();
    }
    
    public final boolean getOfflineModeEnabled() {
        return false;
    }
    
    public final boolean getParentalControlEnabled() {
        return false;
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.lang.String getAgeRange() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final com.example.androidapp.domain.model.ApiKeys getApiKeys() {
        return null;
    }
    
    public UserSettings() {
        super();
    }
    
    public final boolean component1() {
        return false;
    }
    
    public final boolean component2() {
        return false;
    }
    
    @org.jetbrains.annotations.NotNull
    public final java.lang.String component3() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final com.example.androidapp.domain.model.ApiKeys component4() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final com.example.androidapp.domain.model.UserSettings copy(boolean offlineModeEnabled, boolean parentalControlEnabled, @org.jetbrains.annotations.NotNull
    java.lang.String ageRange, @org.jetbrains.annotations.Nullable
    com.example.androidapp.domain.model.ApiKeys apiKeys) {
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