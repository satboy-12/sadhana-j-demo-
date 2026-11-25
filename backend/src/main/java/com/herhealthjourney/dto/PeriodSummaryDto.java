package com.herhealthjourney.dto;

import java.time.LocalDate;

public record PeriodSummaryDto(
    int averageCycleLengthDays,
    int averagePeriodDurationDays,
    LocalDate estimatedNextPeriodStart,
    String medicalDisclaimer
) {}

