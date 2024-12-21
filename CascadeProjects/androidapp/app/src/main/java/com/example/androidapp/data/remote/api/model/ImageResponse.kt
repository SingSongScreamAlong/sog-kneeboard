package com.example.androidapp.data.remote.api.model

import com.google.gson.annotations.SerializedName

data class ImageResponse(
    val created: Long,
    val data: List<ImageData>
)

data class ImageData(
    val url: String,
    @SerializedName("revised_prompt")
    val revisedPrompt: String
)
