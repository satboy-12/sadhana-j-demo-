package com.herhealthjourney.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SymptomRecordDto(
    Long id,
    @NotNull LocalDate recordDate,
    @NotBlank String symptomType,
    @Min(1) @Max(5) int severityScale,
    @Min(0) @Max(10) int painLevel,
    @Min(1) @Max(5) int energyLevel,
    String dailyObservations
) {}

