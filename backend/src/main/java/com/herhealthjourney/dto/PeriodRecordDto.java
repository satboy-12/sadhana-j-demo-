package com.herhealthjourney.dto;

import com.herhealthjourney.entity.PeriodRecord.FlowIntensity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PeriodRecordDto(
    Long id,
    @NotNull LocalDate startDate,
    LocalDate endDate,
    @NotNull FlowIntensity flowIntensity,
    @Min(0) @Max(10) int painLevel,
    String notes
) {}

