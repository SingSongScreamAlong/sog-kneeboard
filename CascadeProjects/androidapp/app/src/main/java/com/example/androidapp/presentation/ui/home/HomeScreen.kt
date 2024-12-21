package com.example.androidapp.presentation.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Settings
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onStoryClick: (Long) -> Unit,
    onGalleryClick: (Long) -> Unit,
    onSettingsClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var showGenerationDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Story Generator") },
                actions = {
                    IconButton(onClick = onSettingsClick) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showGenerationDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Generate Story")
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (uiState) {
                is HomeUiState.Loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is HomeUiState.Error -> {
                    Text(
                        text = (uiState as HomeUiState.Error).message,
                        color = MaterialTheme.colors.error,
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(16.dp)
                    )
                }
                is HomeUiState.Success -> {
                    val stories = (uiState as HomeUiState.Success).stories
                    if (stories.isEmpty()) {
                        Text(
                            text = "No stories yet. Click + to create one!",
                            modifier = Modifier
                                .align(Alignment.Center)
                                .padding(16.dp)
                        )
                    } else {
                        StoryList(
                            stories = stories,
                            onStoryClick = onStoryClick,
                            onGalleryClick = onGalleryClick,
                            onDeleteClick = { viewModel.deleteStory(it) }
                        )
                    }
                }
            }

            if (showGenerationDialog) {
                StoryGenerationDialog(
                    onDismiss = { showGenerationDialog = false },
                    onGenerate = { prompt, theme, ageRange ->
                        viewModel.generateStory(prompt, theme, ageRange)
                        showGenerationDialog = false
                    }
                )
            }
        }
    }
}
