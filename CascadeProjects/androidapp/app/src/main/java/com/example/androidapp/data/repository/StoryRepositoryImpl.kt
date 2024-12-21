package com.example.androidapp.data.repository

import com.example.androidapp.data.local.db.dao.StoryDao
import com.example.androidapp.data.local.db.entity.toEntity
import com.example.androidapp.data.local.db.entity.toModel
import com.example.androidapp.data.remote.api.StoryGenerationService
import com.example.androidapp.domain.model.Story
import com.example.androidapp.domain.repository.StoryRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class StoryRepositoryImpl @Inject constructor(
    private val storyDao: StoryDao,
    private val storyGenerationService: StoryGenerationService
) : StoryRepository {

    override suspend fun generateStory(prompt: String, theme: String, ageRange: String): Story {
        val response = storyGenerationService.generateStory(prompt, theme, ageRange)
        val story = Story(
            id = 0,
            title = response.title,
            content = response.content,
            theme = theme,
            ageRange = ageRange,
            createdAt = System.currentTimeMillis(),
            lastModified = System.currentTimeMillis(),
            isOfflineGenerated = false
        )
        val id = storyDao.insert(story.toEntity())
        return story.copy(id = id)
    }

    override fun getStories(): Flow<List<Story>> {
        return storyDao.getAllStories().map { entities ->
            entities.map { it.toModel() }
        }
    }

    override suspend fun getStoryById(id: Long): Story? {
        return storyDao.getStoryById(id)?.toModel()
    }

    override suspend fun deleteStory(story: Story) {
        storyDao.deleteStoryById(story.id)
    }

    override fun getStoriesByTheme(theme: String): Flow<List<Story>> {
        return storyDao.getStoriesByTheme(theme).map { entities ->
            entities.map { it.toModel() }
        }
    }

    override fun getStoriesByAgeRange(ageRange: String): Flow<List<Story>> {
        return storyDao.getStoriesByAgeRange(ageRange).map { entities ->
            entities.map { it.toModel() }
        }
    }
}
