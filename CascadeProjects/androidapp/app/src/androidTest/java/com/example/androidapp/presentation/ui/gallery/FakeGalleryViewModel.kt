package com.example.androidapp.presentation.ui.gallery

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class FakeGalleryViewModel(initialState: GalleryUiState) : ViewModel() {
    private val _uiState = MutableStateFlow(initialState)
    val uiState: StateFlow<GalleryUiState> = _uiState.asStateFlow()

    fun loadImages(storyId: Long) {
        // Implement fake image loading if needed for tests
    }

    fun generateImage(prompt: String, storyId: Long) {
        // Implement fake image generation if needed for tests
    }
}
