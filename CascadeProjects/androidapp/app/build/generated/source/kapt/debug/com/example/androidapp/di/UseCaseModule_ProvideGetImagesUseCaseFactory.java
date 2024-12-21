package com.example.androidapp.di;

import com.example.androidapp.domain.usecase.image.GetImagesUseCase;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("dagger.hilt.android.scopes.ViewModelScoped")
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class UseCaseModule_ProvideGetImagesUseCaseFactory implements Factory<GetImagesUseCase> {
  private final Provider<GetImagesUseCase> useCaseProvider;

  public UseCaseModule_ProvideGetImagesUseCaseFactory(Provider<GetImagesUseCase> useCaseProvider) {
    this.useCaseProvider = useCaseProvider;
  }

  @Override
  public GetImagesUseCase get() {
    return provideGetImagesUseCase(useCaseProvider.get());
  }

  public static UseCaseModule_ProvideGetImagesUseCaseFactory create(
      Provider<GetImagesUseCase> useCaseProvider) {
    return new UseCaseModule_ProvideGetImagesUseCaseFactory(useCaseProvider);
  }

  public static GetImagesUseCase provideGetImagesUseCase(GetImagesUseCase useCase) {
    return Preconditions.checkNotNullFromProvides(UseCaseModule.INSTANCE.provideGetImagesUseCase(useCase));
  }
}
