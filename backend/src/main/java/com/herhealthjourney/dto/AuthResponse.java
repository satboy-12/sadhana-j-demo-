package com.herhealthjourney.dto;

public record AuthResponse(
    String token,
    String tokenType,
    Long userId,
    String username,
    String email,
    String firstName,
    String lastName
) {
    public AuthResponse(String token, Long userId, String username, String email, String firstName, String lastName) {
        this(token, "Bearer", userId, username, email, firstName, lastName);
    }
}

