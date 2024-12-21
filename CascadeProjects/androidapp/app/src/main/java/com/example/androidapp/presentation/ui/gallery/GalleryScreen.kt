package com.example.androidapp.presentation.ui.gallery

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.androidapp.presentation.components.ErrorView
import com.example.androidapp.presentation.components.LoadingSpinner

@Composable
fun GalleryScreen(
    storyId: Long,
    onBackClick: () -> Unit,
    viewModel: GalleryViewModel = hiltViewModel()
) {
    LaunchedEffect(storyId) {
        viewModel.loadImages(storyId)
    }

    val uiState by viewModel.uiState.collectAsState()
    var showGenerateDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Story Gallery") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showGenerateDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Generate Image")
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (val state = uiState) {
                is GalleryUiState.Loading -> LoadingSpinner()
                is GalleryUiState.Error -> ErrorView(
                    message = state.message,
                    onRetry = { viewModel.loadImages(storyId) }
                )
                is GalleryUiState.Success -> {
                    LazyVerticalGrid(
                        columns = GridCells.Adaptive(minSize = 160.dp),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.testTag("image_grid")
                    ) {
                        items(state.images) { image ->
                            Card(
                                modifier = Modifier
                                    .aspectRatio(1f)
                                    .fillMaxWidth()
                                    .testTag("image_card"),
                                elevation = 4.dp
                            ) {
                                AsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(image.localPath)
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = image.prompt,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }
                        }
                    }
                }
            }
        }

        if (showGenerateDialog) {
            var prompt by remember { mutableStateOf("") }

            AlertDialog(
                onDismissRequest = { showGenerateDialog = false },
                title = { Text("Generate New Image") },
                text = {
                    OutlinedTextField(
                        value = prompt,
                        onValueChange = { prompt = it },
                        label = { Text("Image Prompt") },
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.generateImage(prompt, storyId)
                            showGenerateDialog = false
                        }
                    ) {
                        Text("Generate")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showGenerateDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}
