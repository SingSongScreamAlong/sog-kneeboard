package com.example.androidapp.domain.usecase.story

import com.example.androidapp.data.local.datastore.UserPreferences
import com.example.androidapp.data.local.ml.MistralModelManager
import com.example.androidapp.data.repository.StoryRepository
import com.example.androidapp.domain.model.Story
import com.example.androidapp.domain.model.UserSettings
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class GenerateStoryUseCaseTest {
    private lateinit var useCase: GenerateStoryUseCase
    private lateinit var storyRepository: StoryRepository
    private lateinit var userPreferences: UserPreferences
    private lateinit var mistralModelManager: MistralModelManager

    @Before
    fun setup() {
        storyRepository = mockk()
        userPreferences = mockk()
        mistralModelManager = mockk()
        useCase = GenerateStoryUseCase(storyRepository, userPreferences, mistralModelManager)
    }

    @Test
    fun `generateStory online mode success`() = runTest {
        // Given
        val prompt = "test prompt"
        val theme = "adventure"
        val settings = UserSettings(
            offlineModeEnabled = false,
            parentalControlEnabled = false,
            ageRange = "4-8",
            apiKeys = null
        )
        val expectedStory = Story(
            id = 1L,
            title = "Test Story",
            content = "Story content",
            theme = theme,
            ageRange = "4-8",
            isOfflineGenerated = false
        )

        coEvery { userPreferences.getUserSettings() } returns flowOf(settings)
        coEvery { storyRepository.generateStory(prompt, theme, "4-8") } returns expectedStory

        // When
        val result = useCase(prompt, theme)

        // Then
        assertTrue(result.isSuccess)
        assertEquals(expectedStory, result.getOrNull())
    }

    @Test
    fun `generateStory offline mode success`() = runTest {
        // Given
        val prompt = "test prompt"
        val theme = "adventure"
        val settings = UserSettings(
            offlineModeEnabled = true,
            parentalControlEnabled = false,
            ageRange = "4-8",
            apiKeys = null
        )
        val generatedContent = """
            Test Story Title
            
            Once upon a time...
        """.trimIndent()

        coEvery { userPreferences.getUserSettings() } returns flowOf(settings)
        coEvery { mistralModelManager.generateStory(any()) } returns generatedContent

        // When
        val result = useCase(prompt, theme)

        // Then
        assertTrue(result.isSuccess)
        val story = result.getOrNull()
        assertEquals("Test Story Title", story?.title)
        assertTrue(story?.isOfflineGenerated == true)
    }

    @Test
    fun `generateStory handles error`() = runTest {
        // Given
        val prompt = "test prompt"
        val theme = "adventure"
        val settings = UserSettings(
            offlineModeEnabled = false,
            parentalControlEnabled = false,
            ageRange = "4-8",
            apiKeys = null
        )
        val exception = RuntimeException("API Error")

        coEvery { userPreferences.getUserSettings() } returns flowOf(settings)
        coEvery { storyRepository.generateStory(prompt, theme, "4-8") } throws exception

        // When
        val result = useCase(prompt, theme)

        // Then
        assertTrue(result.isFailure)
        assertEquals(exception, result.exceptionOrNull())
    }
}
