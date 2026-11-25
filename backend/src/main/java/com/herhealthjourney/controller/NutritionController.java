package com.herhealthjourney.controller;

import com.herhealthjourney.dto.NutritionRecordDto;
import com.herhealthjourney.security.UserPrincipal;
import com.herhealthjourney.service.NutritionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/nutrition")
@Tag(name = "Nutrition & Diet", description = "Meal logs, descriptions, and estimated caloric tracking")
public class NutritionController {

    private final NutritionService nutritionService;

    public NutritionController(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @GetMapping
    @Operation(summary = "List nutrition logs", description = "Retrieves logged meals with optional date filtering")
    public ResponseEntity<List<NutritionRecordDto>> getRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(nutritionService.getRecords(principal.getUser(), startDate, endDate));
    }

    @PostMapping
    @Operation(summary = "Log meal", description = "Records a breakfast, lunch, dinner, or snack")
    public ResponseEntity<NutritionRecordDto> createRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody NutritionRecordDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nutritionService.createRecord(principal.getUser(), dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update nutrition log", description = "Modifies an existing meal entry")
    public ResponseEntity<NutritionRecordDto> updateRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody NutritionRecordDto dto) {
        return ResponseEntity.ok(nutritionService.updateRecord(principal.getUser(), id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete nutrition log", description = "Deletes a meal record")
    public ResponseEntity<Void> deleteRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        nutritionService.deleteRecord(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}

