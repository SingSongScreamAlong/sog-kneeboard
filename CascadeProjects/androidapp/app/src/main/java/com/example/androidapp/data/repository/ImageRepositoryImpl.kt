package com.example.androidapp.data.repository

import com.example.androidapp.data.local.db.dao.ImageDao
import com.example.androidapp.data.local.db.entity.toEntity
import com.example.androidapp.data.local.db.entity.toModel
import com.example.androidapp.data.remote.api.ImageGenerationService
import com.example.androidapp.domain.model.Image
import com.example.androidapp.domain.repository.ImageRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class ImageRepositoryImpl @Inject constructor(
    private val imageDao: ImageDao,
    private val imageGenerationService: ImageGenerationService
) : ImageRepository {

    override suspend fun generateImage(prompt: String, storyId: Long): Image {
        val response = imageGenerationService.generateImage(prompt)
        val image = Image(
            id = 0,
            url = response.url,
            storyId = storyId,
            prompt = prompt,
            isOfflineGenerated = false
        )
        val id = imageDao.insert(image.toEntity())
        return image.copy(id = id)
    }

    override fun getImagesForStory(storyId: Long): Flow<List<Image>> {
        return imageDao.getImagesForStory(storyId).map { entities ->
            entities.map { it.toModel() }
        }
    }

    override suspend fun getImageById(id: Long): Image? {
        return imageDao.getImageById(id)?.toModel()
    }

    override suspend fun deleteImage(image: Image) {
        imageDao.delete(image.toEntity())
    }
}
