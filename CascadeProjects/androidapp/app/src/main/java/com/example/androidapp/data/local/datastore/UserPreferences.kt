package com.example.androidapp.data.local.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

@Singleton
class UserPreferences @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    val ageRange: Flow<String>
        get() = dataStore.data.map { preferences ->
            preferences[PreferencesKeys.AGE_RANGE] ?: "4-8"
        }

    val parentalControlEnabled: Flow<Boolean>
        get() = dataStore.data.map { preferences ->
            preferences[PreferencesKeys.PARENTAL_CONTROL_ENABLED] ?: true
        }

    val offlineModeEnabled: Flow<Boolean>
        get() = dataStore.data.map { preferences ->
            preferences[PreferencesKeys.OFFLINE_MODE_ENABLED] ?: false
        }

    suspend fun setAgeRange(range: String) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.AGE_RANGE] = range
        }
    }

    suspend fun setParentalControlEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.PARENTAL_CONTROL_ENABLED] = enabled
        }
    }

    suspend fun setOfflineModeEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.OFFLINE_MODE_ENABLED] = enabled
        }
    }

    private object PreferencesKeys {
        val AGE_RANGE = stringPreferencesKey("age_range")
        val PARENTAL_CONTROL_ENABLED = booleanPreferencesKey("parental_control_enabled")
        val OFFLINE_MODE_ENABLED = booleanPreferencesKey("offline_mode_enabled")
    }
}
