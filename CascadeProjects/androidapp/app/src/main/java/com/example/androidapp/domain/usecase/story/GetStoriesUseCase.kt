package com.example.androidapp.domain.usecase.story

import com.example.androidapp.data.repository.ImageRepository
import com.example.androidapp.data.repository.StoryRepository
import com.example.androidapp.domain.model.Image
import com.example.androidapp.domain.model.Story
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class GetStoriesUseCase @Inject constructor(
    private val storyRepository: StoryRepository,
    private val imageRepository: ImageRepository
) {
    operator fun invoke(): Flow<List<Story>> = storyRepository.getAllStories().map { entities ->
        entities.map { entity ->
            Story(
                id = entity.id,
                title = entity.title,
                content = entity.content,
                ageRange = entity.ageRange,
                theme = entity.theme,
                createdAt = entity.createdAt,
                lastModified = entity.lastModified,
                isOfflineGenerated = entity.isOfflineGenerated
            )
        }
    }

    suspend fun getStoryById(id: Long): Story? {
        val storyEntity = storyRepository.getStoryById(id) ?: return null
        val imageEntities = imageRepository.getImagesForStory(id)
        
        return Story(
            id = storyEntity.id,
            title = storyEntity.title,
            content = storyEntity.content,
            ageRange = storyEntity.ageRange,
            theme = storyEntity.theme,
            createdAt = storyEntity.createdAt,
            lastModified = storyEntity.lastModified,
            isOfflineGenerated = storyEntity.isOfflineGenerated,
            images = imageEntities.map { entities ->
                entities.map { entity ->
                    Image(
                        id = entity.id,
                        storyId = entity.storyId,
                        localPath = entity.localPath,
                        prompt = entity.prompt,
                        createdAt = entity.createdAt,
                        isGenerated = entity.isGenerated
                    )
                }
            }.value
        )
    }
}
