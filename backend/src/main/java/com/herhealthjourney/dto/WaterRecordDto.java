package com.herhealthjourney.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record WaterRecordDto(
    Long id,
    @NotNull LocalDate recordDate,
    @Min(0) int amountMl,
    @Min(1) int dailyGoalMl
) {}

