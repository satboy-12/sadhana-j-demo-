package com.herhealthjourney.web.views;

import com.herhealthjourney.dto.PeriodSummaryDto;
import com.herhealthjourney.dto.WaterProgressDto;
import com.herhealthjourney.dto.WellnessRecordDto;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.service.*;
import com.herhealthjourney.web.MainLayout;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.progressbar.ProgressBar;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouteAlias;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.format.DateTimeFormatter;

@Route(value = "", layout = MainLayout.class)
@RouteAlias(value = "dashboard", layout = MainLayout.class)
@PageTitle("Dashboard | HER HEALTH JOURNEY")
@PermitAll
public class DashboardView extends VerticalLayout {

    public DashboardView(UserRepository userRepository,
                         PeriodTrackerService periodService,
                         WaterTrackerService waterService,
                         WellnessService wellnessService,
                         SymptomService symptomService) {
        setPadding(true);
        setSpacing(true);
        setWidthFull();
        getStyle().set("background-color", "#FAFAFA");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
            .or(() -> userRepository.findByEmail(auth.getName()))
            .orElse(null);

        if (currentUser == null) {
            add(new Paragraph("Please log in to view your dashboard."));
            return;
        }

        H2 greeting = new H2("Welcome, " + currentUser.getFirstName());
        greeting.getStyle().set("color", "#54243D").set("margin-top", "12px").set("margin-bottom", "4px");
        Span subGreeting = new Span("Here is your holistic health summary for today.");
        subGreeting.getStyle().set("color", "#B66F86").set("font-size", "0.95rem");

        // 4 Summary Metrics Cards
        HorizontalLayout metricsGrid = new HorizontalLayout();
        metricsGrid.setWidthFull();
        metricsGrid.setSpacing(true);

        // 1. Period Card
        PeriodSummaryDto periodSummary = periodService.calculateCycleSummary(currentUser);
        VerticalLayout periodCard = createMetricCard(
            "Cycle Status",
            periodSummary.estimatedNextPeriodStart() != null 
                ? "Next: " + periodSummary.estimatedNextPeriodStart().format(DateTimeFormatter.ofPattern("MMM dd"))
                : "Cycle: " + periodSummary.averageCycleLengthDays() + " days",
            "Avg length: " + periodSummary.averageCycleLengthDays() + " days",
            "Log Period",
            () -> UI.getCurrent().navigate(PeriodTrackerView.class)
        );

        // 2. Hydration Card
        WaterProgressDto waterProgress = waterService.getTodayProgress(currentUser);
        VerticalLayout waterCard = createWaterCard(waterProgress, () -> UI.getCurrent().navigate(WaterTrackerView.class));

        // 3. Wellness Card
        WellnessRecordDto wellness = wellnessService.getLatestMood(currentUser);
        VerticalLayout wellnessCard = createMetricCard(
            "Mood & Rest",
            wellness != null ? wellness.mood() : "Not Logged",
            wellness != null ? "Sleep: " + wellness.sleepHours() + "h" : "Track sleep & stress",
            "Log Mood",
            () -> UI.getCurrent().navigate(WellnessView.class)
        );

        // 4. Symptoms Card
        var recentSymptoms = symptomService.getRecentSymptoms(currentUser);
        VerticalLayout symptomCard = createMetricCard(
            "PCOS Symptoms",
            recentSymptoms.isEmpty() ? "No symptoms today" : recentSymptoms.get(0).symptomType(),
            recentSymptoms.isEmpty() ? "Feeling balanced" : "Severity: " + recentSymptoms.get(0).severityScale() + "/5",
            "Log Symptom",
            () -> UI.getCurrent().navigate(PcosSymptomsView.class)
        );

        metricsGrid.add(periodCard, waterCard, wellnessCard, symptomCard);

        // Medical Disclaimer Callout
        VerticalLayout disclaimerBanner = new VerticalLayout();
        disclaimerBanner.setWidthFull();
        disclaimerBanner.getStyle().set("background-color", "#F8E7ED")
                                  .set("border-left", "4px solid #C65F83")
                                  .set("padding", "16px")
                                  .set("border-radius", "4px")
                                  .set("margin-top", "24px");
        Span disclaimerTitle = new Span("Important Health Notice");
        disclaimerTitle.getStyle().set("font-weight", "600").set("color", "#54243D").set("font-size", "0.9rem");
        Paragraph disclaimerText = new Paragraph("HER HEALTH JOURNEY provides statistical estimates based on your logged history. The application is designed for lifestyle and tracking support and does not diagnose, prescribe, or provide medical advice.");
        disclaimerText.getStyle().set("color", "#54243D").set("font-size", "0.85rem").set("margin", "0");
        disclaimerBanner.add(disclaimerTitle, disclaimerText);

        add(greeting, subGreeting, metricsGrid, disclaimerBanner);
    }

    private VerticalLayout createMetricCard(String title, String mainValue, String subValue, String buttonLabel, Runnable action) {
        VerticalLayout card = new VerticalLayout();
        card.setWidthFull();
        card.getStyle().set("background-color", "#FFFFFF")
                       .set("padding", "20px")
                       .set("border-radius", "8px")
                       .set("border", "1px solid #EBE4E7")
                       .set("box-shadow", "0 2px 6px rgba(84, 36, 61, 0.04)");

        Span header = new Span(title);
        header.getStyle().set("color", "#B66F86").set("font-size", "0.82rem").set("font-weight", "600").set("text-transform", "uppercase");

        H3 val = new H3(mainValue);
        val.getStyle().set("color", "#54243D").set("margin", "6px 0 2px 0").set("font-size", "1.25rem");

        Span sub = new Span(subValue);
        sub.getStyle().set("color", "#666666").set("font-size", "0.85rem");

        Button btn = new Button(buttonLabel, e -> action.run());
        btn.addThemeVariants(ButtonVariant.LUMO_SMALL);
        btn.getStyle().set("color", "#C65F83").set("background-color", "#F8E7ED").set("font-weight", "600").set("margin-top", "12px");

        card.add(header, val, sub, btn);
        return card;
    }

    private VerticalLayout createWaterCard(WaterProgressDto progress, Runnable action) {
        VerticalLayout card = new VerticalLayout();
        card.setWidthFull();
        card.getStyle().set("background-color", "#FFFFFF")
                       .set("padding", "20px")
                       .set("border-radius", "8px")
                       .set("border", "1px solid #EBE4E7")
                       .set("box-shadow", "0 2px 6px rgba(84, 36, 61, 0.04)");

        Span header = new Span("Hydration Tracker");
        header.getStyle().set("color", "#B66F86").set("font-size", "0.82rem").set("font-weight", "600").set("text-transform", "uppercase");

        H3 val = new H3(progress.currentAmountMl() + " / " + progress.dailyGoalMl() + " ml");
        val.getStyle().set("color", "#54243D").set("margin", "6px 0 4px 0").set("font-size", "1.25rem");

        ProgressBar pb = new ProgressBar();
        pb.setValue(Math.min(1.0, (double) progress.percentageCompleted() / 100));
        pb.getStyle().set("height", "8px");

        Span sub = new Span(progress.percentageCompleted() + "% of daily target");
        sub.getStyle().set("color", "#666666").set("font-size", "0.82rem");

        Button btn = new Button("Log Water", e -> action.run());
        btn.addThemeVariants(ButtonVariant.LUMO_SMALL);
        btn.getStyle().set("color", "#C65F83").set("background-color", "#F8E7ED").set("font-weight", "600").set("margin-top", "12px");

        card.add(header, val, pb, sub, btn);
        return card;
    }
}

