package com.example.androidapp.data.local.security;

@javax.inject.Singleton
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00004\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0005\b\u0007\u0018\u0000 \u00132\u00020\u0001:\u0002\u0012\u0013B\u0011\b\u0007\u0012\b\b\u0001\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u0006\u0010\t\u001a\u00020\nJ\u000e\u0010\u000b\u001a\u00020\n2\u0006\u0010\f\u001a\u00020\rJ\u0010\u0010\u000e\u001a\u0004\u0018\u00010\u000f2\u0006\u0010\f\u001a\u00020\rJ\u0016\u0010\u0010\u001a\u00020\n2\u0006\u0010\f\u001a\u00020\r2\u0006\u0010\u0011\u001a\u00020\u000fR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0005\u001a\u00020\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0014"}, d2 = {"Lcom/example/androidapp/data/local/security/SecureStorageManager;", "", "context", "Landroid/content/Context;", "(Landroid/content/Context;)V", "masterKey", "Landroidx/security/crypto/MasterKey;", "securePreferences", "Landroid/content/SharedPreferences;", "clearAllApiKeys", "", "clearApiKey", "type", "Lcom/example/androidapp/data/local/security/SecureStorageManager$ApiKeyType;", "getApiKey", "", "saveApiKey", "key", "ApiKeyType", "Companion", "app_debug"})
public final class SecureStorageManager {
    @org.jetbrains.annotations.NotNull
    private final android.content.Context context = null;
    @org.jetbrains.annotations.NotNull
    private final androidx.security.crypto.MasterKey masterKey = null;
    @org.jetbrains.annotations.NotNull
    private final android.content.SharedPreferences securePreferences = null;
    @org.jetbrains.annotations.NotNull
    private static final java.lang.String PREFERENCES_FILE_NAME = "secure_api_keys";
    @org.jetbrains.annotations.NotNull
    public static final com.example.androidapp.data.local.security.SecureStorageManager.Companion Companion = null;
    
    @javax.inject.Inject
    public SecureStorageManager(@dagger.hilt.android.qualifiers.ApplicationContext
    @org.jetbrains.annotations.NotNull
    android.content.Context context) {
        super();
    }
    
    public final void saveApiKey(@org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.security.SecureStorageManager.ApiKeyType type, @org.jetbrains.annotations.NotNull
    java.lang.String key) {
    }
    
    @org.jetbrains.annotations.Nullable
    public final java.lang.String getApiKey(@org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.security.SecureStorageManager.ApiKeyType type) {
        return null;
    }
    
    public final void clearApiKey(@org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.security.SecureStorageManager.ApiKeyType type) {
    }
    
    public final void clearAllApiKeys() {
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0012\n\u0002\u0018\u0002\n\u0002\u0010\u0010\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0006\b\u0086\u0081\u0002\u0018\u00002\b\u0012\u0004\u0012\u00020\u00000\u0001B\u000f\b\u0002\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004R\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0005\u0010\u0006j\u0002\b\u0007j\u0002\b\b\u00a8\u0006\t"}, d2 = {"Lcom/example/androidapp/data/local/security/SecureStorageManager$ApiKeyType;", "", "key", "", "(Ljava/lang/String;ILjava/lang/String;)V", "getKey", "()Ljava/lang/String;", "MISTRAL", "OPENAI", "app_debug"})
    public static enum ApiKeyType {
        /*public static final*/ MISTRAL /* = new MISTRAL(null) */,
        /*public static final*/ OPENAI /* = new OPENAI(null) */;
        @org.jetbrains.annotations.NotNull
        private final java.lang.String key = null;
        
        ApiKeyType(java.lang.String key) {
        }
        
        @org.jetbrains.annotations.NotNull
        public final java.lang.String getKey() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull
        public static kotlin.enums.EnumEntries<com.example.androidapp.data.local.security.SecureStorageManager.ApiKeyType> getEntries() {
            return null;
        }
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0012\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0000\b\u0086\u0003\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002R\u000e\u0010\u0003\u001a\u00020\u0004X\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0005"}, d2 = {"Lcom/example/androidapp/data/local/security/SecureStorageManager$Companion;", "", "()V", "PREFERENCES_FILE_NAME", "", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
    }
}