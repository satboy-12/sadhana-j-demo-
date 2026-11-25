package com.herhealthjourney.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record JournalEntryDto(
    Long id,
    @NotNull LocalDate entryDate,
    @NotBlank @Size(max = 200) String title,
    @NotBlank String content,
    boolean isPrivate
) {}

