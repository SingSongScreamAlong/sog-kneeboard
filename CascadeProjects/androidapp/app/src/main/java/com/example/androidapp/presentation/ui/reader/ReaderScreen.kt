package com.example.androidapp.presentation.ui.reader

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Image
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.androidapp.presentation.components.ErrorView
import com.example.androidapp.presentation.components.LoadingSpinner

@Composable
fun ReaderScreen(
    storyId: Long,
    onBackClick: () -> Unit,
    onGalleryClick: () -> Unit,
    viewModel: ReaderViewModel = hiltViewModel()
) {
    LaunchedEffect(storyId) {
        viewModel.loadStory(storyId)
    }

    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Story Reader") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onGalleryClick) {
                        Icon(Icons.Default.Image, contentDescription = "Gallery")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (val state = uiState) {
                is ReaderUiState.Loading -> LoadingSpinner()
                is ReaderUiState.Error -> ErrorView(
                    message = state.message,
                    onRetry = { viewModel.loadStory(storyId) }
                )
                is ReaderUiState.Success -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Text(
                            text = state.story.title,
                            style = MaterialTheme.typography.h4,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        Text(
                            text = state.story.content,
                            style = MaterialTheme.typography.body1,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            elevation = 4.dp
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Text(
                                    text = "Story Details",
                                    style = MaterialTheme.typography.h6,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                                Text("Theme: ${state.story.theme}")
                                Text("Age Range: ${state.story.ageRange}")
                                if (state.story.isOfflineGenerated) {
                                    Text("Generated Offline")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
