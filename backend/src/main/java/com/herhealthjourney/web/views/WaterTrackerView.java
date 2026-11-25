package com.herhealthjourney.web.views;

import com.herhealthjourney.dto.WaterProgressDto;
import com.herhealthjourney.dto.WaterRecordDto;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.service.WaterTrackerService;
import com.herhealthjourney.web.MainLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.progressbar.ProgressBar;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;

@Route(value = "water-tracker", layout = MainLayout.class)
@PageTitle("Water Tracker | HER HEALTH JOURNEY")
@PermitAll
public class WaterTrackerView extends VerticalLayout {

    private final WaterTrackerService waterService;
    private final User currentUser;
    private final ProgressBar progressBar = new ProgressBar();
    private final H3 progressLabel = new H3();
    private final Span progressDetail = new Span();
    private final Grid<WaterRecordDto> grid = new Grid<>(WaterRecordDto.class, false);

    public WaterTrackerView(WaterTrackerService waterService, UserRepository userRepository) {
        this.waterService = waterService;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        this.currentUser = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);

        setPadding(true);
        setSpacing(true);
        setWidthFull();

        H2 title = new H2("Hydration Tracker");
        title.getStyle().set("color", "#54243D").set("margin-bottom", "4px");
        Span sub = new Span("Maintain healthy hydration levels to relieve bloating and support hormonal equilibrium.");
        sub.getStyle().set("color", "#B66F86").set("font-size", "0.92rem");

        // Hydration Progress Card
        VerticalLayout progressCard = new VerticalLayout();
        progressCard.setWidthFull();
        progressCard.getStyle().set("background-color", "#FFFFFF")
                               .set("padding", "24px")
                               .set("border-radius", "8px")
                               .set("border", "1px solid #EBE4E7")
                               .set("box-shadow", "0 2px 8px rgba(84, 36, 61, 0.05)");

        progressLabel.getStyle().set("color", "#54243D").set("margin", "0 0 8px 0");
        progressBar.setWidthFull();
        progressBar.getStyle().set("height", "14px");
        progressDetail.getStyle().set("color", "#666666").set("font-size", "0.9rem").set("margin-top", "6px");

        // Quick add buttons
        Button add250 = new Button("+250 ml (Glass)", e -> addWater(250));
        add250.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        add250.getStyle().set("background-color", "#C65F83").set("color", "#FFFFFF");

        Button add500 = new Button("+500 ml (Bottle)", e -> addWater(500));
        add500.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        add500.getStyle().set("background-color", "#B66F86").set("color", "#FFFFFF");

        Button resetBtn = new Button("Reset Today", e -> {
            waterService.logWater(currentUser, new WaterRecordDto(null, LocalDate.now(), 0, 2000));
            refresh();
            Notification.show("Reset hydration to 0 ml", 2000, Notification.Position.TOP_CENTER);
        });
        resetBtn.addThemeVariants(ButtonVariant.LUMO_TERTIARY);

        HorizontalLayout actionRow = new HorizontalLayout(add250, add500, resetBtn);
        actionRow.setSpacing(true);
        actionRow.getStyle().set("margin-top", "16px");

        progressCard.add(progressLabel, progressBar, progressDetail, actionRow);

        configureGrid();
        refresh();

        add(title, sub, progressCard, new H3("Intake History"), grid);
    }

    private void addWater(int ml) {
        waterService.addIntake(currentUser, ml);
        refresh();
        Notification.show("Added " + ml + " ml of water", 2000, Notification.Position.TOP_CENTER);
    }

    private void configureGrid() {
        grid.addColumn(WaterRecordDto::recordDate).setHeader("Date").setSortable(true);
        grid.addColumn(r -> r.amountMl() + " ml").setHeader("Total Intake");
        grid.addColumn(r -> r.dailyGoalMl() + " ml").setHeader("Daily Goal");
        grid.addColumn(r -> Math.round((double) r.amountMl() / r.dailyGoalMl() * 100) + " %").setHeader("Completion");
    }

    private void refresh() {
        if (currentUser != null) {
            WaterProgressDto progress = waterService.getTodayProgress(currentUser);
            progressLabel.setText(progress.currentAmountMl() + " ml / " + progress.dailyGoalMl() + " ml");
            progressBar.setValue(Math.min(1.0, (double) progress.percentageCompleted() / 100));
            progressDetail.setText(progress.percentageCompleted() + "% of daily goal achieved" + (progress.goalReached() ? " 🎉 Goal reached!" : ""));

            grid.setItems(waterService.getRecords(currentUser, null, null));
        }
    }
}

