package com.example.androidapp.presentation.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.androidapp.domain.model.UserSettings
import com.example.androidapp.domain.usecase.settings.GetUserSettingsUseCase
import com.example.androidapp.domain.usecase.settings.UpdateUserSettingsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val getUserSettingsUseCase: GetUserSettingsUseCase,
    private val updateUserSettingsUseCase: UpdateUserSettingsUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<SettingsUiState>(SettingsUiState.Loading)
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        loadSettings()
    }

    private fun loadSettings() {
        viewModelScope.launch {
            getUserSettingsUseCase()
                .catch { error ->
                    _uiState.value = SettingsUiState.Error(error.message ?: "Failed to load settings")
                }
                .collect { settings ->
                    _uiState.value = SettingsUiState.Success(settings)
                }
        }
    }

    fun updateSettings(settings: UserSettings) {
        viewModelScope.launch {
            try {
                updateUserSettingsUseCase(settings)
                loadSettings()
            } catch (e: Exception) {
                _uiState.value = SettingsUiState.Error(e.message ?: "Failed to update settings")
            }
        }
    }
}

sealed class SettingsUiState {
    object Loading : SettingsUiState()
    data class Success(val settings: UserSettings) : SettingsUiState()
    data class Error(val message: String) : SettingsUiState()
}
