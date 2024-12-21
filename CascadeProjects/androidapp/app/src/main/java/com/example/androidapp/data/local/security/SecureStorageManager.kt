package com.example.androidapp.data.local.security

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SecureStorageManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val securePreferences = EncryptedSharedPreferences.create(
        context,
        PREFERENCES_FILE_NAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveApiKey(type: ApiKeyType, key: String) {
        securePreferences.edit()
            .putString(type.key, key)
            .apply()
    }

    fun getApiKey(type: ApiKeyType): String? {
        return securePreferences.getString(type.key, null)
    }

    fun clearApiKey(type: ApiKeyType) {
        securePreferences.edit()
            .remove(type.key)
            .apply()
    }

    fun clearAllApiKeys() {
        securePreferences.edit().clear().apply()
    }

    enum class ApiKeyType(val key: String) {
        MISTRAL("mistral_api_key"),
        OPENAI("openai_api_key")
    }

    companion object {
        private const val PREFERENCES_FILE_NAME = "secure_api_keys"
    }
}
