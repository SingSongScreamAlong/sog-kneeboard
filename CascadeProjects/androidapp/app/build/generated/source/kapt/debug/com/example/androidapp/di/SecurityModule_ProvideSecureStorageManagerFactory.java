package com.example.androidapp.di;

import com.example.androidapp.data.local.security.SecureStorageManager;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
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
public final class SecurityModule_ProvideSecureStorageManagerFactory implements Factory<SecureStorageManager> {
  private final Provider<SecureStorageManager> secureStorageManagerProvider;

  public SecurityModule_ProvideSecureStorageManagerFactory(
      Provider<SecureStorageManager> secureStorageManagerProvider) {
    this.secureStorageManagerProvider = secureStorageManagerProvider;
  }

  @Override
  public SecureStorageManager get() {
    return provideSecureStorageManager(secureStorageManagerProvider.get());
  }

  public static SecurityModule_ProvideSecureStorageManagerFactory create(
      Provider<SecureStorageManager> secureStorageManagerProvider) {
    return new SecurityModule_ProvideSecureStorageManagerFactory(secureStorageManagerProvider);
  }

  public static SecureStorageManager provideSecureStorageManager(
      SecureStorageManager secureStorageManager) {
    return Preconditions.checkNotNullFromProvides(SecurityModule.INSTANCE.provideSecureStorageManager(secureStorageManager));
  }
}
