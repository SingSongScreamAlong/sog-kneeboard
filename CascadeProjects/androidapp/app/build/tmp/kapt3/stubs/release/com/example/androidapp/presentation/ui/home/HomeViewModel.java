package com.example.androidapp.presentation.ui.home;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000B\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\t\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0004\b\u0007\u0018\u00002\u00020\u0001B\u001f\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u00a2\u0006\u0002\u0010\bJ\u000e\u0010\u0011\u001a\u00020\u00122\u0006\u0010\u0013\u001a\u00020\u0014J\u001e\u0010\u0015\u001a\u00020\u00122\u0006\u0010\u0016\u001a\u00020\u00172\u0006\u0010\u0018\u001a\u00020\u00172\u0006\u0010\u0019\u001a\u00020\u0017J\b\u0010\u001a\u001a\u00020\u0012H\u0002R\u0014\u0010\t\u001a\b\u0012\u0004\u0012\u00020\u000b0\nX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0010\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0004\n\u0002\u0010\fR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\r\u001a\b\u0012\u0004\u0012\u00020\u000b0\u000e\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000f\u0010\u0010\u00a8\u0006\u001b"}, d2 = {"Lcom/example/androidapp/presentation/ui/home/HomeViewModel;", "Landroidx/lifecycle/ViewModel;", "generateStoryUseCase", "Lcom/example/androidapp/domain/usecase/story/GenerateStoryUseCase;", "getStoriesUseCase", "Lcom/example/androidapp/domain/usecase/story/GetStoriesUseCase;", "deleteStoryUseCase", "error/NonExistentClass", "(Lcom/example/androidapp/domain/usecase/story/GenerateStoryUseCase;Lcom/example/androidapp/domain/usecase/story/GetStoriesUseCase;Lerror/NonExistentClass;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/example/androidapp/presentation/ui/home/HomeUiState;", "Lerror/NonExistentClass;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "deleteStory", "", "storyId", "", "generateStory", "prompt", "", "theme", "ageRange", "loadStories", "app_release"})
@dagger.hilt.android.lifecycle.HiltViewModel
public final class HomeViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.domain.usecase.story.GenerateStoryUseCase generateStoryUseCase = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.domain.usecase.story.GetStoriesUseCase getStoriesUseCase = null;
    @org.jetbrains.annotations.NotNull
    private final error.NonExistentClass deleteStoryUseCase = null;
    @org.jetbrains.annotations.NotNull
    private final kotlinx.coroutines.flow.MutableStateFlow<com.example.androidapp.presentation.ui.home.HomeUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull
    private final kotlinx.coroutines.flow.StateFlow<com.example.androidapp.presentation.ui.home.HomeUiState> uiState = null;
    
    @javax.inject.Inject
    public HomeViewModel(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.story.GenerateStoryUseCase generateStoryUseCase, @org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.story.GetStoriesUseCase getStoriesUseCase, @org.jetbrains.annotations.NotNull
    error.NonExistentClass deleteStoryUseCase) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull
    public final kotlinx.coroutines.flow.StateFlow<com.example.androidapp.presentation.ui.home.HomeUiState> getUiState() {
        return null;
    }
    
    private final void loadStories() {
    }
    
    public final void generateStory(@org.jetbrains.annotations.NotNull
    java.lang.String prompt, @org.jetbrains.annotations.NotNull
    java.lang.String theme, @org.jetbrains.annotations.NotNull
    java.lang.String ageRange) {
    }
    
    public final void deleteStory(long storyId) {
    }
}