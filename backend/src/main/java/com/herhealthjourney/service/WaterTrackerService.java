package com.herhealthjourney.service;

import com.herhealthjourney.dto.WaterProgressDto;
import com.herhealthjourney.dto.WaterRecordDto;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.entity.WaterRecord;
import com.herhealthjourney.exception.ResourceNotFoundException;
import com.herhealthjourney.repository.WaterRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class WaterTrackerService {

    private final WaterRecordRepository waterRepository;

    public WaterTrackerService(WaterRecordRepository waterRepository) {
        this.waterRepository = waterRepository;
    }

    @Transactional(readOnly = true)
    public List<WaterRecordDto> getRecords(User user, LocalDate startDate, LocalDate endDate) {
        List<WaterRecord> records;
        if (startDate != null && endDate != null) {
            records = waterRepository.findByUserAndRecordDateBetweenOrderByRecordDateDesc(user, startDate, endDate);
        } else {
            records = waterRepository.findByUserOrderByRecordDateDesc(user);
        }
        return records.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public WaterProgressDto getTodayProgress(User user) {
        LocalDate today = LocalDate.now();
        return waterRepository.findByUserAndRecordDate(user, today)
            .map(r -> new WaterProgressDto(
                today,
                r.getAmountMl(),
                r.getDailyGoalMl(),
                Math.min(100, (int) Math.round((double) r.getAmountMl() / r.getDailyGoalMl() * 100)),
                r.getAmountMl() >= r.getDailyGoalMl()
            ))
            .orElse(new WaterProgressDto(today, 0, 2000, 0, false));
    }

    @Transactional
    public WaterRecordDto logWater(User user, WaterRecordDto dto) {
        WaterRecord record = waterRepository.findByUserAndRecordDate(user, dto.recordDate())
            .orElse(new WaterRecord(user, dto.recordDate(), 0, dto.dailyGoalMl() > 0 ? dto.dailyGoalMl() : 2000));

        record.setAmountMl(dto.amountMl());
        if (dto.dailyGoalMl() > 0) {
            record.setDailyGoalMl(dto.dailyGoalMl());
        }

        return toDto(waterRepository.save(record));
    }

    @Transactional
    public WaterRecordDto addIntake(User user, int additionalMl) {
        LocalDate today = LocalDate.now();
        WaterRecord record = waterRepository.findByUserAndRecordDate(user, today)
            .orElse(new WaterRecord(user, today, 0, 2000));

        record.setAmountMl(record.getAmountMl() + additionalMl);
        return toDto(waterRepository.save(record));
    }

    @Transactional
    public void deleteRecord(User user, Long id) {
        WaterRecord record = waterRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Water record not found or access denied."));
        waterRepository.delete(record);
    }

    private WaterRecordDto toDto(WaterRecord record) {
        return new WaterRecordDto(
            record.getId(),
            record.getRecordDate(),
            record.getAmountMl(),
            record.getDailyGoalMl()
        );
    }
}

