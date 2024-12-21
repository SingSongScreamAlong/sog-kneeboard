package com.example.androidapp.data.local.db.dao

import androidx.room.*
import com.example.androidapp.data.local.db.entity.ImageEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ImageDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(image: ImageEntity): Long

    @Query("SELECT * FROM images WHERE storyId = :storyId")
    fun getImagesForStory(storyId: Long): Flow<List<ImageEntity>>

    @Query("SELECT * FROM images WHERE id = :id")
    suspend fun getImageById(id: Long): ImageEntity?

    @Delete
    suspend fun delete(image: ImageEntity)
}
