package com.example.androidapp.presentation.ui.gallery;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000>\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\t\n\u0002\b\u0002\b\u0007\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0016\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u00112\u0006\u0010\u0012\u001a\u00020\u0013J\u000e\u0010\u0014\u001a\u00020\u000f2\u0006\u0010\u0012\u001a\u00020\u0013R\u0014\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\r\u00a8\u0006\u0015"}, d2 = {"Lcom/example/androidapp/presentation/ui/gallery/GalleryViewModel;", "Landroidx/lifecycle/ViewModel;", "getImagesUseCase", "Lcom/example/androidapp/domain/usecase/image/GetImagesUseCase;", "generateImageUseCase", "Lcom/example/androidapp/domain/usecase/image/GenerateImageUseCase;", "(Lcom/example/androidapp/domain/usecase/image/GetImagesUseCase;Lcom/example/androidapp/domain/usecase/image/GenerateImageUseCase;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/example/androidapp/presentation/ui/gallery/GalleryUiState;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "generateImage", "", "prompt", "", "storyId", "", "loadImages", "app_release"})
@dagger.hilt.android.lifecycle.HiltViewModel
public final class GalleryViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.domain.usecase.image.GetImagesUseCase getImagesUseCase = null;
    @org.jetbrains.annotations.NotNull
    private final com.example.androidapp.domain.usecase.image.GenerateImageUseCase generateImageUseCase = null;
    @org.jetbrains.annotations.NotNull
    private final kotlinx.coroutines.flow.MutableStateFlow<com.example.androidapp.presentation.ui.gallery.GalleryUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull
    private final kotlinx.coroutines.flow.StateFlow<com.example.androidapp.presentation.ui.gallery.GalleryUiState> uiState = null;
    
    @javax.inject.Inject
    public GalleryViewModel(@org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.image.GetImagesUseCase getImagesUseCase, @org.jetbrains.annotations.NotNull
    com.example.androidapp.domain.usecase.image.GenerateImageUseCase generateImageUseCase) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull
    public final kotlinx.coroutines.flow.StateFlow<com.example.androidapp.presentation.ui.gallery.GalleryUiState> getUiState() {
        return null;
    }
    
    public final void loadImages(long storyId) {
    }
    
    public final void generateImage(@org.jetbrains.annotations.NotNull
    java.lang.String prompt, long storyId) {
    }
}