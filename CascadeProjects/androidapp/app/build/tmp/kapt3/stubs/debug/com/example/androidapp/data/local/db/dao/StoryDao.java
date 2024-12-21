package com.example.androidapp.data.local.db.dao;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\t\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0007\bg\u0018\u00002\u00020\u0001J\u0016\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H\u00a7@\u00a2\u0006\u0002\u0010\u0006J\u0014\u0010\u0007\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\n0\t0\bH\'J\u001c\u0010\u000b\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\n0\t0\b2\u0006\u0010\f\u001a\u00020\rH\'J\u001c\u0010\u000e\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\n0\t0\b2\u0006\u0010\u000f\u001a\u00020\rH\'J\u0018\u0010\u0010\u001a\u0004\u0018\u00010\n2\u0006\u0010\u0004\u001a\u00020\u0005H\u00a7@\u00a2\u0006\u0002\u0010\u0006J\u0016\u0010\u0011\u001a\u00020\u00052\u0006\u0010\u0012\u001a\u00020\nH\u00a7@\u00a2\u0006\u0002\u0010\u0013\u00a8\u0006\u0014"}, d2 = {"Lcom/example/androidapp/data/local/db/dao/StoryDao;", "", "deleteStoryById", "", "id", "", "(JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getAllStories", "Lkotlinx/coroutines/flow/Flow;", "", "Lcom/example/androidapp/data/local/db/entity/StoryEntity;", "getStoriesByAgeRange", "ageRange", "", "getStoriesByTheme", "theme", "getStoryById", "insert", "story", "(Lcom/example/androidapp/data/local/db/entity/StoryEntity;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
@androidx.room.Dao
public abstract interface StoryDao {
    
    @androidx.room.Insert(onConflict = 1)
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object insert(@org.jetbrains.annotations.NotNull
    com.example.androidapp.data.local.db.entity.StoryEntity story, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super java.lang.Long> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM stories ORDER BY createdAt DESC")
    @org.jetbrains.annotations.NotNull
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.data.local.db.entity.StoryEntity>> getAllStories();
    
    @androidx.room.Query(value = "SELECT * FROM stories WHERE id = :id")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getStoryById(long id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.example.androidapp.data.local.db.entity.StoryEntity> $completion);
    
    @androidx.room.Query(value = "DELETE FROM stories WHERE id = :id")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object deleteStoryById(long id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM stories WHERE theme = :theme ORDER BY createdAt DESC")
    @org.jetbrains.annotations.NotNull
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.data.local.db.entity.StoryEntity>> getStoriesByTheme(@org.jetbrains.annotations.NotNull
    java.lang.String theme);
    
    @androidx.room.Query(value = "SELECT * FROM stories WHERE ageRange = :ageRange ORDER BY createdAt DESC")
    @org.jetbrains.annotations.NotNull
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.example.androidapp.data.local.db.entity.StoryEntity>> getStoriesByAgeRange(@org.jetbrains.annotations.NotNull
    java.lang.String ageRange);
}