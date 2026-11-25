package com.herhealthjourney.service;

import com.herhealthjourney.dto.PeriodRecordDto;
import com.herhealthjourney.dto.PeriodSummaryDto;
import com.herhealthjourney.entity.PeriodRecord;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.exception.ResourceNotFoundException;
import com.herhealthjourney.repository.PeriodRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PeriodTrackerService {

    private final PeriodRecordRepository periodRepository;

    public PeriodTrackerService(PeriodRecordRepository periodRepository) {
        this.periodRepository = periodRepository;
    }

    @Transactional(readOnly = true)
    public List<PeriodRecordDto> getRecords(User user, LocalDate startDate, LocalDate endDate) {
        List<PeriodRecord> records;
        if (startDate != null && endDate != null) {
            records = periodRepository.findByUserAndStartDateBetweenOrderByStartDateDesc(user, startDate, endDate);
        } else {
            records = periodRepository.findByUserOrderByStartDateDesc(user);
        }
        return records.stream().map(this::toDto).toList();
    }

    @Transactional
    public PeriodRecordDto createRecord(User user, PeriodRecordDto dto) {
        PeriodRecord record = new PeriodRecord(
            user,
            dto.startDate(),
            dto.endDate(),
            dto.flowIntensity(),
            dto.painLevel(),
            dto.notes()
        );
        return toDto(periodRepository.save(record));
    }

    @Transactional
    public PeriodRecordDto updateRecord(User user, Long id, PeriodRecordDto dto) {
        PeriodRecord record = periodRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Period record not found or access denied."));

        record.setStartDate(dto.startDate());
        record.setEndDate(dto.endDate());
        record.setFlowIntensity(dto.flowIntensity());
        record.setPainLevel(dto.painLevel());
        record.setNotes(dto.notes());

        return toDto(periodRepository.save(record));
    }

    @Transactional
    public void deleteRecord(User user, Long id) {
        PeriodRecord record = periodRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Period record not found or access denied."));
        periodRepository.delete(record);
    }

    @Transactional(readOnly = true)
    public PeriodSummaryDto calculateCycleSummary(User user) {
        List<PeriodRecord> records = periodRepository.findByUserOrderByStartDateDesc(user);
        if (records.isEmpty()) {
            return new PeriodSummaryDto(28, 5, null, "No recorded cycles. Cycle calculations are informational estimates and not medical diagnosis.");
        }

        if (records.size() == 1) {
            LocalDate nextEstimate = records.get(0).getStartDate().plusDays(28);
            return new PeriodSummaryDto(28, 5, nextEstimate, "Estimated based on default 28-day cycle length. Cycle calculations are informational estimates and not medical diagnosis.");
        }

        long totalDaysBetween = 0;
        int intervals = 0;
        for (int i = 0; i < records.size() - 1 && i < 6; i++) {
            long days = ChronoUnit.DAYS.between(records.get(i + 1).getStartDate(), records.get(i).getStartDate());
            if (days >= 20 && days <= 60) {
                totalDaysBetween += days;
                intervals++;
            }
        }

        int avgCycle = intervals > 0 ? (int) (totalDaysBetween / intervals) : 28;
        LocalDate lastStart = records.get(0).getStartDate();
        LocalDate nextEstimate = lastStart.plusDays(avgCycle);

        return new PeriodSummaryDto(
            avgCycle,
            5,
            nextEstimate,
            "Cycle calculation is an estimate derived from your logged history. It is for tracking purposes only and not a medical prediction or contraception method."
        );
    }

    private PeriodRecordDto toDto(PeriodRecord entity) {
        return new PeriodRecordDto(
            entity.getId(),
            entity.getStartDate(),
            entity.getEndDate(),
            entity.getFlowIntensity(),
            entity.getPainLevel(),
            entity.getNotes()
        );
    }
}

