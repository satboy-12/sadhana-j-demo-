package com.herhealthjourney.controller;

import com.herhealthjourney.dto.WellnessRecordDto;
import com.herhealthjourney.security.UserPrincipal;
import com.herhealthjourney.service.WellnessService;
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
@RequestMapping("/api/wellness")
@Tag(name = "Mood & Wellness", description = "Daily mood, sleep telemetry, and perceived stress logging")
public class WellnessController {

    private final WellnessService wellnessService;

    public WellnessController(WellnessService wellnessService) {
        this.wellnessService = wellnessService;
    }

    @GetMapping
    @Operation(summary = "List wellness logs", description = "Retrieves mood, sleep, and stress logs")
    public ResponseEntity<List<WellnessRecordDto>> getRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(wellnessService.getRecords(principal.getUser(), startDate, endDate));
    }

    @PostMapping
    @Operation(summary = "Log daily wellness", description = "Creates a new daily wellness log")
    public ResponseEntity<WellnessRecordDto> createRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WellnessRecordDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wellnessService.createRecord(principal.getUser(), dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update wellness record", description = "Modifies an existing wellness log")
    public ResponseEntity<WellnessRecordDto> updateRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody WellnessRecordDto dto) {
        return ResponseEntity.ok(wellnessService.updateRecord(principal.getUser(), id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete wellness record", description = "Deletes a wellness log")
    public ResponseEntity<Void> deleteRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        wellnessService.deleteRecord(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}

