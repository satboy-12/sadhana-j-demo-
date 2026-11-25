package com.herhealthjourney.android.ui;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.herhealthjourney.android.R;
import com.herhealthjourney.android.firebase.FirebaseHelper;
import com.herhealthjourney.android.ui.auth.LoginActivity;
import com.herhealthjourney.android.ui.dashboard.DashboardFragment;
import com.herhealthjourney.android.ui.period.PeriodFragment;
import com.herhealthjourney.android.ui.symptoms.SymptomsFragment;
import com.herhealthjourney.android.ui.water.WaterFragment;
import com.herhealthjourney.android.ui.wellness.WellnessFragment;
import com.herhealthjourney.android.util.SecureTokenManager;

public class MainActivity extends AppCompatActivity {

    private SecureTokenManager tokenManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        tokenManager = new SecureTokenManager(this);

        if (FirebaseHelper.getCurrentUser() == null && !tokenManager.hasToken()) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_main);

        MaterialToolbar toolbar = findViewById(R.id.topToolbar);
        toolbar.inflateMenu(R.menu.top_menu);
        toolbar.setOnMenuItemClickListener(item -> {
            if (item.getItemId() == R.id.action_logout) {
                FirebaseHelper.getAuth().signOut();
                tokenManager.clear();
                Toast.makeText(this, "Signed out", Toast.LENGTH_SHORT).show();
                Intent logoutIntent = new Intent(this, LoginActivity.class);
                logoutIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(logoutIntent);
                finish();
                return true;
            }
            return false;
        });

        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);
        bottomNav.setOnItemSelectedListener(this::onNavItemSelected);

        // Load default fragment
        if (savedInstanceState == null) {
            loadFragment(new DashboardFragment());
        }
    }

    private boolean onNavItemSelected(@NonNull MenuItem item) {
        Fragment fragment = null;
        int itemId = item.getItemId();

        if (itemId == R.id.nav_dashboard) {
            fragment = new DashboardFragment();
        } else if (itemId == R.id.nav_period) {
            fragment = new PeriodFragment();
        } else if (itemId == R.id.nav_symptoms) {
            fragment = new SymptomsFragment();
        } else if (itemId == R.id.nav_wellness) {
            fragment = new WellnessFragment();
        } else if (itemId == R.id.nav_water) {
            fragment = new WaterFragment();
        }

        return loadFragment(fragment);
    }

    private boolean loadFragment(Fragment fragment) {
        if (fragment != null) {
            getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
            return true;
        }
        return false;
    }
}
