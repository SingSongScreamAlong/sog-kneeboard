package com.example.androidapp.domain.repository

import com.example.androidapp.domain.model.Story
import kotlinx.coroutines.flow.Flow

interface StoryRepository {
    suspend fun generateStory(prompt: String, theme: String, ageRange: String): Story
    fun getAllStories(): Flow<List<Story>>
    suspend fun getStoryById(id: Long): Story?
    suspend fun deleteStory(id: Long)
    fun getStoriesByTheme(theme: String): Flow<List<Story>>
    fun getStoriesByAgeRange(ageRange: String): Flow<List<Story>>
}
