package com.example.androidapp.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.androidapp.presentation.ui.gallery.GalleryScreen
import com.example.androidapp.presentation.ui.home.HomeScreen
import com.example.androidapp.presentation.ui.reader.ReaderScreen
import com.example.androidapp.presentation.ui.settings.SettingsScreen

@Composable
fun AppNavigation(
    navController: NavHostController,
    startDestination: String = Screen.Home.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onStoryClick = { storyId ->
                    navController.navigate(Screen.Reader.createRoute(storyId))
                },
                onGalleryClick = { storyId ->
                    navController.navigate(Screen.Gallery.createRoute(storyId))
                },
                onSettingsClick = {
                    navController.navigate(Screen.Settings.route)
                }
            )
        }

        composable(
            route = Screen.Reader.route,
            arguments = listOf(
                navArgument("storyId") {
                    type = NavType.LongType
                }
            )
        ) { backStackEntry ->
            val storyId = backStackEntry.arguments?.getLong("storyId") ?: return@composable
            ReaderScreen(
                storyId = storyId,
                onBackClick = {
                    navController.popBackStack()
                }
            )
        }

        composable(
            route = Screen.Gallery.route,
            arguments = listOf(
                navArgument("storyId") {
                    type = NavType.LongType
                    defaultValue = -1L
                    nullable = false
                }
            )
        ) { backStackEntry ->
            val storyId = backStackEntry.arguments?.getLong("storyId") ?: -1L
            GalleryScreen(
                storyId = storyId,
                onBackClick = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                onBackClick = {
                    navController.popBackStack()
                }
            )
        }
    }
}

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Reader : Screen("reader/{storyId}") {
        fun createRoute(storyId: Long) = "reader/$storyId"
    }
    object Gallery : Screen("gallery?storyId={storyId}") {
        fun createRoute(storyId: Long?) = if (storyId != null) "gallery?storyId=$storyId" else "gallery"
    }
    object Settings : Screen("settings")
}
