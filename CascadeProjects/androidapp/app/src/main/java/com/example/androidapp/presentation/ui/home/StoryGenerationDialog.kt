package com.example.androidapp.presentation.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun StoryGenerationDialog(
    onDismiss: () -> Unit,
    onGenerate: (String, String, String) -> Unit
) {
    var prompt by remember { mutableStateOf("") }
    var theme by remember { mutableStateOf("") }
    var ageRange by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = MaterialTheme.shapes.medium,
            color = MaterialTheme.colors.surface
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .fillMaxWidth()
            ) {
                Text(
                    text = "Generate Story",
                    style = MaterialTheme.typography.h6
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = prompt,
                    onValueChange = { prompt = it },
                    label = { Text("Story Prompt") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = theme,
                    onValueChange = { theme = it },
                    label = { Text("Theme") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = ageRange,
                    onValueChange = { ageRange = it },
                    label = { Text("Age Range") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (prompt.isNotBlank() && theme.isNotBlank() && ageRange.isNotBlank()) {
                                onGenerate(prompt, theme, ageRange)
                            }
                        },
                        enabled = prompt.isNotBlank() && theme.isNotBlank() && ageRange.isNotBlank()
                    ) {
                        Text("Generate")
                    }
                }
            }
        }
    }
}
