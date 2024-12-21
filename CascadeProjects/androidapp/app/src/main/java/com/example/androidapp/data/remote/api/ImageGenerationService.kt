package com.example.androidapp.data.remote.api

import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface ImageGenerationService {
    @POST("v1/images/generations")
    suspend fun generateImage(
        @Header("Authorization") apiKey: String,
        @Body request: ImageGenerationRequest
    ): ImageGenerationResponse
}

data class ImageGenerationRequest(
    val prompt: String,
    val n: Int = 1,
    val size: String = "1024x1024",
    val model: String = "dall-e-3",
    val quality: String = "standard",
    val style: String = "natural"
)

data class ImageGenerationResponse(
    val created: Long,
    val data: List<ImageData>
)

data class ImageData(
    val url: String,
    val revised_prompt: String? = null
)
