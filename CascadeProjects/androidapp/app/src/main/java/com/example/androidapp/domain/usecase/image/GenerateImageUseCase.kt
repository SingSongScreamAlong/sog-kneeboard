package com.example.androidapp.domain.usecase.image

import com.example.androidapp.data.repository.ImageRepository
import com.example.androidapp.domain.model.Image
import javax.inject.Inject

class GenerateImageUseCase @Inject constructor(
    private val imageRepository: ImageRepository
) {
    suspend operator fun invoke(prompt: String, storyId: Long): Result<Image> = runCatching {
        val imageEntity = imageRepository.generateImage(prompt, storyId)
        Image(
            id = imageEntity.id,
            storyId = imageEntity.storyId,
            localPath = imageEntity.localPath,
            prompt = imageEntity.prompt,
            createdAt = imageEntity.createdAt,
            isGenerated = imageEntity.isGenerated
        )
    }
}
