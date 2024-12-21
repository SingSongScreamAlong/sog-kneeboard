package com.example.androidapp.data.local.db.dao

import androidx.room.*
import com.example.androidapp.data.local.db.entity.StoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(story: StoryEntity): Long

    @Query("SELECT * FROM stories ORDER BY createdAt DESC")
    fun getAllStories(): Flow<List<StoryEntity>>

    @Query("SELECT * FROM stories WHERE id = :id")
    suspend fun getStoryById(id: Long): StoryEntity?

    @Query("DELETE FROM stories WHERE id = :id")
    suspend fun deleteStoryById(id: Long)

    @Query("SELECT * FROM stories WHERE theme = :theme ORDER BY createdAt DESC")
    fun getStoriesByTheme(theme: String): Flow<List<StoryEntity>>

    @Query("SELECT * FROM stories WHERE ageRange = :ageRange ORDER BY createdAt DESC")
    fun getStoriesByAgeRange(ageRange: String): Flow<List<StoryEntity>>
}
