package com.example.androidapp.data.repository

import com.example.androidapp.data.local.db.dao.ImageDao
import com.example.androidapp.data.local.storage.FileStorageManager
import com.example.androidapp.data.remote.api.ImageGenerationService
import com.example.androidapp.data.remote.api.model.ImageData
import com.example.androidapp.data.remote.api.model.ImageRequest
import com.example.androidapp.data.remote.api.model.ImageResponse
import io.mockk.*
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import okio.Buffer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.io.File

class ImageRepositoryImplTest {
    private lateinit var imageDao: ImageDao
    private lateinit var imageGenerationService: ImageGenerationService
    private lateinit var fileStorageManager: FileStorageManager
    private lateinit var okHttpClient: OkHttpClient
    private lateinit var repository: ImageRepositoryImpl

    @Before
    fun setup() {
        imageDao = mockk(relaxed = true)
        imageGenerationService = mockk()
        fileStorageManager = mockk()
        okHttpClient = mockk()
        repository = ImageRepositoryImpl(imageDao, imageGenerationService, fileStorageManager, okHttpClient)
    }

    @Test
    fun `generateImage creates proper request and handles response`() = runTest {
        // Capture the request to verify its contents
        val requestSlot = slot<ImageRequest>()
        
        // Mock API response
        val imageUrl = "https://example.com/test.jpg"
        val apiResponse = ImageResponse(
            created = System.currentTimeMillis(),
            data = listOf(
                ImageData(
                    url = imageUrl,
                    revisedPrompt = "Enhanced test prompt"
                )
            )
        )

        // Mock successful image download
        val testImageBytes = "test image data".toByteArray()
        val testFile = File("test.jpg")
        
        // Mock API call
        coEvery { 
            imageGenerationService.generateImage(capture(requestSlot))
        } returns apiResponse

        // Mock HTTP client for image download
        val mockCall = mockk<okhttp3.Call>()
        every { okHttpClient.newCall(any()) } returns mockCall
        
        coEvery { mockCall.execute() } returns Response.Builder()
            .code(200)
            .protocol(Protocol.HTTP_2)
            .request(Request.Builder().url(imageUrl).build())
            .message("OK")
            .body(Buffer().write(testImageBytes).toResponseBody())
            .build()

        // Mock file storage
        every { 
            fileStorageManager.createImageFile(match { it.startsWith("image_") && it.endsWith(".jpg") })
        } returns testFile

        // Test parameters
        val prompt = "A beautiful garden"
        val storyId = 123L

        // Generate image
        val result = repository.generateImage(prompt, storyId)

        // Verify request
        val capturedRequest = requestSlot.captured
        assertEquals("dall-e-3", capturedRequest.model)
        assertTrue(capturedRequest.prompt.contains(prompt))
        assertTrue(capturedRequest.prompt.contains("child-friendly"))
        assertTrue(capturedRequest.prompt.contains("safe for children"))
        assertEquals("1024x1024", capturedRequest.size)
        assertEquals("natural", capturedRequest.style)

        // Verify image download request
        verify { 
            okHttpClient.newCall(match { 
                it.url.toString() == imageUrl
            })
        }

        // Verify result
        assertEquals(storyId, result.storyId)
        assertEquals(prompt, result.prompt)
        assertEquals(testFile.absolutePath, result.localPath)
        assertEquals(false, result.isOfflineGenerated)

        // Verify image was saved to database
        coVerify { 
            imageDao.insertImage(match { 
                it.storyId == storyId &&
                it.prompt == prompt &&
                it.localPath == testFile.absolutePath
            })
        }
    }

    @Test
    fun `generateImage handles empty response`() = runTest {
        // Mock API response with no data
        val apiResponse = ImageResponse(
            created = System.currentTimeMillis(),
            data = emptyList()
        )

        coEvery { 
            imageGenerationService.generateImage(any())
        } returns apiResponse

        // Verify exception is thrown
        try {
            repository.generateImage(
                prompt = "Test prompt",
                storyId = 123L
            )
            assert(false) { "Should have thrown exception" }
        } catch (e: IllegalStateException) {
            assertEquals("No image URL received", e.message)
        }
    }

    @Test
    fun `generateImage handles download failure`() = runTest {
        // Mock successful API response
        val imageUrl = "https://example.com/test.jpg"
        val apiResponse = ImageResponse(
            created = System.currentTimeMillis(),
            data = listOf(
                ImageData(
                    url = imageUrl,
                    revisedPrompt = "Enhanced test prompt"
                )
            )
        )

        coEvery { 
            imageGenerationService.generateImage(any())
        } returns apiResponse

        // Mock failed download
        val mockCall = mockk<okhttp3.Call>()
        every { okHttpClient.newCall(any()) } returns mockCall
        
        coEvery { mockCall.execute() } returns Response.Builder()
            .code(404)
            .protocol(Protocol.HTTP_2)
            .request(Request.Builder().url(imageUrl).build())
            .message("Not Found")
            .build()

        // Verify exception is thrown
        try {
            repository.generateImage(
                prompt = "Test prompt",
                storyId = 123L
            )
            assert(false) { "Should have thrown exception" }
        } catch (e: IllegalStateException) {
            assertEquals("Failed to download image: 404", e.message)
        }
    }
}
