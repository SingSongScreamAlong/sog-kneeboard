package com.example.androidapp.data.remote.api

import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface StoryGenerationService {
    @POST("v1/chat/completions")
    suspend fun generateStory(
        @Header("Authorization") apiKey: String,
        @Body request: ChatCompletionRequest
    ): ChatCompletionResponse
}

data class ChatCompletionRequest(
    val model: String = "gpt-4",
    val messages: List<Message>,
    val temperature: Double = 0.7,
    val maxTokens: Int = 2048
)

data class Message(
    val role: String,
    val content: String
)

data class ChatCompletionResponse(
    val id: String,
    val choices: List<Choice>
)

data class Choice(
    val message: Message,
    val finishReason: String
)

data class StoryResponse(
    val title: String,
    val content: String
)
