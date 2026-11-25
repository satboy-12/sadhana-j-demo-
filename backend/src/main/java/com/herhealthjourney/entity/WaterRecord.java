package com.herhealthjourney.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_records")
public class WaterRecord {

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

    @Min(0)
    @Column(name = "amount_ml", nullable = false)
    private int amountMl;

    @Min(1)
    @Column(name = "daily_goal_ml", nullable = false)
    private int dailyGoalMl = 2000;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public WaterRecord() {}

    public WaterRecord(User user, LocalDate recordDate, int amountMl, int dailyGoalMl) {
        this.user = user;
        this.recordDate = recordDate;
        this.amountMl = amountMl;
        this.dailyGoalMl = dailyGoalMl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public int getAmountMl() { return amountMl; }
    public void setAmountMl(int amountMl) { this.amountMl = amountMl; }

    public int getDailyGoalMl() { return dailyGoalMl; }
    public void setDailyGoalMl(int dailyGoalMl) { this.dailyGoalMl = dailyGoalMl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

