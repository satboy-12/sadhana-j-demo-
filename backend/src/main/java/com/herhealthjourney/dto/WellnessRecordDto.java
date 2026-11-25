package com.herhealthjourney.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WellnessRecordDto(
    Long id,
    @NotNull LocalDate recordDate,
    @NotBlank String mood,
    @NotNull @DecimalMin("0.00") @DecimalMax("24.00") BigDecimal sleepHours,
    @Min(1) @Max(5) int sleepQuality,
    @Min(1) @Max(5) int stressLevel,
    String wellnessNotes
) {}

