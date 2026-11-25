package com.herhealthjourney.config;

import com.herhealthjourney.entity.*;
import com.herhealthjourney.entity.PeriodRecord.FlowIntensity;
import com.herhealthjourney.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                      PeriodRecordRepository periodRepository,
                                      SymptomRecordRepository symptomRepository,
                                      WellnessRecordRepository wellnessRepository,
                                      NutritionRecordRepository nutritionRepository,
                                      WaterRecordRepository waterRepository,
                                      JournalEntryRepository journalRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User demoUser = new User(
                    "demo_user",
                    "demo@herhealth.com",
                    passwordEncoder.encode("Password123!"),
                    "Sophia",
                    "Jenkins",
                    LocalDate.of(1996, 5, 14)
                );
                demoUser = userRepository.save(demoUser);

                // Sample period records
                periodRepository.save(new PeriodRecord(
                    demoUser,
                    LocalDate.now().minusDays(56),
                    LocalDate.now().minusDays(51),
                    FlowIntensity.MEDIUM,
                    4,
                    "Moderate cramps on day 1 and 2"
                ));
                periodRepository.save(new PeriodRecord(
                    demoUser,
                    LocalDate.now().minusDays(28),
                    LocalDate.now().minusDays(23),
                    FlowIntensity.HEAVY,
                    6,
                    "Used warm heating pad, fatigue"
                ));

                // Sample symptom record
                symptomRepository.save(new SymptomRecord(
                    demoUser,
                    LocalDate.now(),
                    "Pelvic Pain & Cramping",
                    3,
                    4,
                    3,
                    "Mild pelvic tightness after afternoon walk."
                ));

                // Sample wellness record
                wellnessRepository.save(new WellnessRecord(
                    demoUser,
                    LocalDate.now(),
                    "Calm & Grounded",
                    new BigDecimal("7.50"),
                    4,
                    2,
                    "Practiced 15 minutes of guided mindfulness."
                ));

                // Sample water intake
                waterRepository.save(new WaterRecord(
                    demoUser,
                    LocalDate.now(),
                    1500,
                    2000
                ));

                // Sample nutrition
                nutritionRepository.save(new NutritionRecord(
                    demoUser,
                    LocalDate.now(),
                    NutritionRecord.MealType.BREAKFAST,
                    "Oatmeal with chia seeds, blueberries, and almond milk",
                    380
                ));

                // Sample journal
                journalRepository.save(new JournalEntry(
                    demoUser,
                    LocalDate.now(),
                    "Reflections on cycle wellness",
                    "Feeling significantly more in tune with my body this month. Evening spearmint tea is very calming.",
                    true
                ));
            }
        };
    }
}

