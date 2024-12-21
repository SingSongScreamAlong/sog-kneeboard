package com.example.androidapp.data.local.db.dao;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import com.example.androidapp.data.local.db.entity.StoryEntity;
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
public final class StoryDao_Impl implements StoryDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<StoryEntity> __insertionAdapterOfStoryEntity;

  private final SharedSQLiteStatement __preparedStmtOfDeleteStoryById;

  public StoryDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfStoryEntity = new EntityInsertionAdapter<StoryEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `stories` (`id`,`title`,`content`,`theme`,`ageRange`,`isOfflineGenerated`,`createdAt`,`lastModified`) VALUES (nullif(?, 0),?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final StoryEntity entity) {
        statement.bindLong(1, entity.getId());
        if (entity.getTitle() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getTitle());
        }
        if (entity.getContent() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getContent());
        }
        if (entity.getTheme() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getTheme());
        }
        if (entity.getAgeRange() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getAgeRange());
        }
        final int _tmp = entity.isOfflineGenerated() ? 1 : 0;
        statement.bindLong(6, _tmp);
        statement.bindLong(7, entity.getCreatedAt());
        statement.bindLong(8, entity.getLastModified());
      }
    };
    this.__preparedStmtOfDeleteStoryById = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM stories WHERE id = ?";
        return _query;
      }
    };
  }

  @Override
  public Object insert(final StoryEntity story, final Continuation<? super Long> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Long>() {
      @Override
      @NonNull
      public Long call() throws Exception {
        __db.beginTransaction();
        try {
          final Long _result = __insertionAdapterOfStoryEntity.insertAndReturnId(story);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object deleteStoryById(final long id, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfDeleteStoryById.acquire();
        int _argIndex = 1;
        _stmt.bindLong(_argIndex, id);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfDeleteStoryById.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<StoryEntity>> getAllStories() {
    final String _sql = "SELECT * FROM stories ORDER BY createdAt DESC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"stories"}, new Callable<List<StoryEntity>>() {
      @Override
      @NonNull
      public List<StoryEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfTitle = CursorUtil.getColumnIndexOrThrow(_cursor, "title");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfTheme = CursorUtil.getColumnIndexOrThrow(_cursor, "theme");
          final int _cursorIndexOfAgeRange = CursorUtil.getColumnIndexOrThrow(_cursor, "ageRange");
          final int _cursorIndexOfIsOfflineGenerated = CursorUtil.getColumnIndexOrThrow(_cursor, "isOfflineGenerated");
          final int _cursorIndexOfCreatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "createdAt");
          final int _cursorIndexOfLastModified = CursorUtil.getColumnIndexOrThrow(_cursor, "lastModified");
          final List<StoryEntity> _result = new ArrayList<StoryEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final StoryEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpTitle;
            if (_cursor.isNull(_cursorIndexOfTitle)) {
              _tmpTitle = null;
            } else {
              _tmpTitle = _cursor.getString(_cursorIndexOfTitle);
            }
            final String _tmpContent;
            if (_cursor.isNull(_cursorIndexOfContent)) {
              _tmpContent = null;
            } else {
              _tmpContent = _cursor.getString(_cursorIndexOfContent);
            }
            final String _tmpTheme;
            if (_cursor.isNull(_cursorIndexOfTheme)) {
              _tmpTheme = null;
            } else {
              _tmpTheme = _cursor.getString(_cursorIndexOfTheme);
            }
            final String _tmpAgeRange;
            if (_cursor.isNull(_cursorIndexOfAgeRange)) {
              _tmpAgeRange = null;
            } else {
              _tmpAgeRange = _cursor.getString(_cursorIndexOfAgeRange);
            }
            final boolean _tmpIsOfflineGenerated;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsOfflineGenerated);
            _tmpIsOfflineGenerated = _tmp != 0;
            final long _tmpCreatedAt;
            _tmpCreatedAt = _cursor.getLong(_cursorIndexOfCreatedAt);
            final long _tmpLastModified;
            _tmpLastModified = _cursor.getLong(_cursorIndexOfLastModified);
            _item = new StoryEntity(_tmpId,_tmpTitle,_tmpContent,_tmpTheme,_tmpAgeRange,_tmpIsOfflineGenerated,_tmpCreatedAt,_tmpLastModified);
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
  public Object getStoryById(final long id, final Continuation<? super StoryEntity> $completion) {
    final String _sql = "SELECT * FROM stories WHERE id = ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, id);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<StoryEntity>() {
      @Override
      @Nullable
      public StoryEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfTitle = CursorUtil.getColumnIndexOrThrow(_cursor, "title");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfTheme = CursorUtil.getColumnIndexOrThrow(_cursor, "theme");
          final int _cursorIndexOfAgeRange = CursorUtil.getColumnIndexOrThrow(_cursor, "ageRange");
          final int _cursorIndexOfIsOfflineGenerated = CursorUtil.getColumnIndexOrThrow(_cursor, "isOfflineGenerated");
          final int _cursorIndexOfCreatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "createdAt");
          final int _cursorIndexOfLastModified = CursorUtil.getColumnIndexOrThrow(_cursor, "lastModified");
          final StoryEntity _result;
          if (_cursor.moveToFirst()) {
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpTitle;
            if (_cursor.isNull(_cursorIndexOfTitle)) {
              _tmpTitle = null;
            } else {
              _tmpTitle = _cursor.getString(_cursorIndexOfTitle);
            }
            final String _tmpContent;
            if (_cursor.isNull(_cursorIndexOfContent)) {
              _tmpContent = null;
            } else {
              _tmpContent = _cursor.getString(_cursorIndexOfContent);
            }
            final String _tmpTheme;
            if (_cursor.isNull(_cursorIndexOfTheme)) {
              _tmpTheme = null;
            } else {
              _tmpTheme = _cursor.getString(_cursorIndexOfTheme);
            }
            final String _tmpAgeRange;
            if (_cursor.isNull(_cursorIndexOfAgeRange)) {
              _tmpAgeRange = null;
            } else {
              _tmpAgeRange = _cursor.getString(_cursorIndexOfAgeRange);
            }
            final boolean _tmpIsOfflineGenerated;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsOfflineGenerated);
            _tmpIsOfflineGenerated = _tmp != 0;
            final long _tmpCreatedAt;
            _tmpCreatedAt = _cursor.getLong(_cursorIndexOfCreatedAt);
            final long _tmpLastModified;
            _tmpLastModified = _cursor.getLong(_cursorIndexOfLastModified);
            _result = new StoryEntity(_tmpId,_tmpTitle,_tmpContent,_tmpTheme,_tmpAgeRange,_tmpIsOfflineGenerated,_tmpCreatedAt,_tmpLastModified);
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

  @Override
  public Flow<List<StoryEntity>> getStoriesByTheme(final String theme) {
    final String _sql = "SELECT * FROM stories WHERE theme = ? ORDER BY createdAt DESC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    if (theme == null) {
      _statement.bindNull(_argIndex);
    } else {
      _statement.bindString(_argIndex, theme);
    }
    return CoroutinesRoom.createFlow(__db, false, new String[] {"stories"}, new Callable<List<StoryEntity>>() {
      @Override
      @NonNull
      public List<StoryEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfTitle = CursorUtil.getColumnIndexOrThrow(_cursor, "title");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfTheme = CursorUtil.getColumnIndexOrThrow(_cursor, "theme");
          final int _cursorIndexOfAgeRange = CursorUtil.getColumnIndexOrThrow(_cursor, "ageRange");
          final int _cursorIndexOfIsOfflineGenerated = CursorUtil.getColumnIndexOrThrow(_cursor, "isOfflineGenerated");
          final int _cursorIndexOfCreatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "createdAt");
          final int _cursorIndexOfLastModified = CursorUtil.getColumnIndexOrThrow(_cursor, "lastModified");
          final List<StoryEntity> _result = new ArrayList<StoryEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final StoryEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpTitle;
            if (_cursor.isNull(_cursorIndexOfTitle)) {
              _tmpTitle = null;
            } else {
              _tmpTitle = _cursor.getString(_cursorIndexOfTitle);
            }
            final String _tmpContent;
            if (_cursor.isNull(_cursorIndexOfContent)) {
              _tmpContent = null;
            } else {
              _tmpContent = _cursor.getString(_cursorIndexOfContent);
            }
            final String _tmpTheme;
            if (_cursor.isNull(_cursorIndexOfTheme)) {
              _tmpTheme = null;
            } else {
              _tmpTheme = _cursor.getString(_cursorIndexOfTheme);
            }
            final String _tmpAgeRange;
            if (_cursor.isNull(_cursorIndexOfAgeRange)) {
              _tmpAgeRange = null;
            } else {
              _tmpAgeRange = _cursor.getString(_cursorIndexOfAgeRange);
            }
            final boolean _tmpIsOfflineGenerated;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsOfflineGenerated);
            _tmpIsOfflineGenerated = _tmp != 0;
            final long _tmpCreatedAt;
            _tmpCreatedAt = _cursor.getLong(_cursorIndexOfCreatedAt);
            final long _tmpLastModified;
            _tmpLastModified = _cursor.getLong(_cursorIndexOfLastModified);
            _item = new StoryEntity(_tmpId,_tmpTitle,_tmpContent,_tmpTheme,_tmpAgeRange,_tmpIsOfflineGenerated,_tmpCreatedAt,_tmpLastModified);
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
  public Flow<List<StoryEntity>> getStoriesByAgeRange(final String ageRange) {
    final String _sql = "SELECT * FROM stories WHERE ageRange = ? ORDER BY createdAt DESC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    if (ageRange == null) {
      _statement.bindNull(_argIndex);
    } else {
      _statement.bindString(_argIndex, ageRange);
    }
    return CoroutinesRoom.createFlow(__db, false, new String[] {"stories"}, new Callable<List<StoryEntity>>() {
      @Override
      @NonNull
      public List<StoryEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfTitle = CursorUtil.getColumnIndexOrThrow(_cursor, "title");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfTheme = CursorUtil.getColumnIndexOrThrow(_cursor, "theme");
          final int _cursorIndexOfAgeRange = CursorUtil.getColumnIndexOrThrow(_cursor, "ageRange");
          final int _cursorIndexOfIsOfflineGenerated = CursorUtil.getColumnIndexOrThrow(_cursor, "isOfflineGenerated");
          final int _cursorIndexOfCreatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "createdAt");
          final int _cursorIndexOfLastModified = CursorUtil.getColumnIndexOrThrow(_cursor, "lastModified");
          final List<StoryEntity> _result = new ArrayList<StoryEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final StoryEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpTitle;
            if (_cursor.isNull(_cursorIndexOfTitle)) {
              _tmpTitle = null;
            } else {
              _tmpTitle = _cursor.getString(_cursorIndexOfTitle);
            }
            final String _tmpContent;
            if (_cursor.isNull(_cursorIndexOfContent)) {
              _tmpContent = null;
            } else {
              _tmpContent = _cursor.getString(_cursorIndexOfContent);
            }
            final String _tmpTheme;
            if (_cursor.isNull(_cursorIndexOfTheme)) {
              _tmpTheme = null;
            } else {
              _tmpTheme = _cursor.getString(_cursorIndexOfTheme);
            }
            final String _tmpAgeRange;
            if (_cursor.isNull(_cursorIndexOfAgeRange)) {
              _tmpAgeRange = null;
            } else {
              _tmpAgeRange = _cursor.getString(_cursorIndexOfAgeRange);
            }
            final boolean _tmpIsOfflineGenerated;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsOfflineGenerated);
            _tmpIsOfflineGenerated = _tmp != 0;
            final long _tmpCreatedAt;
            _tmpCreatedAt = _cursor.getLong(_cursorIndexOfCreatedAt);
            final long _tmpLastModified;
            _tmpLastModified = _cursor.getLong(_cursorIndexOfLastModified);
            _item = new StoryEntity(_tmpId,_tmpTitle,_tmpContent,_tmpTheme,_tmpAgeRange,_tmpIsOfflineGenerated,_tmpCreatedAt,_tmpLastModified);
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

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
