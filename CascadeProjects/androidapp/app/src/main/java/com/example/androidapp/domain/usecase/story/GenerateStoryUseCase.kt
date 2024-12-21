package com.example.androidapp.domain.usecase.story

import com.example.androidapp.data.local.datastore.UserPreferences
import com.example.androidapp.data.local.ml.MistralModelManager
import com.example.androidapp.data.repository.StoryRepository
import com.example.androidapp.domain.model.Story
import com.example.androidapp.domain.model.StoryTemplates
import com.example.androidapp.domain.usecase.image.GenerateImageUseCase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import javax.inject.Inject

class GenerateStoryUseCase @Inject constructor(
    private val storyRepository: StoryRepository,
    private val userPreferences: UserPreferences,
    private val mistralModelManager: MistralModelManager,
    private val generateImageUseCase: GenerateImageUseCase
) {
    suspend operator fun invoke(prompt: String, theme: String): Result<Story> = withContext(Dispatchers.IO) {
        try {
            val settings = userPreferences.getUserSettings().first()
            
            val story = if (settings.offlineModeEnabled) {
                generateOfflineStory(prompt, theme, settings.ageRange)
            } else {
                generateOnlineStory(prompt, theme, settings.ageRange)
            }

            // Generate images based on the template
            val template = StoryTemplates.templates.find { it.theme == theme }
            template?.let { generateImagesForStory(it, story.id) }
            
            Result.success(story)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun generateOfflineStory(prompt: String, theme: String, ageRange: String): Story {
        val fullPrompt = buildPrompt(prompt, theme, ageRange)
        val content = mistralModelManager.generateStory(fullPrompt)
        
        return Story(
            id = System.currentTimeMillis(),
            title = extractTitle(content),
            content = content,
            theme = theme,
            ageRange = ageRange,
            isOfflineGenerated = true
        )
    }

    private suspend fun generateOnlineStory(prompt: String, theme: String, ageRange: String): Story {
        return storyRepository.generateStory(prompt, theme, ageRange)
    }

    private suspend fun generateImagesForStory(template: StoryTemplate, storyId: Long) {
        template.imagePrompts.forEach { prompt ->
            try {
                generateImageUseCase(prompt, storyId)
            } catch (e: Exception) {
                // Log error but don't fail the story generation
                e.printStackTrace()
            }
        }
    }

    private fun buildPrompt(prompt: String, theme: String, ageRange: String): String {
        return """
            Generate a children's story with the following criteria:
            - Age range: $ageRange years old
            - Theme: $theme
            - Story elements: $prompt
            
            The story should be engaging, age-appropriate, and educational.
            Include a clear title at the beginning.
            Include dialogue and descriptive language suitable for children.
            End with a positive message or lesson.
            
            Story:
        """.trimIndent()
    }

    private fun extractTitle(content: String): String {
        return content.lines()
            .firstOrNull { it.isNotBlank() }
            ?.trim()
            ?: "Untitled Story"
    }
}
