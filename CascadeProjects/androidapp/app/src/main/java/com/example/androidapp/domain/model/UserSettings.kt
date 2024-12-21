package com.example.androidapp.domain.model

data class UserSettings(
    val offlineModeEnabled: Boolean = false,
    val parentalControlEnabled: Boolean = false,
    val ageRange: String = "4-8",
    val apiKeys: ApiKeys? = null
)

data class ApiKeys(
    val openAiKey: String? = null,
    val mistralKey: String? = null
)
