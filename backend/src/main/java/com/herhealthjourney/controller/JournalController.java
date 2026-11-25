package com.herhealthjourney.controller;

import com.herhealthjourney.dto.JournalEntryDto;
import com.herhealthjourney.security.UserPrincipal;
import com.herhealthjourney.service.JournalService;
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
@RequestMapping("/api/journal")
@Tag(name = "Health Journal", description = "Personal reflective entries, notes, and cycle experiences")
public class JournalController {

    private final JournalService journalService;

    public JournalController(JournalService journalService) {
        this.journalService = journalService;
    }

    @GetMapping
    @Operation(summary = "List journal entries", description = "Retrieves private journal entries with optional date range filter")
    public ResponseEntity<List<JournalEntryDto>> getEntries(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(journalService.getEntries(principal.getUser(), startDate, endDate));
    }

    @PostMapping
    @Operation(summary = "Create journal entry", description = "Creates a private personal health reflection")
    public ResponseEntity<JournalEntryDto> createEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JournalEntryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(journalService.createEntry(principal.getUser(), dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update journal entry", description = "Modifies an existing journal entry")
    public ResponseEntity<JournalEntryDto> updateEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody JournalEntryDto dto) {
        return ResponseEntity.ok(journalService.updateEntry(principal.getUser(), id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete journal entry", description = "Permanently removes a personal journal entry")
    public ResponseEntity<Void> deleteEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        journalService.deleteEntry(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}

