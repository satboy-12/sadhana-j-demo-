package com.herhealthjourney.repository;

import com.herhealthjourney.entity.PeriodRecord;
import com.herhealthjourney.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodRecordRepository extends JpaRepository<PeriodRecord, Long> {
    List<PeriodRecord> findByUserOrderByStartDateDesc(User user);
    List<PeriodRecord> findByUserAndStartDateBetweenOrderByStartDateDesc(User user, LocalDate start, LocalDate end);
    Optional<PeriodRecord> findByIdAndUser(Long id, User user);
    Optional<PeriodRecord> findFirstByUserOrderByStartDateDesc(User user);
}

