package com.herhealthjourney.repository;

import com.herhealthjourney.entity.SymptomRecord;
import com.herhealthjourney.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SymptomRecordRepository extends JpaRepository<SymptomRecord, Long> {
    List<SymptomRecord> findByUserOrderByRecordDateDesc(User user);
    List<SymptomRecord> findByUserAndRecordDateBetweenOrderByRecordDateDesc(User user, LocalDate start, LocalDate end);
    Optional<SymptomRecord> findByIdAndUser(Long id, User user);
}

