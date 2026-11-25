package com.herhealthjourney.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "symptom_records")
public class SymptomRecord {

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
    @Column(name = "symptom_type", nullable = false, length = 100)
    private String symptomType;

    @Min(1)
    @Max(5)
    @Column(name = "severity_scale", nullable = false)
    private int severityScale;

    @Min(0)
    @Max(10)
    @Column(name = "pain_level", nullable = false)
    private int painLevel = 0;

    @Min(1)
    @Max(5)
    @Column(name = "energy_level", nullable = false)
    private int energyLevel = 3;

    @Column(name = "daily_observations", columnDefinition = "TEXT")
    private String dailyObservations;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public SymptomRecord() {}

    public SymptomRecord(User user, LocalDate recordDate, String symptomType, int severityScale, int painLevel, int energyLevel, String dailyObservations) {
        this.user = user;
        this.recordDate = recordDate;
        this.symptomType = symptomType;
        this.severityScale = severityScale;
        this.painLevel = painLevel;
        this.energyLevel = energyLevel;
        this.dailyObservations = dailyObservations;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public String getSymptomType() { return symptomType; }
    public void setSymptomType(String symptomType) { this.symptomType = symptomType; }

    public int getSeverityScale() { return severityScale; }
    public void setSeverityScale(int severityScale) { this.severityScale = severityScale; }

    public int getPainLevel() { return painLevel; }
    public void setPainLevel(int painLevel) { this.painLevel = painLevel; }

    public int getEnergyLevel() { return energyLevel; }
    public void setEnergyLevel(int energyLevel) { this.energyLevel = energyLevel; }

    public String getDailyObservations() { return dailyObservations; }
    public void setDailyObservations(String dailyObservations) { this.dailyObservations = dailyObservations; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

