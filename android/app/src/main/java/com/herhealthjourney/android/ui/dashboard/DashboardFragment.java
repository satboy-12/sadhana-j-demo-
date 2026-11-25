package com.herhealthjourney.android.ui.dashboard;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import com.herhealthjourney.android.R;
import com.herhealthjourney.android.firebase.FirebaseHelper;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class DashboardFragment extends Fragment {

    private TextView tvWelcome, tvPeriodEstimate, tvWaterAmount, tvLatestMood, tvRecentSymptom;
    private ProgressBar pbWaterProgress;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_dashboard, container, false);
        tvWelcome = view.findViewById(R.id.tvWelcomeUser);
        tvPeriodEstimate = view.findViewById(R.id.tvPeriodEstimate);
        tvWaterAmount = view.findViewById(R.id.tvWaterAmount);
        pbWaterProgress = view.findViewById(R.id.pbWaterProgress);
        tvLatestMood = view.findViewById(R.id.tvLatestMood);
        tvRecentSymptom = view.findViewById(R.id.tvRecentSymptom);

        listenToDashboardData();
        return view;
    }

    private void listenToDashboardData() {
        String uid = FirebaseHelper.getCurrentUid();
        if (uid == null) {
            if (tvWelcome != null) tvWelcome.setText("Welcome Back");
            return;
        }

        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());

        // 1. Profile listener
        FirebaseHelper.getProfileRef(uid).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (snapshot.exists() && snapshot.hasChild("fullName") && tvWelcome != null) {
                    String name = snapshot.child("fullName").getValue(String.class);
                    tvWelcome.setText("Welcome, " + (name != null ? name : "Member"));
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {}
        });

        // 2. Periods listener
        FirebaseHelper.getPeriodsRef(uid).limitToLast(1).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (tvPeriodEstimate == null) return;
                if (snapshot.exists()) {
                    for (DataSnapshot child : snapshot.getChildren()) {
                        String start = child.child("startDate").getValue(String.class);
                        Long cycle = child.child("cycleLength").getValue(Long.class);
                        if (cycle == null) cycle = child.child("cycleLengthDays").getValue(Long.class);
                        long days = cycle != null ? cycle : 28;
                        tvPeriodEstimate.setText("Last Period: " + (start != null ? start : "Recorded") + " • Cycle: " + days + "d");
                    }
                } else {
                    tvPeriodEstimate.setText("Cycle: 28 days (Tap to log period)");
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {}
        });

        // 3. Water listener
        FirebaseHelper.getWaterRef(uid).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (tvWaterAmount == null || pbWaterProgress == null) return;
                long totalMl = 0;
                long goalMl = 2500;

                if (snapshot.exists()) {
                    for (DataSnapshot child : snapshot.getChildren()) {
                        String date = child.child("date").getValue(String.class);
                        if (today.equals(date)) {
                            Long amt = child.child("amountMl").getValue(Long.class);
                            if (amt != null) totalMl += amt;
                            Long g = child.child("goalMl").getValue(Long.class);
                            if (g != null && g > 0) goalMl = g;
                        }
                    }
                }

                int percent = (int) Math.min(100, Math.round((totalMl * 100.0) / goalMl));
                tvWaterAmount.setText(totalMl + " / " + goalMl + " ml (" + percent + "%)");
                pbWaterProgress.setProgress(percent);
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {}
        });

        // 4. Latest wellness listener
        FirebaseHelper.getWellnessRef(uid).limitToLast(1).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (tvLatestMood == null) return;
                if (snapshot.exists()) {
                    for (DataSnapshot child : snapshot.getChildren()) {
                        String mood = child.child("mood").getValue(String.class);
                        Object sleep = child.child("sleepHours").getValue();
                        tvLatestMood.setText("Mood: " + (mood != null ? mood : "Calm") + (sleep != null ? " • Sleep: " + sleep + "h" : ""));
                    }
                } else {
                    tvLatestMood.setText("Mood: Calm • Restful");
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {}
        });
    }
}
