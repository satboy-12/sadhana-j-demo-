package com.herhealthjourney.repository;

import com.herhealthjourney.entity.NutritionRecord;
import com.herhealthjourney.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NutritionRecordRepository extends JpaRepository<NutritionRecord, Long> {
    List<NutritionRecord> findByUserOrderByRecordDateDesc(User user);
    List<NutritionRecord> findByUserAndRecordDateBetweenOrderByRecordDateDesc(User user, LocalDate start, LocalDate end);
    Optional<NutritionRecord> findByIdAndUser(Long id, User user);
}

