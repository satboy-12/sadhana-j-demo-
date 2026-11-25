package com.herhealthjourney.controller;

import com.herhealthjourney.dto.WaterProgressDto;
import com.herhealthjourney.dto.WaterRecordDto;
import com.herhealthjourney.security.UserPrincipal;
import com.herhealthjourney.service.WaterTrackerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/water")
@Tag(name = "Water Tracker", description = "Hydration logging, daily targets, and progress monitoring")
public class WaterTrackerController {

    private final WaterTrackerService waterService;

    public WaterTrackerController(WaterTrackerService waterService) {
        this.waterService = waterService;
    }

    @GetMapping
    @Operation(summary = "List water intake history", description = "Retrieves daily hydration entries")
    public ResponseEntity<List<WaterRecordDto>> getRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(waterService.getRecords(principal.getUser(), startDate, endDate));
    }

    @GetMapping("/today")
    @Operation(summary = "Today's hydration progress", description = "Current ml intake vs daily target and percentage")
    public ResponseEntity<WaterProgressDto> getTodayProgress(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(waterService.getTodayProgress(principal.getUser()));
    }

    @PostMapping
    @Operation(summary = "Set water intake", description = "Updates or creates water intake for a specific date")
    public ResponseEntity<WaterRecordDto> logWater(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WaterRecordDto dto) {
        return ResponseEntity.ok(waterService.logWater(principal.getUser(), dto));
    }

    @PostMapping("/add/{amountMl}")
    @Operation(summary = "Add water quick-intake", description = "Increments today's intake by specified ml (e.g. 250ml)")
    public ResponseEntity<WaterRecordDto> addIntake(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable int amountMl) {
        return ResponseEntity.ok(waterService.addIntake(principal.getUser(), amountMl));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete water record", description = "Deletes a water tracking record")
    public ResponseEntity<Void> deleteRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        waterService.deleteRecord(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}

