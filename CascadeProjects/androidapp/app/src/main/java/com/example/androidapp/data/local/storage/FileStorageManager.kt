package com.example.androidapp.data.local.storage

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FileStorageManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val baseDir: File
        get() = context.filesDir

    private val imageDir: File
        get() = File(baseDir, "images").apply { mkdirs() }

    private val modelDir: File
        get() = File(baseDir, "models").apply { mkdirs() }

    private val tempDir: File
        get() = File(baseDir, "temp").apply { mkdirs() }

    suspend fun saveImage(imageBytes: ByteArray, fileName: String): String = withContext(Dispatchers.IO) {
        val file = File(imageDir, fileName)
        FileOutputStream(file).use { outputStream ->
            outputStream.write(imageBytes)
        }
        file.absolutePath
    }

    suspend fun loadImage(fileName: String): Bitmap? = withContext(Dispatchers.IO) {
        val file = File(imageDir, fileName)
        if (file.exists()) {
            BitmapFactory.decodeFile(file.absolutePath)
        } else {
            null
        }
    }

    suspend fun saveModel(modelBytes: ByteArray, fileName: String): String = withContext(Dispatchers.IO) {
        val file = File(modelDir, fileName)
        FileOutputStream(file).use { outputStream ->
            outputStream.write(modelBytes)
        }
        file.absolutePath
    }

    suspend fun deleteImage(fileName: String) = withContext(Dispatchers.IO) {
        val file = File(imageDir, fileName)
        if (file.exists()) {
            file.delete()
        }
    }

    suspend fun clearTempFiles() = withContext(Dispatchers.IO) {
        tempDir.listFiles()?.forEach { it.delete() }
    }

    fun getImagePath(fileName: String): String {
        return File(imageDir, fileName).absolutePath
    }

    fun getModelPath(fileName: String): String {
        return File(modelDir, fileName).absolutePath
    }
}
