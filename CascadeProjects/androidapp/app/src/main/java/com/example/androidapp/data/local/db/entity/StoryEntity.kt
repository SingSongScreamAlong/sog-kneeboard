package com.example.androidapp.data.local.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.androidapp.domain.model.Story

@Entity(tableName = "stories")
data class StoryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val content: String,
    val theme: String,
    val ageRange: String,
    val isOfflineGenerated: Boolean,
    val createdAt: Long = System.currentTimeMillis(),
    val lastModified: Long = System.currentTimeMillis()
)

fun StoryEntity.toModel() = Story(
    id = id,
    title = title,
    content = content,
    theme = theme,
    ageRange = ageRange,
    isOfflineGenerated = isOfflineGenerated,
    createdAt = createdAt,
    lastModified = lastModified
)

fun Story.toEntity() = StoryEntity(
    id = id,
    title = title,
    content = content,
    theme = theme,
    ageRange = ageRange,
    isOfflineGenerated = isOfflineGenerated,
    createdAt = createdAt,
    lastModified = lastModified
)
