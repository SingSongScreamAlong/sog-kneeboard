package com.example.androidapp.presentation.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.androidapp.domain.model.Story
import com.example.androidapp.domain.usecase.story.DeleteStoryUseCase
import com.example.androidapp.domain.usecase.story.GenerateStoryUseCase
import com.example.androidapp.domain.usecase.story.GetStoriesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val generateStoryUseCase: GenerateStoryUseCase,
    private val getStoriesUseCase: GetStoriesUseCase,
    private val deleteStoryUseCase: DeleteStoryUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadStories()
    }

    private fun loadStories() {
        viewModelScope.launch {
            getStoriesUseCase()
                .catch { e ->
                    _uiState.value = HomeUiState.Error(e.message ?: "Unknown error")
                }
                .collect { stories ->
                    _uiState.value = HomeUiState.Success(stories)
                }
        }
    }

    fun generateStory(prompt: String, theme: String, ageRange: String) {
        viewModelScope.launch {
            _uiState.value = HomeUiState.Loading
            try {
                generateStoryUseCase(prompt, theme, ageRange)
                    .onSuccess {
                        loadStories()
                    }
                    .onFailure { e ->
                        _uiState.value = HomeUiState.Error(e.message ?: "Failed to generate story")
                    }
            } catch (e: Exception) {
                _uiState.value = HomeUiState.Error(e.message ?: "Failed to generate story")
            }
        }
    }

    fun deleteStory(storyId: Long) {
        viewModelScope.launch {
            try {
                deleteStoryUseCase(storyId)
                loadStories()
            } catch (e: Exception) {
                _uiState.value = HomeUiState.Error(e.message ?: "Failed to delete story")
            }
        }
    }
}

sealed class HomeUiState {
    data object Loading : HomeUiState()
    data class Success(val stories: List<Story>) : HomeUiState()
    data class Error(val message: String) : HomeUiState()
}
