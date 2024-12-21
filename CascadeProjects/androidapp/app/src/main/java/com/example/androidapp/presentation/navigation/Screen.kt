package com.example.androidapp.presentation.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Reader : Screen("reader/{storyId}") {
        fun createRoute(storyId: Long) = "reader/$storyId"
    }
    object Gallery : Screen("gallery/{storyId}") {
        fun createRoute(storyId: Long) = "gallery/$storyId"
    }
    object Settings : Screen("settings")
}
