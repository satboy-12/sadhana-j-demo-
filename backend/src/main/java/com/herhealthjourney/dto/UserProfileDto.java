package com.herhealthjourney.dto;

import java.time.LocalDate;

public record UserProfileDto(
    Long id,
    String username,
    String email,
    String firstName,
    String lastName,
    LocalDate dateOfBirth
) {}

