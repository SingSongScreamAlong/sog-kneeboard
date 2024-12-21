package com.example.androidapp.presentation.ui.home

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class FakeHomeViewModel(initialState: HomeUiState) : ViewModel() {
    private val _uiState = MutableStateFlow(initialState)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun generateStory(prompt: String, theme: String) {
        // Implement fake story generation if needed for tests
    }
}
