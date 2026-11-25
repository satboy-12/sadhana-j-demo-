package com.herhealthjourney.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "wellness_records")
public class WellnessRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String mood;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("24.00")
    @Column(name = "sleep_hours", nullable = false, precision = 4, scale = 2)
    private BigDecimal sleepHours;

    @Min(1)
    @Max(5)
    @Column(name = "sleep_quality", nullable = false)
    private int sleepQuality = 3;

    @Min(1)
    @Max(5)
    @Column(name = "stress_level", nullable = false)
    private int stressLevel = 3;

    @Column(name = "wellness_notes", columnDefinition = "TEXT")
    private String wellnessNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public WellnessRecord() {}

    public WellnessRecord(User user, LocalDate recordDate, String mood, BigDecimal sleepHours, int sleepQuality, int stressLevel, String wellnessNotes) {
        this.user = user;
        this.recordDate = recordDate;
        this.mood = mood;
        this.sleepHours = sleepHours;
        this.sleepQuality = sleepQuality;
        this.stressLevel = stressLevel;
        this.wellnessNotes = wellnessNotes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public BigDecimal getSleepHours() { return sleepHours; }
    public void setSleepHours(BigDecimal sleepHours) { this.sleepHours = sleepHours; }

    public int getSleepQuality() { return sleepQuality; }
    public void setSleepQuality(int sleepQuality) { this.sleepQuality = sleepQuality; }

    public int getStressLevel() { return stressLevel; }
    public void setStressLevel(int stressLevel) { this.stressLevel = stressLevel; }

    public String getWellnessNotes() { return wellnessNotes; }
    public void setWellnessNotes(String wellnessNotes) { this.wellnessNotes = wellnessNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

