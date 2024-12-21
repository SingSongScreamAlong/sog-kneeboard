package com.example.androidapp.data.remote.api.model

import com.google.gson.annotations.SerializedName

data class StoryRequest(
    val model: String = "mistral-medium",
    val messages: List<Message>,
    @SerializedName("max_tokens")
    val maxTokens: Int = 1000,
    val temperature: Double = 0.7,
    @SerializedName("top_p")
    val topP: Double = 0.9,
    @SerializedName("random_seed")
    val randomSeed: Int? = null
)

data class Message(
    val role: String,
    val content: String
) {
    companion object {
        fun system(content: String) = Message("system", content)
        fun user(content: String) = Message("user", content)
        fun assistant(content: String) = Message("assistant", content)
    }
}
