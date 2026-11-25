package com.herhealthjourney.dto;

import com.herhealthjourney.entity.NutritionRecord.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record NutritionRecordDto(
    Long id,
    @NotNull LocalDate recordDate,
    @NotNull MealType mealType,
    @NotBlank String foodDescription,
    Integer caloriesEstimate
) {}

