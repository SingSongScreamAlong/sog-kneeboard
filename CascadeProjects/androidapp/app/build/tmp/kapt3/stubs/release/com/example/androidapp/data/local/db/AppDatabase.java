package com.example.androidapp.data.local.db;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u001a\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\b\'\u0018\u0000 \u00072\u00020\u0001:\u0001\u0007B\u0005\u00a2\u0006\u0002\u0010\u0002J\b\u0010\u0003\u001a\u00020\u0004H&J\b\u0010\u0005\u001a\u00020\u0006H&\u00a8\u0006\b"}, d2 = {"Lcom/example/androidapp/data/local/db/AppDatabase;", "Landroidx/room/RoomDatabase;", "()V", "imageDao", "Lcom/example/androidapp/data/local/db/dao/ImageDao;", "storyDao", "Lcom/example/androidapp/data/local/db/dao/StoryDao;", "Companion", "app_release"})
@androidx.room.Database(entities = {com.example.androidapp.data.local.db.entity.StoryEntity.class, com.example.androidapp.data.local.db.entity.ImageEntity.class}, version = 1, exportSchema = true)
public abstract class AppDatabase extends androidx.room.RoomDatabase {
    @org.jetbrains.annotations.NotNull
    public static final java.lang.String DATABASE_NAME = "storygen_db";
    @org.jetbrains.annotations.NotNull
    public static final com.example.androidapp.data.local.db.AppDatabase.Companion Companion = null;
    
    public AppDatabase() {
        super();
    }
    
    @org.jetbrains.annotations.NotNull
    public abstract com.example.androidapp.data.local.db.dao.StoryDao storyDao();
    
    @org.jetbrains.annotations.NotNull
    public abstract com.example.androidapp.data.local.db.dao.ImageDao imageDao();
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0012\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0000\b\u0086\u0003\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002R\u000e\u0010\u0003\u001a\u00020\u0004X\u0086T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0005"}, d2 = {"Lcom/example/androidapp/data/local/db/AppDatabase$Companion;", "", "()V", "DATABASE_NAME", "", "app_release"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
    }
}