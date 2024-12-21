package com.example.androidapp.domain.model

data class Image(
    val id: Long = 0,
    val url: String,
    val storyId: Long,
    val prompt: String,
    val isOfflineGenerated: Boolean,
    val createdAt: Long = System.currentTimeMillis()
)
