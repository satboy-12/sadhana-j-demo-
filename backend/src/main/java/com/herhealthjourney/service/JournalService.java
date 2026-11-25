package com.herhealthjourney.service;

import com.herhealthjourney.dto.JournalEntryDto;
import com.herhealthjourney.entity.JournalEntry;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.exception.ResourceNotFoundException;
import com.herhealthjourney.repository.JournalEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class JournalService {

    private final JournalEntryRepository journalRepository;

    public JournalService(JournalEntryRepository journalRepository) {
        this.journalRepository = journalRepository;
    }

    @Transactional(readOnly = true)
    public List<JournalEntryDto> getEntries(User user, LocalDate startDate, LocalDate endDate) {
        List<JournalEntry> entries;
        if (startDate != null && endDate != null) {
            entries = journalRepository.findByUserAndEntryDateBetweenOrderByEntryDateDesc(user, startDate, endDate);
        } else {
            entries = journalRepository.findByUserOrderByEntryDateDesc(user);
        }
        return entries.stream().map(this::toDto).toList();
    }

    @Transactional
    public JournalEntryDto createEntry(User user, JournalEntryDto dto) {
        JournalEntry entry = new JournalEntry(
            user,
            dto.entryDate(),
            dto.title(),
            dto.content(),
            dto.isPrivate()
        );
        return toDto(journalRepository.save(entry));
    }

    @Transactional
    public JournalEntryDto updateEntry(User user, Long id, JournalEntryDto dto) {
        JournalEntry entry = journalRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found or access denied."));

        entry.setEntryDate(dto.entryDate());
        entry.setTitle(dto.title());
        entry.setContent(dto.content());
        entry.setPrivate(dto.isPrivate());

        return toDto(journalRepository.save(entry));
    }

    @Transactional
    public void deleteEntry(User user, Long id) {
        JournalEntry entry = journalRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found or access denied."));
        journalRepository.delete(entry);
    }

    private JournalEntryDto toDto(JournalEntry entry) {
        return new JournalEntryDto(
            entry.getId(),
            entry.getEntryDate(),
            entry.getTitle(),
            entry.getContent(),
            entry.isPrivate()
        );
    }
}

