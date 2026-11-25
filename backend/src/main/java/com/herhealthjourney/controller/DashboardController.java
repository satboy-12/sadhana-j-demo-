package com.herhealthjourney.controller;

import com.herhealthjourney.dto.DashboardSummaryDto;
import com.herhealthjourney.dto.UserProfileDto;
import com.herhealthjourney.security.UserPrincipal;
import com.herhealthjourney.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Summary", description = "Unified overview endpoint aggregating tracking summaries for web and Android")
public class DashboardController {

    private final PeriodTrackerService periodService;
    private final WaterTrackerService waterService;
    private final WellnessService wellnessService;
    private final SymptomService symptomService;

    public DashboardController(PeriodTrackerService periodService,
                               WaterTrackerService waterService,
                               WellnessService wellnessService,
                               SymptomService symptomService) {
        this.periodService = periodService;
        this.waterService = waterService;
        this.wellnessService = wellnessService;
        this.symptomService = symptomService;
    }

    @GetMapping
    @Operation(summary = "Get user dashboard summary", description = "Retrieves aggregated metrics for the authenticated user")
    public ResponseEntity<DashboardSummaryDto> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        UserProfileDto profile = new UserProfileDto(
            principal.getUser().getId(),
            principal.getUser().getUsername(),
            principal.getUser().getEmail(),
            principal.getUser().getFirstName(),
            principal.getUser().getLastName(),
            principal.getUser().getDateOfBirth()
        );

        DashboardSummaryDto summary = new DashboardSummaryDto(
            profile,
            periodService.calculateCycleSummary(principal.getUser()),
            waterService.getTodayProgress(principal.getUser()),
            wellnessService.getLatestMood(principal.getUser()),
            symptomService.getRecentSymptoms(principal.getUser()),
            "Nurture your body with gentle hydration, balanced whole foods, and restorative rest."
        );

        return ResponseEntity.ok(summary);
    }
}

