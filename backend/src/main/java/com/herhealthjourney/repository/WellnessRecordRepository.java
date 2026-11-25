package com.herhealthjourney.repository;

import com.herhealthjourney.entity.User;
import com.herhealthjourney.entity.WellnessRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WellnessRecordRepository extends JpaRepository<WellnessRecord, Long> {
    List<WellnessRecord> findByUserOrderByRecordDateDesc(User user);
    List<WellnessRecord> findByUserAndRecordDateBetweenOrderByRecordDateDesc(User user, LocalDate start, LocalDate end);
    Optional<WellnessRecord> findByIdAndUser(Long id, User user);
    Optional<WellnessRecord> findFirstByUserOrderByRecordDateDesc(User user);
}

