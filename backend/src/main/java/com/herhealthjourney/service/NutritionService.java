package com.herhealthjourney.service;

import com.herhealthjourney.dto.NutritionRecordDto;
import com.herhealthjourney.entity.NutritionRecord;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.exception.ResourceNotFoundException;
import com.herhealthjourney.repository.NutritionRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class NutritionService {

    private final NutritionRecordRepository nutritionRepository;

    public NutritionService(NutritionRecordRepository nutritionRepository) {
        this.nutritionRepository = nutritionRepository;
    }

    @Transactional(readOnly = true)
    public List<NutritionRecordDto> getRecords(User user, LocalDate startDate, LocalDate endDate) {
        List<NutritionRecord> records;
        if (startDate != null && endDate != null) {
            records = nutritionRepository.findByUserAndRecordDateBetweenOrderByRecordDateDesc(user, startDate, endDate);
        } else {
            records = nutritionRepository.findByUserOrderByRecordDateDesc(user);
        }
        return records.stream().map(this::toDto).toList();
    }

    @Transactional
    public NutritionRecordDto createRecord(User user, NutritionRecordDto dto) {
        NutritionRecord record = new NutritionRecord(
            user,
            dto.recordDate(),
            dto.mealType(),
            dto.foodDescription(),
            dto.caloriesEstimate()
        );
        return toDto(nutritionRepository.save(record));
    }

    @Transactional
    public NutritionRecordDto updateRecord(User user, Long id, NutritionRecordDto dto) {
        NutritionRecord record = nutritionRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Nutrition record not found or access denied."));

        record.setRecordDate(dto.recordDate());
        record.setMealType(dto.mealType());
        record.setFoodDescription(dto.foodDescription());
        record.setCaloriesEstimate(dto.caloriesEstimate());

        return toDto(nutritionRepository.save(record));
    }

    @Transactional
    public void deleteRecord(User user, Long id) {
        NutritionRecord record = nutritionRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Nutrition record not found or access denied."));
        nutritionRepository.delete(record);
    }

    private NutritionRecordDto toDto(NutritionRecord record) {
        return new NutritionRecordDto(
            record.getId(),
            record.getRecordDate(),
            record.getMealType(),
            record.getFoodDescription(),
            record.getCaloriesEstimate()
        );
    }
}

