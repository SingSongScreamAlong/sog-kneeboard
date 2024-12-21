package com.example.androidapp.presentation.ui.reader

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.androidapp.domain.model.Story
import com.example.androidapp.domain.usecase.story.GetStoriesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReaderViewModel @Inject constructor(
    private val getStoriesUseCase: GetStoriesUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<ReaderUiState>(ReaderUiState.Loading)
    val uiState: StateFlow<ReaderUiState> = _uiState.asStateFlow()

    fun loadStory(storyId: Long) {
        viewModelScope.launch {
            _uiState.value = ReaderUiState.Loading
            try {
                val story = getStoriesUseCase.getStoryById(storyId)
                if (story != null) {
                    _uiState.value = ReaderUiState.Success(story)
                } else {
                    _uiState.value = ReaderUiState.Error("Story not found")
                }
            } catch (e: Exception) {
                _uiState.value = ReaderUiState.Error(e.message ?: "Failed to load story")
            }
        }
    }
}

sealed class ReaderUiState {
    object Loading : ReaderUiState()
    data class Success(val story: Story) : ReaderUiState()
    data class Error(val message: String) : ReaderUiState()
}
