package com.example.androidapp.data.local.datastore;

@javax.inject.Singleton
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00002\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0002\b\u0003\n\u0002\u0010\u000b\n\u0002\b\u0004\n\u0002\u0010\u0002\n\u0002\b\b\b\u0007\u0018\u00002\u00020\u0001:\u0001\u0018B\u0015\b\u0007\u0012\f\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u00a2\u0006\u0002\u0010\u0005J\u0016\u0010\u0010\u001a\u00020\u00112\u0006\u0010\u0012\u001a\u00020\bH\u0086@\u00a2\u0006\u0002\u0010\u0013J\u0016\u0010\u0014\u001a\u00020\u00112\u0006\u0010\u0015\u001a\u00020\fH\u0086@\u00a2\u0006\u0002\u0010\u0016J\u0016\u0010\u0017\u001a\u00020\u00112\u0006\u0010\u0015\u001a\u00020\fH\u0086@\u00a2\u0006\u0002\u0010\u0016R\u0017\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\b0\u00078F\u00a2\u0006\u0006\u001a\u0004\b\t\u0010\nR\u0014\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\f0\u00078F\u00a2\u0006\u0006\u001a\u0004\b\r\u0010\nR\u0017\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\f0\u00078F\u00a2\u0006\u0006\u001a\u0004\b\u000f\u0010\n\u00a8\u0006\u0019"}, d2 = {"Lcom/example/androidapp/data/local/datastore/UserPreferences;", "", "dataStore", "Landroidx/datastore/core/DataStore;", "Landroidx/datastore/preferences/core/Preferences;", "(Landroidx/datastore/core/DataStore;)V", "ageRange", "Lkotlinx/coroutines/flow/Flow;", "", "getAgeRange", "()Lkotlinx/coroutines/flow/Flow;", "offlineModeEnabled", "", "getOfflineModeEnabled", "parentalControlEnabled", "getParentalControlEnabled", "setAgeRange", "", "range", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "setOfflineModeEnabled", "enabled", "(ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "setParentalControlEnabled", "PreferencesKeys", "app_debug"})
public final class UserPreferences {
    @org.jetbrains.annotations.NotNull
    private final androidx.datastore.core.DataStore<androidx.datastore.preferences.core.Preferences> dataStore = null;
    
    @javax.inject.Inject
    public UserPreferences(@org.jetbrains.annotations.NotNull
    androidx.datastore.core.DataStore<androidx.datastore.preferences.core.Preferences> dataStore) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull
    public final kotlinx.coroutines.flow.Flow<java.lang.String> getAgeRange() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final kotlinx.coroutines.flow.Flow<java.lang.Boolean> getParentalControlEnabled() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull
    public final kotlinx.coroutines.flow.Flow<java.lang.Boolean> getOfflineModeEnabled() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Object setAgeRange(@org.jetbrains.annotations.NotNull
    java.lang.String range, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Object setParentalControlEnabled(boolean enabled, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.Object setOfflineModeEnabled(boolean enabled, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000 \n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0002\b\u0003\n\u0002\u0010\u000b\n\u0002\b\u0004\b\u00c2\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002R\u0017\u0010\u0003\u001a\b\u0012\u0004\u0012\u00020\u00050\u0004\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0006\u0010\u0007R\u0017\u0010\b\u001a\b\u0012\u0004\u0012\u00020\t0\u0004\u00a2\u0006\b\n\u0000\u001a\u0004\b\n\u0010\u0007R\u0017\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\t0\u0004\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\u0007\u00a8\u0006\r"}, d2 = {"Lcom/example/androidapp/data/local/datastore/UserPreferences$PreferencesKeys;", "", "()V", "AGE_RANGE", "Landroidx/datastore/preferences/core/Preferences$Key;", "", "getAGE_RANGE", "()Landroidx/datastore/preferences/core/Preferences$Key;", "OFFLINE_MODE_ENABLED", "", "getOFFLINE_MODE_ENABLED", "PARENTAL_CONTROL_ENABLED", "getPARENTAL_CONTROL_ENABLED", "app_debug"})
    static final class PreferencesKeys {
        @org.jetbrains.annotations.NotNull
        private static final androidx.datastore.preferences.core.Preferences.Key<java.lang.String> AGE_RANGE = null;
        @org.jetbrains.annotations.NotNull
        private static final androidx.datastore.preferences.core.Preferences.Key<java.lang.Boolean> PARENTAL_CONTROL_ENABLED = null;
        @org.jetbrains.annotations.NotNull
        private static final androidx.datastore.preferences.core.Preferences.Key<java.lang.Boolean> OFFLINE_MODE_ENABLED = null;
        @org.jetbrains.annotations.NotNull
        public static final com.example.androidapp.data.local.datastore.UserPreferences.PreferencesKeys INSTANCE = null;
        
        private PreferencesKeys() {
            super();
        }
        
        @org.jetbrains.annotations.NotNull
        public final androidx.datastore.preferences.core.Preferences.Key<java.lang.String> getAGE_RANGE() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull
        public final androidx.datastore.preferences.core.Preferences.Key<java.lang.Boolean> getPARENTAL_CONTROL_ENABLED() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull
        public final androidx.datastore.preferences.core.Preferences.Key<java.lang.Boolean> getOFFLINE_MODE_ENABLED() {
            return null;
        }
    }
}