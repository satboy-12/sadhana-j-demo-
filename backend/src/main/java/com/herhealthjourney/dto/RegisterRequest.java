package com.herhealthjourney.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RegisterRequest(
    String username,

    @NotBlank(message = "Email is required.")
    @Email(message = "Please provide a valid email address.")
    @Size(max = 100, message = "Email must not exceed 100 characters.")
    String email,

    @NotBlank(message = "Password is required.")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters.")
    String password,

    String firstName,
    String lastName,
    LocalDate dateOfBirth,
    String fullName
) {
    public RegisterRequest(String username, String email, String password, String firstName, String lastName, LocalDate dateOfBirth) {
        this(username, email, password, firstName, lastName, dateOfBirth, null);
    }

    public RegisterRequest(String fullName, String email, String password) {
        this(null, email, password, null, null, null, fullName);
    }

    public String effectiveUsername() {
        if (username != null && !username.trim().isEmpty()) {
            return username.trim();
        }
        if (email != null && !email.trim().isEmpty()) {
            String prefix = email.trim().split("@")[0].replaceAll("[^a-zA-Z0-9_.-]", "_");
            return prefix.length() >= 3 ? prefix : prefix + "_user";
        }
        return "user_" + System.currentTimeMillis();
    }

    public String effectiveFirstName() {
        if (firstName != null && !firstName.trim().isEmpty()) {
            return firstName.trim();
        }
        if (fullName != null && !fullName.trim().isEmpty()) {
            String[] parts = fullName.trim().split("\\s+");
            return parts[0];
        }
        return "User";
    }

    public String effectiveLastName() {
        if (lastName != null && !lastName.trim().isEmpty()) {
            return lastName.trim();
        }
        if (fullName != null && !fullName.trim().isEmpty()) {
            String[] parts = fullName.trim().split("\\s+");
            if (parts.length > 1) {
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i < parts.length; i++) {
                    if (i > 1) sb.append(" ");
                    sb.append(parts[i]);
                }
                return sb.toString();
            }
        }
        return effectiveFirstName();
    }
}
