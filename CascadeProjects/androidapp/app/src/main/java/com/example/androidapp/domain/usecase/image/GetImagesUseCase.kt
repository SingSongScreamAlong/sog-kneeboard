package com.example.androidapp.domain.usecase.image

import com.example.androidapp.data.repository.ImageRepository
import com.example.androidapp.domain.model.Image
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class GetImagesUseCase @Inject constructor(
    private val imageRepository: ImageRepository
) {
    operator fun invoke(storyId: Long): Flow<List<Image>> =
        imageRepository.getImagesForStory(storyId).map { entities ->
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
        }

    suspend fun getImageById(id: Long): Image? {
        return imageRepository.getImageById(id)?.let { entity ->
            Image(
                id = entity.id,
                storyId = entity.storyId,
                localPath = entity.localPath,
                prompt = entity.prompt,
                createdAt = entity.createdAt,
                isGenerated = entity.isGenerated
            )
        }
    }
}
