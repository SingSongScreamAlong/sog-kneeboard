package com.example.androidapp.data.repository

import com.example.androidapp.data.local.db.dao.StoryDao
import com.example.androidapp.data.local.db.entity.StoryEntity
import com.example.androidapp.data.remote.api.StoryGenerationService
import com.example.androidapp.data.remote.api.model.Choice
import com.example.androidapp.data.remote.api.model.Message
import com.example.androidapp.data.remote.api.model.StoryRequest
import com.example.androidapp.data.remote.api.model.StoryResponse
import com.example.androidapp.data.remote.api.model.Usage
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

class StoryRepositoryImplTest {
    private lateinit var storyDao: StoryDao
    private lateinit var storyGenerationService: StoryGenerationService
    private lateinit var repository: StoryRepositoryImpl

    @Before
    fun setup() {
        storyDao = mockk(relaxed = true)
        storyGenerationService = mockk()
        repository = StoryRepositoryImpl(storyDao, storyGenerationService)
    }

    @Test
    fun `generateStory creates proper request and parses response`() = runTest {
        // Capture the request to verify its contents
        val requestSlot = slot<StoryRequest>()
        
        // Mock API response
        val apiResponse = StoryResponse(
            id = "test_id",
            choices = listOf(
                Choice(
                    index = 0,
                    message = Message(
                        role = "assistant",
                        content = """
                            Title: The Magic Garden
                            Story: Once upon a time, in a beautiful garden...
                        """.trimIndent()
                    ),
                    finishReason = "stop"
                )
            ),
            usage = Usage(
                promptTokens = 100,
                completionTokens = 200,
                totalTokens = 300
            )
        )

        coEvery { 
            storyGenerationService.generateStory(capture(requestSlot))
        } returns apiResponse

        // Test parameters
        val prompt = "A story about a magical garden"
        val theme = "Nature"
        val ageRange = "4-8"

        // Generate story
        val result = repository.generateStory(prompt, theme, ageRange)

        // Verify request
        val capturedRequest = requestSlot.captured
        assertEquals("mistral-medium", capturedRequest.model)
        assertEquals(2, capturedRequest.messages.size)
        
        // Verify system message contains all requirements
        val systemMessage = capturedRequest.messages[0]
        assertEquals("system", systemMessage.role)
        assert(systemMessage.content.contains(ageRange))
        assert(systemMessage.content.contains(theme))
        assert(systemMessage.content.contains("Title:"))
        
        // Verify user message
        val userMessage = capturedRequest.messages[1]
        assertEquals("user", userMessage.role)
        assertEquals(prompt, userMessage.content)

        // Verify response parsing
        assertEquals("The Magic Garden", result.title)
        assertEquals("Once upon a time, in a beautiful garden...", result.content)
        assertEquals(theme, result.theme)
        assertEquals(ageRange, result.ageRange)
        assertEquals(false, result.isOfflineGenerated)

        // Verify story was saved to database
        coVerify { 
            storyDao.insertStory(match { 
                it.title == "The Magic Garden" &&
                it.content == "Once upon a time, in a beautiful garden..." &&
                it.theme == theme &&
                it.ageRange == ageRange
            })
        }
    }

    @Test
    fun `generateStory handles malformed response`() = runTest {
        // Mock API response with malformed content
        val apiResponse = StoryResponse(
            id = "test_id",
            choices = listOf(
                Choice(
                    index = 0,
                    message = Message(
                        role = "assistant",
                        content = "Just some text without title"
                    ),
                    finishReason = "stop"
                )
            ),
            usage = Usage(
                promptTokens = 100,
                completionTokens = 200,
                totalTokens = 300
            )
        )

        coEvery { 
            storyGenerationService.generateStory(any())
        } returns apiResponse

        // Generate story
        val result = repository.generateStory(
            prompt = "Test prompt",
            theme = "Test theme",
            ageRange = "4-8"
        )

        // Verify default title was used
        assertEquals("Untitled Story", result.title)
        assertEquals("Just some text without title", result.content)
    }

    @Test
    fun `generateStory handles empty response`() = runTest {
        // Mock API response with empty choices
        val apiResponse = StoryResponse(
            id = "test_id",
            choices = emptyList(),
            usage = Usage(
                promptTokens = 0,
                completionTokens = 0,
                totalTokens = 0
            )
        )

        coEvery { 
            storyGenerationService.generateStory(any())
        } returns apiResponse

        // Verify exception is thrown
        try {
            repository.generateStory(
                prompt = "Test prompt",
                theme = "Test theme",
                ageRange = "4-8"
            )
            assert(false) { "Should have thrown exception" }
        } catch (e: IllegalStateException) {
            assertEquals("No story content received", e.message)
        }
    }
}
