package com.example.androidapp.presentation.ui.home

import com.example.androidapp.domain.model.Story
import com.example.androidapp.domain.usecase.story.GenerateStoryUseCase
import com.example.androidapp.domain.usecase.story.GetStoriesUseCase
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class HomeViewModelTest {
    private lateinit var viewModel: HomeViewModel
    private lateinit var getStoriesUseCase: GetStoriesUseCase
    private lateinit var generateStoryUseCase: GenerateStoryUseCase
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        getStoriesUseCase = mockk()
        generateStoryUseCase = mockk()
        viewModel = HomeViewModel(getStoriesUseCase, generateStoryUseCase)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state is Loading`() = runTest {
        // Given
        val initialState = viewModel.uiState.value

        // Then
        assertEquals(HomeUiState.Loading, initialState)
    }

    @Test
    fun `loadStories success updates state to Success`() = runTest {
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
        coEvery { getStoriesUseCase() } returns flowOf(stories)

        // When
        viewModel = HomeViewModel(getStoriesUseCase, generateStoryUseCase)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        assertEquals(HomeUiState.Success(stories), viewModel.uiState.value)
    }

    @Test
    fun `loadStories error updates state to Error`() = runTest {
        // Given
        val errorMessage = "Failed to load stories"
        coEvery { getStoriesUseCase() } throws RuntimeException(errorMessage)

        // When
        viewModel = HomeViewModel(getStoriesUseCase, generateStoryUseCase)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        assertEquals(HomeUiState.Error(errorMessage), viewModel.uiState.value)
    }

    @Test
    fun `generateStory success reloads stories`() = runTest {
        // Given
        val prompt = "test prompt"
        val theme = "adventure"
        val story = Story(
            id = 1L,
            title = "Generated Story",
            content = "Content",
            theme = theme,
            ageRange = "4-8",
            isOfflineGenerated = false
        )
        val stories = listOf(story)

        coEvery { generateStoryUseCase(prompt, theme) } returns Result.success(story)
        coEvery { getStoriesUseCase() } returns flowOf(stories)

        // When
        viewModel.generateStory(prompt, theme)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        assertEquals(HomeUiState.Success(stories), viewModel.uiState.value)
    }

    @Test
    fun `generateStory error updates state to Error`() = runTest {
        // Given
        val prompt = "test prompt"
        val theme = "adventure"
        val errorMessage = "Failed to generate story"

        coEvery { generateStoryUseCase(prompt, theme) } returns Result.failure(
            RuntimeException(errorMessage)
        )

        // When
        viewModel.generateStory(prompt, theme)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        assertEquals(HomeUiState.Error(errorMessage), viewModel.uiState.value)
    }
}
