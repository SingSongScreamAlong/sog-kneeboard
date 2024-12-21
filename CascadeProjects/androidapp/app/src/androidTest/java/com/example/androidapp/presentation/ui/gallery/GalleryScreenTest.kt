package com.example.androidapp.presentation.ui.gallery

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import com.example.androidapp.domain.model.Image
import org.junit.Rule
import org.junit.Test

class GalleryScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun galleryScreen_displaysLoadingState() {
        // Given
        val viewModel = FakeGalleryViewModel(initialState = GalleryUiState.Loading)

        // When
        composeTestRule.setContent {
            GalleryScreen(
                storyId = 1L,
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithTag("loading_spinner").assertExists()
    }

    @Test
    fun galleryScreen_displaysImages() {
        // Given
        val images = listOf(
            Image(
                id = 1L,
                storyId = 1L,
                prompt = "Test prompt",
                localPath = "path/to/image.jpg",
                isOfflineGenerated = false
            )
        )
        val viewModel = FakeGalleryViewModel(initialState = GalleryUiState.Success(images))

        // When
        composeTestRule.setContent {
            GalleryScreen(
                storyId = 1L,
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Then
        // Note: We can't directly test the image loading, but we can verify the container exists
        composeTestRule.onNodeWithTag("image_grid").assertExists()
        composeTestRule.onAllNodesWithTag("image_card").assertCountEquals(1)
    }

    @Test
    fun galleryScreen_displaysError() {
        // Given
        val errorMessage = "Failed to load images"
        val viewModel = FakeGalleryViewModel(initialState = GalleryUiState.Error(errorMessage))

        // When
        composeTestRule.setContent {
            GalleryScreen(
                storyId = 1L,
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithText(errorMessage).assertExists()
        composeTestRule.onNodeWithText("Retry").assertExists()
    }

    @Test
    fun galleryScreen_generateImageDialog() {
        // Given
        val viewModel = FakeGalleryViewModel(initialState = GalleryUiState.Success(emptyList()))

        // When
        composeTestRule.setContent {
            GalleryScreen(
                storyId = 1L,
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Open dialog
        composeTestRule.onNodeWithContentDescription("Generate Image").performClick()

        // Then
        composeTestRule.onNodeWithText("Generate New Image").assertExists()
        composeTestRule.onNodeWithText("Image Prompt").assertExists()
        composeTestRule.onNodeWithText("Generate").assertExists()
        composeTestRule.onNodeWithText("Cancel").assertExists()
    }

    @Test
    fun galleryScreen_navigationButton() {
        // Given
        val viewModel = FakeGalleryViewModel(initialState = GalleryUiState.Success(emptyList()))
        var backClicked = false

        // When
        composeTestRule.setContent {
            GalleryScreen(
                storyId = 1L,
                onBackClick = { backClicked = true },
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithContentDescription("Back").performClick()
        assert(backClicked)
    }
}
