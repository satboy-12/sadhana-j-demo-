package com.herhealthjourney.android.ui.water;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
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
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class WaterFragment extends Fragment {

    private TextView tvWaterDetail;
    private ProgressBar pbWaterPage;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_water, container, false);

        tvWaterDetail = view.findViewById(R.id.tvWaterDetail);
        pbWaterPage = view.findViewById(R.id.pbWaterPage);

        Button btn250 = view.findViewById(R.id.btnAdd250);
        Button btn500 = view.findViewById(R.id.btnAdd500);

        btn250.setOnClickListener(v -> addIntake(250));
        btn500.setOnClickListener(v -> addIntake(500));

        listenToWater();
        return view;
    }

    private void listenToWater() {
        String uid = FirebaseHelper.getCurrentUid();
        if (uid == null) {
            if (tvWaterDetail != null) tvWaterDetail.setText("0 / 2500 ml");
            return;
        }

        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());

        FirebaseHelper.getWaterRef(uid).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (tvWaterDetail == null || pbWaterPage == null) return;
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

                int pct = (int) Math.min(100, Math.round((totalMl * 100.0) / goalMl));
                tvWaterDetail.setText(totalMl + " / " + goalMl + " ml (" + pct + "%)");
                pbWaterPage.setProgress(pct);
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {}
        });
    }

    private void addIntake(int ml) {
        String uid = FirebaseHelper.getCurrentUid();
        if (uid == null) {
            Toast.makeText(getContext(), "Please sign in to log water", Toast.LENGTH_SHORT).show();
            return;
        }

        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        String nowIso = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(new Date());

        Map<String, Object> payload = new HashMap<>();
        payload.put("date", today);
        payload.put("amountMl", ml);
        payload.put("goalMl", 2500);
        payload.put("updatedAt", nowIso);

        FirebaseHelper.getWaterRef(uid).push().setValue(payload)
            .addOnCompleteListener(task -> {
                if (task.isSuccessful() && getContext() != null) {
                    Toast.makeText(getContext(), "+" + ml + " ml logged to Firebase!", Toast.LENGTH_SHORT).show();
                }
            });
    }
}
