package com.herhealthjourney.android.database;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "offline_drafts")
public class DraftEntity {

    @PrimaryKey(autoGenerate = true)
    public long id;

    public String moduleType; // "PERIOD", "SYMPTOM", "WELLNESS", "NUTRITION", "WATER", "JOURNAL"
    public String payloadJson;
    public long timestamp;
    public boolean synced;

    public DraftEntity(String moduleType, String payloadJson, long timestamp, boolean synced) {
        this.moduleType = moduleType;
        this.payloadJson = payloadJson;
        this.timestamp = timestamp;
        this.synced = synced;
    }
}

