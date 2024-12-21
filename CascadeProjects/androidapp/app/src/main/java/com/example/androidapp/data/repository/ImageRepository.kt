package com.example.androidapp.data.repository

import android.graphics.Bitmap
import com.example.androidapp.data.local.db.dao.ImageDao
import com.example.androidapp.data.local.db.entity.ImageEntity
import com.example.androidapp.data.local.storage.FileStorageManager
import com.example.androidapp.data.remote.api.ImageGenerationService
import com.example.androidapp.data.remote.api.model.ImageRequest
import com.example.androidapp.domain.repository.ImageRepository
import kotlinx.coroutines.flow.Flow
import java.io.ByteArrayOutputStream
import java.net.URL
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ImageRepositoryImpl @Inject constructor(
    private val imageDao: ImageDao,
    private val imageGenerationService: ImageGenerationService,
    private val fileStorageManager: FileStorageManager
) : ImageRepository {
    override fun getImagesForStory(storyId: Long): Flow<List<ImageEntity>> = 
        imageDao.getImagesForStory(storyId)

    override suspend fun generateImage(prompt: String, storyId: Long): ImageEntity {
        val request = ImageRequest(prompt = prompt)
        val response = imageGenerationService.generateImage(
            apiKey = "YOUR_API_KEY", // TODO: Implement secure key storage
            request = request
        )

        // Download and save the image
        val imageBytes = URL(response.url).readBytes()
        val fileName = "${response.id}.jpg"
        val localPath = fileStorageManager.saveImage(imageBytes, fileName)

        return ImageEntity(
            storyId = storyId,
            localPath = localPath,
            prompt = prompt,
            createdAt = System.currentTimeMillis()
        ).also {
            imageDao.insertImage(it)
        }
    }

    override suspend fun saveImage(bitmap: Bitmap, storyId: Long, prompt: String): ImageEntity {
        val fileName = "image_${System.currentTimeMillis()}.jpg"
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
        val localPath = fileStorageManager.saveImage(outputStream.toByteArray(), fileName)

        return ImageEntity(
            storyId = storyId,
            localPath = localPath,
            prompt = prompt,
            createdAt = System.currentTimeMillis()
        ).also {
            imageDao.insertImage(it)
        }
    }

    override suspend fun deleteImage(imageId: Long) {
        val image = imageDao.getImageById(imageId)
        image?.let {
            fileStorageManager.deleteImage(it.localPath)
            imageDao.deleteImage(it)
        }
    }

    suspend fun getImageById(id: Long): ImageEntity? = imageDao.getImageById(id)

    suspend fun deleteImagesForStory(storyId: Long) = imageDao.deleteImagesForStory(storyId)
}
