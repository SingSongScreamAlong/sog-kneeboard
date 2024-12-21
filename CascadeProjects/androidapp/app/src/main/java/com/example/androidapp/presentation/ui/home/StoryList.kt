package com.example.androidapp.presentation.ui.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Image
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.androidapp.domain.model.Story

@Composable
fun StoryList(
    stories: List<Story>,
    onStoryClick: (Long) -> Unit,
    onGalleryClick: (Long) -> Unit,
    onDeleteClick: (Long) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(stories) { story ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onStoryClick(story.id) },
                elevation = 4.dp
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = story.title,
                            style = MaterialTheme.typography.h6
                        )
                        Row {
                            IconButton(onClick = { onGalleryClick(story.id) }) {
                                Icon(
                                    imageVector = Icons.Default.Image,
                                    contentDescription = "View Gallery"
                                )
                            }
                            IconButton(onClick = { onDeleteClick(story.id) }) {
                                Icon(
                                    imageVector = Icons.Default.Delete,
                                    contentDescription = "Delete Story"
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Theme: ${story.theme}",
                        style = MaterialTheme.typography.body2
                    )
                    Text(
                        text = "Age Range: ${story.ageRange}",
                        style = MaterialTheme.typography.body2
                    )
                }
            }
        }
    }
}
