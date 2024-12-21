package com.example.androidapp.presentation.ui.settings

import androidx.lifecycle.ViewModel
import com.example.androidapp.domain.model.UserSettings
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class FakeSettingsViewModel(initialState: SettingsUiState) : ViewModel() {
    private val _uiState = MutableStateFlow(initialState)
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    fun updateSettings(settings: UserSettings) {
        // Implement fake settings update if needed for tests
    }
}
