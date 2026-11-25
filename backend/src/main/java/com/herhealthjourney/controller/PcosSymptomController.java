package com.herhealthjourney.controller;

import com.herhealthjourney.dto.SymptomRecordDto;
import com.herhealthjourney.security.UserPrincipal;
import com.herhealthjourney.service.SymptomService;
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
@RequestMapping("/api/symptoms")
@Tag(name = "PCOS Symptom Tracker", description = "Symptom severity, pain, energy metrics, and observations")
public class PcosSymptomController {

    private final SymptomService symptomService;

    public PcosSymptomController(SymptomService symptomService) {
        this.symptomService = symptomService;
    }

    @GetMapping
    @Operation(summary = "List symptom observations", description = "Retrieves logged symptoms with optional date filters")
    public ResponseEntity<List<SymptomRecordDto>> getRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(symptomService.getRecords(principal.getUser(), startDate, endDate));
    }

    @PostMapping
    @Operation(summary = "Log new symptom", description = "Records a new symptom observation")
    public ResponseEntity<SymptomRecordDto> createRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SymptomRecordDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(symptomService.createRecord(principal.getUser(), dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update symptom record", description = "Updates an existing symptom record")
    public ResponseEntity<SymptomRecordDto> updateRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SymptomRecordDto dto) {
        return ResponseEntity.ok(symptomService.updateRecord(principal.getUser(), id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete symptom record", description = "Deletes a symptom record")
    public ResponseEntity<Void> deleteRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        symptomService.deleteRecord(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}

