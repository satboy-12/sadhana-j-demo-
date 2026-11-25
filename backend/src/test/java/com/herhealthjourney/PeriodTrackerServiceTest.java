package com.herhealthjourney;

import com.herhealthjourney.dto.PeriodSummaryDto;
import com.herhealthjourney.entity.PeriodRecord;
import com.herhealthjourney.entity.PeriodRecord.FlowIntensity;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.PeriodRecordRepository;
import com.herhealthjourney.service.PeriodTrackerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PeriodTrackerServiceTest {

    @Mock
    private PeriodRecordRepository periodRepository;

    @InjectMocks
    private PeriodTrackerService periodService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@test.com", "hash", "Test", "User", LocalDate.of(1995, 1, 1));
        testUser.setId(1L);
    }

    @Test
    void testCycleCalculation_withTwoPeriods() {
        LocalDate cycle1 = LocalDate.of(2026, 1, 1);
        LocalDate cycle2 = LocalDate.of(2026, 1, 29); // 28-day difference

        PeriodRecord p1 = new PeriodRecord(testUser, cycle2, cycle2.plusDays(5), FlowIntensity.MEDIUM, 2, "Cycle 2");
        PeriodRecord p2 = new PeriodRecord(testUser, cycle1, cycle1.plusDays(5), FlowIntensity.MEDIUM, 3, "Cycle 1");

        when(periodRepository.findByUserOrderByStartDateDesc(testUser)).thenReturn(List.of(p1, p2));

        PeriodSummaryDto summary = periodService.calculateCycleSummary(testUser);

        assertNotNull(summary);
        assertEquals(28, summary.averageCycleLengthDays());
        assertEquals(LocalDate.of(2026, 2, 26), summary.estimatedNextPeriodStart());
        assertTrue(summary.medicalDisclaimer().contains("estimate"));
    }

    @Test
    void testCycleCalculation_noRecords_returnsDefault() {
        when(periodRepository.findByUserOrderByStartDateDesc(testUser)).thenReturn(List.of());

        PeriodSummaryDto summary = periodService.calculateCycleSummary(testUser);

        assertNotNull(summary);
        assertEquals(28, summary.averageCycleLengthDays());
        assertNull(summary.estimatedNextPeriodStart());
    }
}

