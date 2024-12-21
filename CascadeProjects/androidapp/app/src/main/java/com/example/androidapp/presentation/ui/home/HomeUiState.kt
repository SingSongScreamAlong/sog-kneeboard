package com.example.androidapp.presentation.ui.home

import com.example.androidapp.domain.model.Story

sealed class HomeUiState {
    object Loading : HomeUiState()
    data class Success(val stories: List<Story>) : HomeUiState()
    data class Error(val message: String) : HomeUiState()
}
