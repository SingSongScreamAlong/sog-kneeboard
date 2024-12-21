package com.example.androidapp.domain.model

data class Story(
    val id: Long = 0,
    val title: String,
    val content: String,
    val theme: String,
    val ageRange: String,
    val isOfflineGenerated: Boolean,
    val createdAt: Long = System.currentTimeMillis(),
    val lastModified: Long = System.currentTimeMillis()
)
