package com.herhealthjourney.android.util;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKeys;

public class SecureTokenManager {
    private static final String PREF_NAME = "her_health_secure_prefs";
    private static final String KEY_JWT = "jwt_token";
    private static final String KEY_USERNAME = "current_username";
    private SharedPreferences prefs;

    public SecureTokenManager(Context context) {
        try {
            String masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC);
            prefs = EncryptedSharedPreferences.create(
                PREF_NAME,
                masterKeyAlias,
                context,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (Exception e) {
            prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        }
    }

    public void saveAuth(String token, String username) {
        prefs.edit().putString(KEY_JWT, token).putString(KEY_USERNAME, username).apply();
    }

    public String getToken() {
        return prefs.getString(KEY_JWT, null);
    }

    public String getUsername() {
        return prefs.getString(KEY_USERNAME, "User");
    }

    public boolean hasToken() {
        return getToken() != null && !getToken().isEmpty();
    }

    public void clear() {
        prefs.edit().clear().apply();
    }
}

