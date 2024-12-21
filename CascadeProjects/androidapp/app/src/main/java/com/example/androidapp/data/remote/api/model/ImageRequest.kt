package com.example.androidapp.data.remote.api.model

import com.google.gson.annotations.SerializedName

data class ImageRequest(
    val model: String = "dall-e-3",
    val prompt: String,
    val n: Int = 1,
    @SerializedName("quality")
    val quality: String = "standard",
    val size: String = "1024x1024",
    val style: String = "natural",
    @SerializedName("response_format")
    val responseFormat: String = "url"
)
