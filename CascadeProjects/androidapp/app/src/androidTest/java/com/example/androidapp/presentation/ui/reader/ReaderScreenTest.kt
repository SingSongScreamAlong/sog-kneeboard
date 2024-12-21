package com.example.androidapp.presentation.ui.reader

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import com.example.androidapp.domain.model.Story
import org.junit.Rule
import org.junit.Test

class ReaderScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun readerScreen_displaysLoadingState() {
        // Given
        val viewModel = FakeReaderViewModel(initialState = ReaderUiState.Loading)

        // When
        composeTestRule.setContent {
            ReaderScreen(
                storyId = 1L,
                onBackClick = {},
                onGalleryClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithTag("loading_spinner").assertExists()
    }

    @Test
    fun readerScreen_displaysStory() {
        // Given
        val story = Story(
            id = 1L,
            title = "Test Story",
            content = "Once upon a time...",
            theme = "adventure",
            ageRange = "4-8",
            isOfflineGenerated = false
        )
        val viewModel = FakeReaderViewModel(initialState = ReaderUiState.Success(story))

        // When
        composeTestRule.setContent {
            ReaderScreen(
                storyId = 1L,
                onBackClick = {},
                onGalleryClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithText("Test Story").assertExists()
        composeTestRule.onNodeWithText("Once upon a time...").assertExists()
        composeTestRule.onNodeWithText("Theme: adventure").assertExists()
        composeTestRule.onNodeWithText("Age Range: 4-8").assertExists()
    }

    @Test
    fun readerScreen_displaysError() {
        // Given
        val errorMessage = "Failed to load story"
        val viewModel = FakeReaderViewModel(initialState = ReaderUiState.Error(errorMessage))

        // When
        composeTestRule.setContent {
            ReaderScreen(
                storyId = 1L,
                onBackClick = {},
                onGalleryClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithText(errorMessage).assertExists()
        composeTestRule.onNodeWithText("Retry").assertExists()
    }

    @Test
    fun readerScreen_navigationButtons() {
        // Given
        val story = Story(
            id = 1L,
            title = "Test Story",
            content = "Content",
            theme = "adventure",
            ageRange = "4-8",
            isOfflineGenerated = false
        )
        val viewModel = FakeReaderViewModel(initialState = ReaderUiState.Success(story))
        var backClicked = false
        var galleryClicked = false

        // When
        composeTestRule.setContent {
            ReaderScreen(
                storyId = 1L,
                onBackClick = { backClicked = true },
                onGalleryClick = { galleryClicked = true },
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithContentDescription("Back").performClick()
        assert(backClicked)

        composeTestRule.onNodeWithContentDescription("Gallery").performClick()
        assert(galleryClicked)
    }
}
