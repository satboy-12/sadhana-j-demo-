package com.herhealthjourney.android.ui.period;

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
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class PeriodFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_period, container, false);
        FloatingActionButton fab = view.findViewById(R.id.fabAddPeriod);
        fab.setOnClickListener(v -> showQuickLogDialog());
        return view;
    }

    private void showQuickLogDialog() {
        if (getContext() == null) return;
        String uid = FirebaseHelper.getCurrentUid();
        if (uid == null) {
            Toast.makeText(getContext(), "Please sign in to log cycles", Toast.LENGTH_SHORT).show();
            return;
        }

        new AlertDialog.Builder(getContext())
            .setTitle("Log Period Start")
            .setMessage("Record cycle start date as today in Firebase?")
            .setPositiveButton("Confirm", (dialog, which) -> {
                String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
                String nowIso = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(new Date());

                Map<String, Object> payload = new HashMap<>();
                payload.put("startDate", today);
                payload.put("endDate", today);
                payload.put("flowIntensity", "Moderate");
                payload.put("cycleLength", 28);
                payload.put("cycleLengthDays", 28);
                payload.put("notes", "Logged from mobile client");
                payload.put("createdAt", nowIso);

                FirebaseHelper.getPeriodsRef(uid).push().setValue(payload)
                    .addOnCompleteListener(task -> {
                        if (task.isSuccessful()) {
                            Toast.makeText(getContext(), "Cycle record logged to Firebase!", Toast.LENGTH_SHORT).show();
                        } else {
                            String err = task.getException() != null ? task.getException().getMessage() : "Error logging record";
                            Toast.makeText(getContext(), err, Toast.LENGTH_SHORT).show();
                        }
                    });
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
}
