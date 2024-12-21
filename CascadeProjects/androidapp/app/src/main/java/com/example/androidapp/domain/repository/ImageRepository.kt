package com.example.androidapp.domain.repository

import com.example.androidapp.domain.model.Image
import kotlinx.coroutines.flow.Flow

interface ImageRepository {
    suspend fun generateImage(prompt: String, storyId: Long): Image
    fun getImagesForStory(storyId: Long): Flow<List<Image>>
    suspend fun getImageById(id: Long): Image?
    suspend fun deleteImage(image: Image)
}
