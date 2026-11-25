package com.herhealthjourney.android.ui.symptoms;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.herhealthjourney.android.R;
import com.herhealthjourney.android.firebase.FirebaseHelper;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class SymptomsFragment extends Fragment {

    private final String[] SYMPTOMS = {
        "Pelvic Pain & Cramping",
        "Bloating & Water Retention",
        "Fatigue & Low Energy",
        "Hormonal Acne Flare",
        "Hirsutism / Facial Hair",
        "Mood Swings / Irritability"
    };

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_symptoms, container, false);
        FloatingActionButton fab = view.findViewById(R.id.fabAddSymptom);
        fab.setOnClickListener(v -> showSymptomDialog());
        return view;
    }

    private void showSymptomDialog() {
        if (getContext() == null) return;
        String uid = FirebaseHelper.getCurrentUid();
        if (uid == null) {
            Toast.makeText(getContext(), "Please sign in to log symptoms", Toast.LENGTH_SHORT).show();
            return;
        }

        new AlertDialog.Builder(getContext())
            .setTitle("Select PCOS Symptom")
            .setItems(SYMPTOMS, (dialog, which) -> {
                String chosen = SYMPTOMS[which];
                String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
                String nowIso = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(new Date());

                Map<String, Object> payload = new HashMap<>();
                payload.put("date", today);
                payload.put("severity", 3);
                payload.put("painLevel", 2);
                payload.put("energyLevel", 3);
                payload.put("observations", chosen + " (Logged via Android app)");
                payload.put("notes", chosen);
                payload.put("createdAt", nowIso);

                List<String> symptomList = new ArrayList<>();
                symptomList.add(chosen);
                payload.put("symptoms", symptomList);

                FirebaseHelper.getSymptomsRef(uid).push().setValue(payload)
                    .addOnCompleteListener(task -> {
                        if (task.isSuccessful() && getContext() != null) {
                            Toast.makeText(getContext(), "Logged to Firebase: " + chosen, Toast.LENGTH_SHORT).show();
                        }
                    });
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
}
