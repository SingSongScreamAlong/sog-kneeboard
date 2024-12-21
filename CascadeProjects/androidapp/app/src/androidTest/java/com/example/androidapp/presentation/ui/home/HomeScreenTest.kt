package com.example.androidapp.presentation.ui.home

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import com.example.androidapp.domain.model.Story
import org.junit.Rule
import org.junit.Test

class HomeScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun homeScreen_displaysLoadingState() {
        // Given
        val viewModel = FakeHomeViewModel(initialState = HomeUiState.Loading)

        // When
        composeTestRule.setContent {
            HomeScreen(
                onStoryClick = {},
                onSettingsClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithTag("loading_spinner").assertExists()
    }

    @Test
    fun homeScreen_displaysStories() {
        // Given
        val stories = listOf(
            Story(
                id = 1L,
                title = "Test Story",
                content = "Content",
                theme = "adventure",
                ageRange = "4-8",
                isOfflineGenerated = false
            )
        )
        val viewModel = FakeHomeViewModel(initialState = HomeUiState.Success(stories))

        // When
        composeTestRule.setContent {
            HomeScreen(
                onStoryClick = {},
                onSettingsClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithText("Test Story").assertExists()
        composeTestRule.onNodeWithText("Theme: adventure").assertExists()
        composeTestRule.onNodeWithText("Age Range: 4-8").assertExists()
    }

    @Test
    fun homeScreen_displaysError() {
        // Given
        val errorMessage = "Failed to load stories"
        val viewModel = FakeHomeViewModel(initialState = HomeUiState.Error(errorMessage))

        // When
        composeTestRule.setContent {
            HomeScreen(
                onStoryClick = {},
                onSettingsClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithText(errorMessage).assertExists()
        composeTestRule.onNodeWithText("Retry").assertExists()
    }

    @Test
    fun homeScreen_generateStoryDialog() {
        // Given
        val viewModel = FakeHomeViewModel(initialState = HomeUiState.Success(emptyList()))

        // When
        composeTestRule.setContent {
            HomeScreen(
                onStoryClick = {},
                onSettingsClick = {},
                viewModel = viewModel
            )
        }

        // Open dialog
        composeTestRule.onNodeWithContentDescription("Generate Story").performClick()

        // Then
        composeTestRule.onNodeWithText("Generate New Story").assertExists()
        composeTestRule.onNodeWithText("Story Prompt").assertExists()
        composeTestRule.onNodeWithText("Theme").assertExists()
        composeTestRule.onNodeWithText("Generate").assertExists()
        composeTestRule.onNodeWithText("Cancel").assertExists()
    }
}
