package com.example.androidapp.domain.usecase.settings

import com.example.androidapp.data.local.datastore.UserPreferences
import com.example.androidapp.domain.model.ApiKeys
import com.example.androidapp.domain.model.UserSettings
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import javax.inject.Inject

class GetUserSettingsUseCase @Inject constructor(
    private val userPreferences: UserPreferences
) {
    operator fun invoke(): Flow<UserSettings> = combine(
        userPreferences.ageRange,
        userPreferences.parentalControlEnabled,
        userPreferences.offlineModeEnabled
    ) { ageRange, parentalControl, offlineMode ->
        UserSettings(
            ageRange = ageRange,
            parentalControlEnabled = parentalControl,
            offlineModeEnabled = offlineMode,
            apiKeys = ApiKeys(
                openAiKey = null, // TODO: Implement secure key storage
                mistralKey = null
            )
        )
    }
}
