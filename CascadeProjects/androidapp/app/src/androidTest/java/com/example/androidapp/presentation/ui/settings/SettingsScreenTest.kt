package com.example.androidapp.presentation.ui.settings

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import com.example.androidapp.domain.model.ApiKeys
import com.example.androidapp.domain.model.UserSettings
import org.junit.Rule
import org.junit.Test

class SettingsScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun settingsScreen_displaysLoadingState() {
        // Given
        val viewModel = FakeSettingsViewModel(initialState = SettingsUiState.Loading)

        // When
        composeTestRule.setContent {
            SettingsScreen(
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithTag("loading_spinner").assertExists()
    }

    @Test
    fun settingsScreen_displaysSettings() {
        // Given
        val settings = UserSettings(
            offlineModeEnabled = false,
            parentalControlEnabled = true,
            ageRange = "4-8",
            apiKeys = ApiKeys(
                openAiKey = "test-key",
                mistralKey = "test-key"
            )
        )
        val viewModel = FakeSettingsViewModel(initialState = SettingsUiState.Success(settings))

        // When
        composeTestRule.setContent {
            SettingsScreen(
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithText("Age Range").assertExists()
        composeTestRule.onNodeWithText("4-8").assertExists()
        composeTestRule.onNodeWithText("Parental Controls").assertExists()
        composeTestRule.onNodeWithText("Offline Mode").assertExists()
        composeTestRule.onNodeWithText("Configure API Keys").assertExists()
    }

    @Test
    fun settingsScreen_displaysError() {
        // Given
        val errorMessage = "Failed to load settings"
        val viewModel = FakeSettingsViewModel(initialState = SettingsUiState.Error(errorMessage))

        // When
        composeTestRule.setContent {
            SettingsScreen(
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithText(errorMessage).assertExists()
        composeTestRule.onNodeWithText("Retry").assertExists()
    }

    @Test
    fun settingsScreen_apiKeysDialog() {
        // Given
        val settings = UserSettings(
            offlineModeEnabled = false,
            parentalControlEnabled = false,
            ageRange = "4-8",
            apiKeys = null
        )
        val viewModel = FakeSettingsViewModel(initialState = SettingsUiState.Success(settings))

        // When
        composeTestRule.setContent {
            SettingsScreen(
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Open dialog
        composeTestRule.onNodeWithText("Configure API Keys").performClick()

        // Then
        composeTestRule.onNodeWithText("API Keys").assertExists()
        composeTestRule.onNodeWithText("OpenAI API Key").assertExists()
        composeTestRule.onNodeWithText("Mistral API Key").assertExists()
        composeTestRule.onNodeWithText("Save").assertExists()
        composeTestRule.onNodeWithText("Cancel").assertExists()
    }

    @Test
    fun settingsScreen_toggles() {
        // Given
        val settings = UserSettings(
            offlineModeEnabled = false,
            parentalControlEnabled = false,
            ageRange = "4-8",
            apiKeys = null
        )
        val viewModel = FakeSettingsViewModel(initialState = SettingsUiState.Success(settings))

        // When
        composeTestRule.setContent {
            SettingsScreen(
                onBackClick = {},
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNode(hasText("Parental Controls") and hasClickAction()).performClick()
        composeTestRule.onNode(hasText("Offline Mode") and hasClickAction()).performClick()
    }

    @Test
    fun settingsScreen_navigationButton() {
        // Given
        val viewModel = FakeSettingsViewModel(initialState = SettingsUiState.Success(
            UserSettings(
                offlineModeEnabled = false,
                parentalControlEnabled = false,
                ageRange = "4-8",
                apiKeys = null
            )
        ))
        var backClicked = false

        // When
        composeTestRule.setContent {
            SettingsScreen(
                onBackClick = { backClicked = true },
                viewModel = viewModel
            )
        }

        // Then
        composeTestRule.onNodeWithContentDescription("Back").performClick()
        assert(backClicked)
    }
}
