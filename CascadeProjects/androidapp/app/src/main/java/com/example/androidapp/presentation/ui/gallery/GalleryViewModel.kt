package com.example.androidapp.presentation.ui.gallery

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.androidapp.domain.model.Image
import com.example.androidapp.domain.usecase.image.GenerateImageUseCase
import com.example.androidapp.domain.usecase.image.GetImagesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GalleryViewModel @Inject constructor(
    private val getImagesUseCase: GetImagesUseCase,
    private val generateImageUseCase: GenerateImageUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<GalleryUiState>(GalleryUiState.Loading)
    val uiState: StateFlow<GalleryUiState> = _uiState.asStateFlow()

    fun loadImages(storyId: Long) {
        viewModelScope.launch {
            getImagesUseCase(storyId)
                .catch { error ->
                    _uiState.value = GalleryUiState.Error(error.message ?: "Failed to load images")
                }
                .collect { images ->
                    _uiState.value = GalleryUiState.Success(images)
                }
        }
    }

    fun generateImage(prompt: String, storyId: Long) {
        viewModelScope.launch {
            _uiState.value = GalleryUiState.Loading
            generateImageUseCase(prompt, storyId)
                .onSuccess {
                    loadImages(storyId)
                }
                .onFailure { error ->
                    _uiState.value = GalleryUiState.Error(error.message ?: "Failed to generate image")
                }
        }
    }
}

sealed class GalleryUiState {
    object Loading : GalleryUiState()
    data class Success(val images: List<Image>) : GalleryUiState()
    data class Error(val message: String) : GalleryUiState()
}
