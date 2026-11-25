package com.herhealthjourney.android.firebase;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.storage.FirebaseStorage;

/**
 * Centralized Firebase Architecture Helper for HER HEALTH JOURNEY Android Client.
 * Project: gen-lang-client-0665837098
 * Realtime Database: https://gen-lang-client-0665837098-default-rtdb.firebaseio.com
 * Storage Bucket: gs://gen-lang-client-0665837098.firebasestorage.app
 */
public class FirebaseHelper {

    private static final String DATABASE_URL = "https://gen-lang-client-0665837098-default-rtdb.firebaseio.com";
    private static final String STORAGE_BUCKET = "gs://gen-lang-client-0665837098.firebasestorage.app";

    public static FirebaseAuth getAuth() {
        return FirebaseAuth.getInstance();
    }

    public static FirebaseDatabase getDatabase() {
        return FirebaseDatabase.getInstance(DATABASE_URL);
    }

    public static FirebaseStorage getStorage() {
        return FirebaseStorage.getInstance(STORAGE_BUCKET);
    }

    public static FirebaseUser getCurrentUser() {
        return getAuth().getCurrentUser();
    }

    public static String getCurrentUid() {
        FirebaseUser user = getCurrentUser();
        return user != null ? user.getUid() : null;
    }

    public static DatabaseReference getUserRootRef(String uid) {
        return getDatabase().getReference("users").child(uid);
    }

    public static DatabaseReference getProfileRef(String uid) {
        return getUserRootRef(uid).child("profile");
    }

    public static DatabaseReference getPeriodsRef(String uid) {
        return getUserRootRef(uid).child("periods");
    }

    public static DatabaseReference getSymptomsRef(String uid) {
        return getUserRootRef(uid).child("symptoms");
    }

    public static DatabaseReference getWellnessRef(String uid) {
        return getUserRootRef(uid).child("wellness");
    }

    public static DatabaseReference getNutritionRef(String uid) {
        return getUserRootRef(uid).child("nutrition");
    }

    public static DatabaseReference getWaterRef(String uid) {
        return getUserRootRef(uid).child("water");
    }

    public static DatabaseReference getJournalRef(String uid) {
        return getUserRootRef(uid).child("journal");
    }
}
