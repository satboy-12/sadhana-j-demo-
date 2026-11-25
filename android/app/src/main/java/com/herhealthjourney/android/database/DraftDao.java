package com.herhealthjourney.android.database;

import androidx.room.*;
import java.util.List;

@Dao
public interface DraftDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insert(DraftEntity draft);

    @Query("SELECT * FROM offline_drafts WHERE synced = 0 ORDER BY timestamp ASC")
    List<DraftEntity> getUnsyncedDrafts();

    @Query("UPDATE offline_drafts SET synced = 1 WHERE id = :draftId")
    void markAsSynced(long draftId);

    @Delete
    void delete(DraftEntity draft);
}

