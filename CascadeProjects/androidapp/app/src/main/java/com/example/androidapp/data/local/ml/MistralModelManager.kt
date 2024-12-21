package com.example.androidapp.data.local.ml

import android.content.Context
import com.example.androidapp.data.local.storage.FileStorageManager
import dagger.hilt.android.qualifiers.ApplicationContext
import org.tensorflow.lite.Interpreter
import java.io.File
import java.nio.ByteBuffer
import java.nio.MappedByteBuffer
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MistralModelManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val fileStorageManager: FileStorageManager
) {
    private var interpreter: Interpreter? = null
    private val modelName = "mistral_7b_quantized.tflite"
    private val vocabFile = "mistral_vocab.txt"
    private var vocabulary: Map<String, Int> = emptyMap()

    init {
        loadModel()
        loadVocabulary()
    }

    private fun loadModel() {
        val modelFile = File(fileStorageManager.getModelPath(modelName))
        if (!modelFile.exists()) {
            // Copy from assets
            context.assets.open(modelName).use { input ->
                fileStorageManager.saveModel(input.readBytes(), modelName)
            }
        }
        
        val options = Interpreter.Options()
        options.setNumThreads(4) // Adjust based on device capabilities
        interpreter = Interpreter(modelFile, options)
    }

    private fun loadVocabulary() {
        context.assets.open(vocabFile).bufferedReader().use { reader ->
            vocabulary = reader.lineSequence().withIndex()
                .associate { (index, word) -> word to index }
        }
    }

    fun generateStory(prompt: String, maxLength: Int = 1000): String {
        val inputIds = tokenize(prompt)
        val outputIds = generateSequence(inputIds, maxLength)
        return detokenize(outputIds)
    }

    private fun tokenize(text: String): IntArray {
        // Simple tokenization for demonstration
        return text.split(" ")
            .mapNotNull { vocabulary[it] }
            .toIntArray()
    }

    private fun generateSequence(inputIds: IntArray, maxLength: Int): IntArray {
        val result = mutableListOf<Int>()
        var currentInput = inputIds.toList()

        repeat(maxLength) {
            val nextToken = predict(currentInput.toIntArray())
            if (nextToken == EOS_TOKEN) return result.toIntArray()
            
            result.add(nextToken)
            currentInput = (currentInput + nextToken).takeLast(512) // Keep context window
        }

        return result.toIntArray()
    }

    private fun predict(inputIds: IntArray): Int {
        val inputBuffer = ByteBuffer.allocateDirect(inputIds.size * 4)
        inputIds.forEach { inputBuffer.putInt(it) }
        inputBuffer.rewind()

        val outputBuffer = ByteBuffer.allocateDirect(vocabulary.size * 4)
        interpreter?.run(inputBuffer, outputBuffer)

        // Get the token with highest probability
        outputBuffer.rewind()
        var maxIdx = 0
        var maxProb = Float.NEGATIVE_INFINITY
        repeat(vocabulary.size) { i ->
            val prob = outputBuffer.getFloat()
            if (prob > maxProb) {
                maxProb = prob
                maxIdx = i
            }
        }

        return maxIdx
    }

    private fun detokenize(ids: IntArray): String {
        val reverseVocab = vocabulary.entries.associate { (k, v) -> v to k }
        return ids.joinToString(" ") { reverseVocab[it] ?: "" }
    }

    fun close() {
        interpreter?.close()
        interpreter = null
    }

    companion object {
        private const val EOS_TOKEN = 2 // End of sequence token
    }
}
