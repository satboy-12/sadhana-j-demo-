package com.herhealthjourney.dto;

import java.time.LocalDate;

public record WaterProgressDto(
    LocalDate date,
    int currentAmountMl,
    int dailyGoalMl,
    int percentageCompleted,
    boolean goalReached
) {}

