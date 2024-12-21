package com.example.androidapp.presentation.ui.reader

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class FakeReaderViewModel(initialState: ReaderUiState) : ViewModel() {
    private val _uiState = MutableStateFlow(initialState)
    val uiState: StateFlow<ReaderUiState> = _uiState.asStateFlow()

    fun loadStory(storyId: Long) {
        // Implement fake story loading if needed for tests
    }
}
