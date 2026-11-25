package com.herhealthjourney.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_records")
public class NutritionRecord {

    public enum MealType {
        BREAKFAST, LUNCH, DINNER, SNACK
    }

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

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;

    @NotBlank
    @Column(name = "food_description", nullable = false, columnDefinition = "TEXT")
    private String foodDescription;

    @Column(name = "calories_estimate")
    private Integer caloriesEstimate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public NutritionRecord() {}

    public NutritionRecord(User user, LocalDate recordDate, MealType mealType, String foodDescription, Integer caloriesEstimate) {
        this.user = user;
        this.recordDate = recordDate;
        this.mealType = mealType;
        this.foodDescription = foodDescription;
        this.caloriesEstimate = caloriesEstimate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public MealType getMealType() { return mealType; }
    public void setMealType(MealType mealType) { this.mealType = mealType; }

    public String getFoodDescription() { return foodDescription; }
    public void setFoodDescription(String foodDescription) { this.foodDescription = foodDescription; }

    public Integer getCaloriesEstimate() { return caloriesEstimate; }
    public void setCaloriesEstimate(Integer caloriesEstimate) { this.caloriesEstimate = caloriesEstimate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

