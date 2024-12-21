package com.example.androidapp.data.repository

import com.example.androidapp.data.local.db.dao.StoryDao
import com.example.androidapp.data.local.db.entity.StoryEntity
import com.example.androidapp.data.local.datastore.UserPreferences
import com.example.androidapp.data.remote.api.StoryGenerationService
import com.example.androidapp.data.remote.api.model.StoryRequest
import com.example.androidapp.domain.repository.StoryRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StoryRepositoryImpl @Inject constructor(
    private val storyDao: StoryDao,
    private val storyGenerationService: StoryGenerationService,
    private val userPreferences: UserPreferences
) : StoryRepository {
    override fun getAllStories(): Flow<List<StoryEntity>> = storyDao.getAllStories()

    override suspend fun generateStory(prompt: String, theme: String): StoryEntity {
        val ageRange = userPreferences.ageRange.first()
        val isOfflineMode = userPreferences.offlineModeEnabled.first()

        return if (!isOfflineMode) {
            // Online generation using OpenAI
            val request = StoryRequest(
                prompt = prompt,
                ageRange = ageRange,
                theme = theme
            )
            val response = storyGenerationService.generateStory(
                apiKey = "YOUR_API_KEY", // TODO: Implement secure key storage
                request = request
            )
            
            StoryEntity(
                title = response.title,
                content = response.content,
                ageRange = ageRange,
                theme = theme,
                createdAt = System.currentTimeMillis(),
                lastModified = System.currentTimeMillis(),
                isOfflineGenerated = false
            ).also {
                storyDao.insertStory(it)
            }
        } else {
            // TODO: Implement offline generation using local model
            throw NotImplementedError("Offline story generation not implemented yet")
        }
    }

    override suspend fun getStoryById(id: Long): StoryEntity? = storyDao.getStoryById(id)

    override suspend fun deleteStory(storyId: Long) {
        storyDao.deleteStory(storyId)
    }

    override fun getStoriesByTheme(theme: String): Flow<List<StoryEntity>> = storyDao.getStoriesByTheme(theme)

    override fun getStoriesByAgeRange(ageRange: String): Flow<List<StoryEntity>> = 
        storyDao.getStoriesByAgeRange(ageRange)
}
