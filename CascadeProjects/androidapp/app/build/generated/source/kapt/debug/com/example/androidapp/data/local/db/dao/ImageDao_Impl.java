package com.example.androidapp.data.local.db.dao;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityDeletionOrUpdateAdapter;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import com.example.androidapp.data.local.db.entity.ImageEntity;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Long;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import kotlinx.coroutines.flow.Flow;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class ImageDao_Impl implements ImageDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<ImageEntity> __insertionAdapterOfImageEntity;

  private final EntityDeletionOrUpdateAdapter<ImageEntity> __deletionAdapterOfImageEntity;

  public ImageDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfImageEntity = new EntityInsertionAdapter<ImageEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `images` (`id`,`url`,`storyId`,`prompt`,`isOfflineGenerated`,`createdAt`) VALUES (nullif(?, 0),?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final ImageEntity entity) {
        statement.bindLong(1, entity.getId());
        if (entity.getUrl() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getUrl());
        }
        statement.bindLong(3, entity.getStoryId());
        if (entity.getPrompt() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getPrompt());
        }
        final int _tmp = entity.isOfflineGenerated() ? 1 : 0;
        statement.bindLong(5, _tmp);
        statement.bindLong(6, entity.getCreatedAt());
      }
    };
    this.__deletionAdapterOfImageEntity = new EntityDeletionOrUpdateAdapter<ImageEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "DELETE FROM `images` WHERE `id` = ?";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final ImageEntity entity) {
        statement.bindLong(1, entity.getId());
      }
    };
  }

  @Override
  public Object insert(final ImageEntity image, final Continuation<? super Long> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Long>() {
      @Override
      @NonNull
      public Long call() throws Exception {
        __db.beginTransaction();
        try {
          final Long _result = __insertionAdapterOfImageEntity.insertAndReturnId(image);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object delete(final ImageEntity image, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __deletionAdapterOfImageEntity.handle(image);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<ImageEntity>> getImagesForStory(final long storyId) {
    final String _sql = "SELECT * FROM images WHERE storyId = ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, storyId);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"images"}, new Callable<List<ImageEntity>>() {
      @Override
      @NonNull
      public List<ImageEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfUrl = CursorUtil.getColumnIndexOrThrow(_cursor, "url");
          final int _cursorIndexOfStoryId = CursorUtil.getColumnIndexOrThrow(_cursor, "storyId");
          final int _cursorIndexOfPrompt = CursorUtil.getColumnIndexOrThrow(_cursor, "prompt");
          final int _cursorIndexOfIsOfflineGenerated = CursorUtil.getColumnIndexOrThrow(_cursor, "isOfflineGenerated");
          final int _cursorIndexOfCreatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "createdAt");
          final List<ImageEntity> _result = new ArrayList<ImageEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final ImageEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpUrl;
            if (_cursor.isNull(_cursorIndexOfUrl)) {
              _tmpUrl = null;
            } else {
              _tmpUrl = _cursor.getString(_cursorIndexOfUrl);
            }
            final long _tmpStoryId;
            _tmpStoryId = _cursor.getLong(_cursorIndexOfStoryId);
            final String _tmpPrompt;
            if (_cursor.isNull(_cursorIndexOfPrompt)) {
              _tmpPrompt = null;
            } else {
              _tmpPrompt = _cursor.getString(_cursorIndexOfPrompt);
            }
            final boolean _tmpIsOfflineGenerated;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsOfflineGenerated);
            _tmpIsOfflineGenerated = _tmp != 0;
            final long _tmpCreatedAt;
            _tmpCreatedAt = _cursor.getLong(_cursorIndexOfCreatedAt);
            _item = new ImageEntity(_tmpId,_tmpUrl,_tmpStoryId,_tmpPrompt,_tmpIsOfflineGenerated,_tmpCreatedAt);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Object getImageById(final long id, final Continuation<? super ImageEntity> $completion) {
    final String _sql = "SELECT * FROM images WHERE id = ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, id);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<ImageEntity>() {
      @Override
      @Nullable
      public ImageEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfUrl = CursorUtil.getColumnIndexOrThrow(_cursor, "url");
          final int _cursorIndexOfStoryId = CursorUtil.getColumnIndexOrThrow(_cursor, "storyId");
          final int _cursorIndexOfPrompt = CursorUtil.getColumnIndexOrThrow(_cursor, "prompt");
          final int _cursorIndexOfIsOfflineGenerated = CursorUtil.getColumnIndexOrThrow(_cursor, "isOfflineGenerated");
          final int _cursorIndexOfCreatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "createdAt");
          final ImageEntity _result;
          if (_cursor.moveToFirst()) {
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpUrl;
            if (_cursor.isNull(_cursorIndexOfUrl)) {
              _tmpUrl = null;
            } else {
              _tmpUrl = _cursor.getString(_cursorIndexOfUrl);
            }
            final long _tmpStoryId;
            _tmpStoryId = _cursor.getLong(_cursorIndexOfStoryId);
            final String _tmpPrompt;
            if (_cursor.isNull(_cursorIndexOfPrompt)) {
              _tmpPrompt = null;
            } else {
              _tmpPrompt = _cursor.getString(_cursorIndexOfPrompt);
            }
            final boolean _tmpIsOfflineGenerated;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsOfflineGenerated);
            _tmpIsOfflineGenerated = _tmp != 0;
            final long _tmpCreatedAt;
            _tmpCreatedAt = _cursor.getLong(_cursorIndexOfCreatedAt);
            _result = new ImageEntity(_tmpId,_tmpUrl,_tmpStoryId,_tmpPrompt,_tmpIsOfflineGenerated,_tmpCreatedAt);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
