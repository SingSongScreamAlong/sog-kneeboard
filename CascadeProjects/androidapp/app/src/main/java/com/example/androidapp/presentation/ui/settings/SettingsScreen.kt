package com.example.androidapp.presentation.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.androidapp.domain.model.ApiKeys
import com.example.androidapp.domain.model.UserSettings
import com.example.androidapp.presentation.components.ErrorView
import com.example.androidapp.presentation.components.LoadingSpinner

@Composable
fun SettingsScreen(
    onBackClick: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var openAiKey by remember { mutableStateOf(uiState.apiKeys?.openAiKey.orEmpty()) }
    var showSaveDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (val state = uiState) {
                is SettingsUiState.Loading -> LoadingSpinner()
                is SettingsUiState.Error -> ErrorView(
                    message = state.message,
                    onRetry = { /* Implement retry logic */ }
                )
                is SettingsUiState.Success -> {
                    var settings by remember { mutableStateOf(state.settings) }
                    var showApiKeyDialog by remember { mutableStateOf(false) }

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Age Range",
                            style = MaterialTheme.typography.h6,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            listOf("4-8", "9-12", "13-16").forEach { range ->
                                OutlinedButton(
                                    onClick = {
                                        settings = settings.copy(ageRange = range)
                                        viewModel.updateSettings(settings)
                                    },
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        contentColor = if (settings.ageRange == range) {
                                            MaterialTheme.colors.primary
                                        } else {
                                            MaterialTheme.colors.onSurface
                                        }
                                    )
                                ) {
                                    Text(range)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Parental Controls")
                            Switch(
                                checked = settings.parentalControlEnabled,
                                onCheckedChange = {
                                    settings = settings.copy(parentalControlEnabled = it)
                                    viewModel.updateSettings(settings)
                                }
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Offline Mode")
                            Switch(
                                checked = settings.offlineModeEnabled,
                                onCheckedChange = {
                                    settings = settings.copy(offlineModeEnabled = it)
                                    viewModel.updateSettings(settings)
                                }
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Button(
                            onClick = { showApiKeyDialog = true },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Configure API Keys")
                        }

                        OutlinedTextField(
                            value = openAiKey,
                            onValueChange = { openAiKey = it },
                            label = { Text("OpenAI API Key") },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                viewModel.saveApiKeys(openAiKey)
                                showSaveDialog = true
                            },
                            modifier = Modifier.align(Alignment.End)
                        ) {
                            Text("Save")
                        }
                    }

                    if (showApiKeyDialog) {
                        var mistralKey by remember { mutableStateOf(settings.apiKeys.mistralKey ?: "") }

                        AlertDialog(
                            onDismissRequest = { showApiKeyDialog = false },
                            title = { Text("API Keys") },
                            text = {
                                Column {
                                    OutlinedTextField(
                                        value = openAiKey,
                                        onValueChange = { openAiKey = it },
                                        label = { Text("OpenAI API Key") },
                                        visualTransformation = PasswordVisualTransformation(),
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    OutlinedTextField(
                                        value = mistralKey,
                                        onValueChange = { mistralKey = it },
                                        label = { Text("Mistral API Key") },
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }
                            },
                            confirmButton = {
                                Button(
                                    onClick = {
                                        settings = settings.copy(
                                            apiKeys = ApiKeys(
                                                openAiKey = openAiKey.takeIf { it.isNotBlank() },
                                                mistralKey = mistralKey.takeIf { it.isNotBlank() }
                                            )
                                        )
                                        viewModel.updateSettings(settings)
                                        showApiKeyDialog = false
                                    }
                                ) {
                                    Text("Save")
                                }
                            },
                            dismissButton = {
                                TextButton(onClick = { showApiKeyDialog = false }) {
                                    Text("Cancel")
                                }
                            }
                        )
                    }

                    if (showSaveDialog) {
                        AlertDialog(
                            onDismissRequest = { showSaveDialog = false },
                            title = { Text("Settings Saved") },
                            text = { Text("Your API keys have been saved successfully.") },
                            confirmButton = {
                                TextButton(onClick = { showSaveDialog = false }) {
                                    Text("OK")
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}
