package com.example.androidapp.presentation.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag

@Composable
fun LoadingSpinner() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .testTag("loading_spinner"),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}
