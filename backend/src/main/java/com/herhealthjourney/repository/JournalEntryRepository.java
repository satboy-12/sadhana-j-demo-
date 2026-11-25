package com.herhealthjourney.repository;

import com.herhealthjourney.entity.JournalEntry;
import com.herhealthjourney.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByUserOrderByEntryDateDesc(User user);
    List<JournalEntry> findByUserAndEntryDateBetweenOrderByEntryDateDesc(User user, LocalDate start, LocalDate end);
    Optional<JournalEntry> findByIdAndUser(Long id, User user);
}

