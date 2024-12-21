package com.example.androidapp.presentation.ui.settings;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00008\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\b\u0007\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\b\u0010\u000e\u001a\u00020\u000fH\u0002J\u000e\u0010\u0010\u001a\u00020\u000f2\u0006\u0010\u0011\u001a\u00020\u0012R\u0014\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\rR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0013"}, d2 = {"Lcom/example/androidapp/presentation/ui/settings/SettingsViewModel;", "Landroidx/lifecycle/ViewModel;", "getUserSettingsUseCase", "Lcom/example/androidapp/domain/usecase/settings/GetUserSettingsUseCase;", "updateUserSettingsUseCase", "Lcom/example/androidapp/domain/usecase/settings/UpdateUserSettingsUseCase;", "(Lcom/example/androidapp/domain/usecase/settings/GetUserSettingsUseCase;Lcom/example/androidapp/domain/usecase/settings/UpdateUserSettingsUseCase;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/example/androidapp/presentation/ui/settings/SettingsUiState;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "loadSettings", "", "updateSettings", "settings", "Lcom/example/androidapp/domain/model/UserSettings;", "app_debug"})
@dagger.hilt.android.lifecycle.HiltViewModel
public final class SettingsViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.domain.usecase.settings.GetUserSettingsUseCase getUserSettingsUseCase = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.domain.usecase.settings.UpdateUserSettingsUseCase updateUserSettingsUseCase = null;
    @org.jetbrains.annotations.NotNull
    private final kotlinx.coroutines.flow.MutableStateFlow<com.example.androidapp.presentation.ui.settings.SettingsUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull
    private final kotlinx.coroutines.flow.StateFlow<com.example.androidapp.presentation.ui.settings.SettingsUiState> uiState = null;
    
    @javax.inject.Inject
    public SettingsViewModel(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.settings.GetUserSettingsUseCase getUserSettingsUseCase, @org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.settings.UpdateUserSettingsUseCase updateUserSettingsUseCase) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull
    public final kotlinx.coroutines.flow.StateFlow<com.example.androidapp.presentation.ui.settings.SettingsUiState> getUiState() {
        return null;
    }
    
    private final void loadSettings() {
    }
    
    public final void updateSettings(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.model.UserSettings settings) {
    }
}