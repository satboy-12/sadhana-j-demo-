package com.herhealthjourney.android.ui.auth;

import android.os.Bundle;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.textfield.TextInputEditText;
import com.herhealthjourney.android.R;
import com.herhealthjourney.android.firebase.FirebaseHelper;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class RegisterActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        TextInputEditText etUsername = findViewById(R.id.etRegUsername);
        TextInputEditText etEmail = findViewById(R.id.etRegEmail);
        TextInputEditText etFirstName = findViewById(R.id.etRegFirstName);
        TextInputEditText etLastName = findViewById(R.id.etRegLastName);
        TextInputEditText etPassword = findViewById(R.id.etRegPassword);
        TextInputEditText etConfirmPassword = findViewById(R.id.etRegConfirmPassword);
        TextView tvRegError = findViewById(R.id.tvRegError);
        ProgressBar pbRegLoading = findViewById(R.id.pbRegLoading);
        Button btnRegister = findViewById(R.id.btnRegister);
        TextView tvGoToLogin = findViewById(R.id.tvGoToLogin);

        if (tvGoToLogin != null) {
            tvGoToLogin.setOnClickListener(v -> finish());
        }

        btnRegister.setOnClickListener(v -> {
            String username = etUsername.getText() != null ? etUsername.getText().toString().trim() : "";
            String email = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
            String firstName = etFirstName.getText() != null ? etFirstName.getText().toString().trim() : "";
            String lastName = etLastName.getText() != null ? etLastName.getText().toString().trim() : "";
            String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";
            String confirmPassword = etConfirmPassword != null && etConfirmPassword.getText() != null
                ? etConfirmPassword.getText().toString().trim() : "";

            if (tvRegError != null) {
                tvRegError.setVisibility(android.view.View.GONE);
            }

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show();
                return;
            }

            if (etConfirmPassword != null && !password.equals(confirmPassword)) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show();
                return;
            }

            String fullName = (firstName + " " + lastName).trim();
            if (fullName.isEmpty()) {
                fullName = username.isEmpty() ? email.split("@")[0] : username;
            }

            if (pbRegLoading != null) {
                pbRegLoading.setVisibility(android.view.View.VISIBLE);
            }
            btnRegister.setEnabled(false);
            btnRegister.setText("Creating account...");

            final String finalFullName = fullName;
            FirebaseHelper.getAuth().createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, task -> {
                    if (pbRegLoading != null) {
                        pbRegLoading.setVisibility(android.view.View.GONE);
                    }
                    btnRegister.setEnabled(true);
                    btnRegister.setText("Register");

                    if (task.isSuccessful() && FirebaseHelper.getCurrentUser() != null) {
                        String uid = FirebaseHelper.getCurrentUser().getUid();
                        String nowIso = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(new Date());

                        Map<String, Object> profileData = new HashMap<>();
                        profileData.put("fullName", finalFullName);
                        profileData.put("email", email);
                        profileData.put("createdAt", nowIso);
                        profileData.put("updatedAt", nowIso);
                        profileData.put("profileImage", null);
                        profileData.put("accountTier", "Firebase Cloud");
                        profileData.put("memberSince", nowIso.substring(0, 10));

                        FirebaseHelper.getProfileRef(uid).setValue(profileData)
                            .addOnCompleteListener(profileTask -> {
                                Toast.makeText(RegisterActivity.this, "Account created! Please sign in.", Toast.LENGTH_LONG).show();
                                finish();
                            });
                    } else {
                        String errorMsg = task.getException() != null ? task.getException().getMessage() : "Registration failed.";
                        if (tvRegError != null) {
                            tvRegError.setText(errorMsg);
                            tvRegError.setVisibility(android.view.View.VISIBLE);
                        }
                        Toast.makeText(RegisterActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                    }
                });
        });
    }
}
