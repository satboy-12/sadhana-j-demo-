package com.herhealthjourney.dto;

import java.util.List;

public record DashboardSummaryDto(
    UserProfileDto userProfile,
    PeriodSummaryDto periodSummary,
    WaterProgressDto waterProgress,
    WellnessRecordDto latestWellness,
    List<SymptomRecordDto> recentSymptoms,
    String cyclePhaseAdvice
) {}

