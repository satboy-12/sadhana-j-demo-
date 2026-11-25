package com.herhealthjourney.repository;

import com.herhealthjourney.entity.User;
import com.herhealthjourney.entity.WaterRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterRecordRepository extends JpaRepository<WaterRecord, Long> {
    List<WaterRecord> findByUserOrderByRecordDateDesc(User user);
    List<WaterRecord> findByUserAndRecordDateBetweenOrderByRecordDateDesc(User user, LocalDate start, LocalDate end);
    Optional<WaterRecord> findByIdAndUser(Long id, User user);
    Optional<WaterRecord> findByUserAndRecordDate(User user, LocalDate recordDate);
}

