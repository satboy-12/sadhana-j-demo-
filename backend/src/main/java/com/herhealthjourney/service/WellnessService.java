package com.herhealthjourney.service;

import com.herhealthjourney.dto.WellnessRecordDto;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.entity.WellnessRecord;
import com.herhealthjourney.exception.ResourceNotFoundException;
import com.herhealthjourney.repository.WellnessRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class WellnessService {

    private final WellnessRecordRepository wellnessRepository;

    public WellnessService(WellnessRecordRepository wellnessRepository) {
        this.wellnessRepository = wellnessRepository;
    }

    @Transactional(readOnly = true)
    public List<WellnessRecordDto> getRecords(User user, LocalDate startDate, LocalDate endDate) {
        List<WellnessRecord> records;
        if (startDate != null && endDate != null) {
            records = wellnessRepository.findByUserAndRecordDateBetweenOrderByRecordDateDesc(user, startDate, endDate);
        } else {
            records = wellnessRepository.findByUserOrderByRecordDateDesc(user);
        }
        return records.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public WellnessRecordDto getLatestMood(User user) {
        return wellnessRepository.findFirstByUserOrderByRecordDateDesc(user)
            .map(this::toDto)
            .orElse(null);
    }

    @Transactional
    public WellnessRecordDto createRecord(User user, WellnessRecordDto dto) {
        WellnessRecord record = new WellnessRecord(
            user,
            dto.recordDate(),
            dto.mood(),
            dto.sleepHours(),
            dto.sleepQuality(),
            dto.stressLevel(),
            dto.wellnessNotes()
        );
        return toDto(wellnessRepository.save(record));
    }

    @Transactional
    public WellnessRecordDto updateRecord(User user, Long id, WellnessRecordDto dto) {
        WellnessRecord record = wellnessRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Wellness record not found or access denied."));

        record.setRecordDate(dto.recordDate());
        record.setMood(dto.mood());
        record.setSleepHours(dto.sleepHours());
        record.setSleepQuality(dto.sleepQuality());
        record.setStressLevel(dto.stressLevel());
        record.setWellnessNotes(dto.wellnessNotes());

        return toDto(wellnessRepository.save(record));
    }

    @Transactional
    public void deleteRecord(User user, Long id) {
        WellnessRecord record = wellnessRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Wellness record not found or access denied."));
        wellnessRepository.delete(record);
    }

    private WellnessRecordDto toDto(WellnessRecord record) {
        return new WellnessRecordDto(
            record.getId(),
            record.getRecordDate(),
            record.getMood(),
            record.getSleepHours(),
            record.getSleepQuality(),
            record.getStressLevel(),
            record.getWellnessNotes()
        );
    }
}

