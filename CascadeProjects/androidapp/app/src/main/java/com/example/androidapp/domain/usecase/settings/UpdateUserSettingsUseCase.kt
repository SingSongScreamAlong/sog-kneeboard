package com.example.androidapp.domain.usecase.settings

import com.example.androidapp.data.local.datastore.UserPreferences
import com.example.androidapp.domain.model.UserSettings
import javax.inject.Inject

class UpdateUserSettingsUseCase @Inject constructor(
    private val userPreferences: UserPreferences
) {
    suspend operator fun invoke(settings: UserSettings) {
        userPreferences.setAgeRange(settings.ageRange)
        userPreferences.setParentalControlEnabled(settings.parentalControlEnabled)
        userPreferences.setOfflineModeEnabled(settings.offlineModeEnabled)
        // TODO: Implement secure API key storage
    }
}
