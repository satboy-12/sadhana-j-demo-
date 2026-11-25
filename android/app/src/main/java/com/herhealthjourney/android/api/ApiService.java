package com.herhealthjourney.android.api;

import com.google.gson.JsonObject;
import retrofit2.Call;
import retrofit2.http.*;

import java.util.List;

public interface ApiService {

    @GET("api/health")
    Call<JsonObject> checkHealth();

    @POST("api/auth/login")
    Call<JsonObject> login(@Body JsonObject credentials);

    @POST("api/auth/register")
    Call<JsonObject> register(@Body JsonObject registrationData);

    @GET("api/dashboard")
    Call<JsonObject> getDashboard();

    // Period Tracker
    @GET("api/period")
    Call<List<JsonObject>> getPeriodRecords();

    @POST("api/period")
    Call<JsonObject> createPeriodRecord(@Body JsonObject record);

    @DELETE("api/period/{id}")
    Call<Void> deletePeriodRecord(@Path("id") long id);

    // Symptoms Tracker
    @GET("api/symptoms")
    Call<List<JsonObject>> getSymptoms();

    @POST("api/symptoms")
    Call<JsonObject> createSymptom(@Body JsonObject symptom);

    // Water Tracker
    @GET("api/water/today")
    Call<JsonObject> getTodayWater();

    @POST("api/water/add/{amountMl}")
    Call<JsonObject> addWater(@Path("amountMl") int amountMl);

    // Wellness Tracker
    @GET("api/wellness")
    Call<List<JsonObject>> getWellnessRecords();

    // Nutrition Tracker
    @GET("api/nutrition")
    Call<List<JsonObject>> getNutritionRecords();

    // Journal Tracker
    @GET("api/journal")
    Call<List<JsonObject>> getJournalEntries();
}

