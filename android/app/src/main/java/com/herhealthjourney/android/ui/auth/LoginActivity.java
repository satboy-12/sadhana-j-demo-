package com.herhealthjourney.android.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.textfield.TextInputEditText;
import com.herhealthjourney.android.R;
import com.herhealthjourney.android.firebase.FirebaseHelper;
import com.herhealthjourney.android.ui.MainActivity;
import com.herhealthjourney.android.util.SecureTokenManager;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        TextInputEditText etUsername = findViewById(R.id.etUsername);
        TextInputEditText etPassword = findViewById(R.id.etPassword);
        Button btnLogin = findViewById(R.id.btnLogin);
        TextView tvRegister = findViewById(R.id.tvGoToRegister);
        if (tvRegister == null) {
            tvRegister = findViewById(R.id.tvRegisterLink);
        }
        if (tvRegister != null) {
            tvRegister.setOnClickListener(v -> startActivity(new Intent(this, RegisterActivity.class)));
        }

        btnLogin.setOnClickListener(v -> {
            String email = etUsername.getText() != null ? etUsername.getText().toString().trim() : "";
            String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter your email and password", Toast.LENGTH_SHORT).show();
                return;
            }

            btnLogin.setEnabled(false);
            btnLogin.setText("Signing in...");

            FirebaseHelper.getAuth().signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, task -> {
                    btnLogin.setEnabled(true);
                    btnLogin.setText("Sign In");

                    if (task.isSuccessful() && FirebaseHelper.getCurrentUser() != null) {
                        String uid = FirebaseHelper.getCurrentUser().getUid();
                        SecureTokenManager tokenManager = new SecureTokenManager(LoginActivity.this);
                        tokenManager.saveAuth(uid, email);

                        Toast.makeText(LoginActivity.this, "Welcome, " + email, Toast.LENGTH_SHORT).show();
                        startActivity(new Intent(LoginActivity.this, MainActivity.class));
                        finish();
                    } else {
                        String errorMsg = task.getException() != null ? task.getException().getMessage() : "Authentication failed.";
                        Toast.makeText(LoginActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                    }
                });
        });
    }
}
