package com.herhealthjourney.controller;

import com.herhealthjourney.dto.PeriodRecordDto;
import com.herhealthjourney.dto.PeriodSummaryDto;
import com.herhealthjourney.security.UserPrincipal;
import com.herhealthjourney.service.PeriodTrackerService;
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
@RequestMapping("/api/period")
@Tag(name = "Period Tracker", description = "Cycle tracking, historical logs, and approximate future estimations")
public class PeriodTrackerController {

    private final PeriodTrackerService periodService;

    public PeriodTrackerController(PeriodTrackerService periodService) {
        this.periodService = periodService;
    }

    @GetMapping
    @Operation(summary = "List period records", description = "Retrieves user cycle history with optional date range filter")
    public ResponseEntity<List<PeriodRecordDto>> getRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(periodService.getRecords(principal.getUser(), startDate, endDate));
    }

    @GetMapping("/summary")
    @Operation(summary = "Cycle analytics summary", description = "Calculates average cycle lengths and estimated upcoming cycle start")
    public ResponseEntity<PeriodSummaryDto> getSummary(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(periodService.calculateCycleSummary(principal.getUser()));
    }

    @PostMapping
    @Operation(summary = "Create period record", description = "Logs a new cycle entry")
    public ResponseEntity<PeriodRecordDto> createRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PeriodRecordDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(periodService.createRecord(principal.getUser(), dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update period record", description = "Modifies an existing period record belonging to the authenticated user")
    public ResponseEntity<PeriodRecordDto> updateRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PeriodRecordDto dto) {
        return ResponseEntity.ok(periodService.updateRecord(principal.getUser(), id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete period record", description = "Deletes a period record belonging to the authenticated user")
    public ResponseEntity<Void> deleteRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        periodService.deleteRecord(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}

