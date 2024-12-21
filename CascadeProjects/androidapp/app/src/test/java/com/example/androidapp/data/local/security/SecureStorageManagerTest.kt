package com.example.androidapp.data.local.security

import android.content.Context
import io.mockk.mockk
import org.junit.Before
import org.junit.Test
import kotlin.test.assertEquals

class SecureStorageManagerTest {
    private lateinit var context: Context
    private lateinit var secureStorageManager: SecureStorageManager

    @Before
    fun setup() {
        context = mockk(relaxed = true)
        secureStorageManager = SecureStorageManager(context)
    }

    @Test
    fun `test ApiKeyType enum values`() {
        assertEquals("mistral_api_key", SecureStorageManager.ApiKeyType.MISTRAL.key)
        assertEquals("openai_api_key", SecureStorageManager.ApiKeyType.OPENAI.key)
    }
}
