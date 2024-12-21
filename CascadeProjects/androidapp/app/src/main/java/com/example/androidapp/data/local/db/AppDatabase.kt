package com.example.androidapp.data.local.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.androidapp.data.local.db.dao.ImageDao
import com.example.androidapp.data.local.db.dao.StoryDao
import com.example.androidapp.data.local.db.entity.ImageEntity
import com.example.androidapp.data.local.db.entity.StoryEntity

@Database(
    entities = [
        StoryEntity::class,
        ImageEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun storyDao(): StoryDao
    abstract fun imageDao(): ImageDao

    companion object {
        const val DATABASE_NAME = "storygen_db"
    }
}
