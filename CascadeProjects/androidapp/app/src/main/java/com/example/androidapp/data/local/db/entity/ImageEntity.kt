package com.example.androidapp.data.local.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.androidapp.domain.model.Image

@Entity(tableName = "images")
data class ImageEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val url: String,
    val storyId: Long,
    val prompt: String,
    val isOfflineGenerated: Boolean,
    val createdAt: Long = System.currentTimeMillis()
)

fun ImageEntity.toModel() = Image(
    id = id,
    url = url,
    storyId = storyId,
    prompt = prompt,
    isOfflineGenerated = isOfflineGenerated,
    createdAt = createdAt
)

fun Image.toEntity() = ImageEntity(
    id = id,
    url = url,
    storyId = storyId,
    prompt = prompt,
    isOfflineGenerated = isOfflineGenerated,
    createdAt = createdAt
)
