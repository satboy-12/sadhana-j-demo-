package com.herhealthjourney.android.ui.wellness;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.herhealthjourney.android.R;

public class WellnessFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        TextView tv = new TextView(getContext());
        tv.setText("Wellness, Nutrition & Personal Journal are synced with your unified account.");
        tv.setPadding(32, 32, 32, 32);
        tv.setTextColor(getResources().getColor(R.color.deep_plum));
        tv.setTextSize(16f);
        return tv;
    }
}

