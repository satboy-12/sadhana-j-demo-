package com.herhealthjourney.service;

import com.herhealthjourney.dto.SymptomRecordDto;
import com.herhealthjourney.entity.SymptomRecord;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.exception.ResourceNotFoundException;
import com.herhealthjourney.repository.SymptomRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SymptomService {

    private final SymptomRecordRepository symptomRepository;

    public SymptomService(SymptomRecordRepository symptomRepository) {
        this.symptomRepository = symptomRepository;
    }

    @Transactional(readOnly = true)
    public List<SymptomRecordDto> getRecords(User user, LocalDate startDate, LocalDate endDate) {
        List<SymptomRecord> records;
        if (startDate != null && endDate != null) {
            records = symptomRepository.findByUserAndRecordDateBetweenOrderByRecordDateDesc(user, startDate, endDate);
        } else {
            records = symptomRepository.findByUserOrderByRecordDateDesc(user);
        }
        return records.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<SymptomRecordDto> getRecentSymptoms(User user) {
        return symptomRepository.findByUserOrderByRecordDateDesc(user).stream()
            .limit(5)
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public SymptomRecordDto createRecord(User user, SymptomRecordDto dto) {
        SymptomRecord record = new SymptomRecord(
            user,
            dto.recordDate(),
            dto.symptomType(),
            dto.severityScale(),
            dto.painLevel(),
            dto.energyLevel(),
            dto.dailyObservations()
        );
        return toDto(symptomRepository.save(record));
    }

    @Transactional
    public SymptomRecordDto updateRecord(User user, Long id, SymptomRecordDto dto) {
        SymptomRecord record = symptomRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Symptom record not found or access denied."));

        record.setRecordDate(dto.recordDate());
        record.setSymptomType(dto.symptomType());
        record.setSeverityScale(dto.severityScale());
        record.setPainLevel(dto.painLevel());
        record.setEnergyLevel(dto.energyLevel());
        record.setDailyObservations(dto.dailyObservations());

        return toDto(symptomRepository.save(record));
    }

    @Transactional
    public void deleteRecord(User user, Long id) {
        SymptomRecord record = symptomRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Symptom record not found or access denied."));
        symptomRepository.delete(record);
    }

    private SymptomRecordDto toDto(SymptomRecord record) {
        return new SymptomRecordDto(
            record.getId(),
            record.getRecordDate(),
            record.getSymptomType(),
            record.getSeverityScale(),
            record.getPainLevel(),
            record.getEnergyLevel(),
            record.getDailyObservations()
        );
    }
}

