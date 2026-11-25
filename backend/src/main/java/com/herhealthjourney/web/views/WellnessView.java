package com.herhealthjourney.web.views;

import com.herhealthjourney.dto.WellnessRecordDto;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.service.WellnessService;
import com.herhealthjourney.web.MainLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.combobox.ComboBox;
import com.vaadin.flow.component.datepicker.DatePicker;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.BigDecimalField;
import com.vaadin.flow.component.textfield.IntegerField;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Route(value = "wellness", layout = MainLayout.class)
@PageTitle("Mood & Wellness | HER HEALTH JOURNEY")
@PermitAll
public class WellnessView extends VerticalLayout {

    private final WellnessService wellnessService;
    private final User currentUser;
    private final Grid<WellnessRecordDto> grid = new Grid<>(WellnessRecordDto.class, false);

    private static final List<String> MOODS = List.of(
        "Calm & Grounded",
        "Energized & Happy",
        "Reflective / Quiet",
        "Anxious / Overwhelmed",
        "Irritable / Sensitive",
        "Fatigued / Low"
    );

    public WellnessView(WellnessService wellnessService, UserRepository userRepository) {
        this.wellnessService = wellnessService;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        this.currentUser = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);

        setPadding(true);
        setSpacing(true);
        setWidthFull();

        H2 title = new H2("Mood & Wellness Logs");
        title.getStyle().set("color", "#54243D").set("margin-bottom", "4px");
        Span sub = new Span("Monitor your daily mental wellness, sleep duration, sleep quality, and perceived stress.");
        sub.getStyle().set("color", "#B66F86").set("font-size", "0.92rem");

        Button addBtn = new Button("Log Mood & Sleep", e -> openDialog(null));
        addBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        addBtn.getStyle().set("background-color", "#C65F83").set("color", "#FFFFFF");

        HorizontalLayout toolbar = new HorizontalLayout(addBtn);
        toolbar.setWidthFull();
        toolbar.setJustifyContentMode(JustifyContentMode.END);

        configureGrid();
        refreshGrid();

        add(title, sub, toolbar, grid);
    }

    private void configureGrid() {
        grid.addColumn(WellnessRecordDto::recordDate).setHeader("Date").setSortable(true);
        grid.addColumn(WellnessRecordDto::mood).setHeader("Mood State").setFlexGrow(2);
        grid.addColumn(r -> r.sleepHours() + " hrs").setHeader("Sleep Duration");
        grid.addColumn(r -> r.sleepQuality() + " / 5").setHeader("Sleep Quality");
        grid.addColumn(r -> r.stressLevel() + " / 5").setHeader("Stress Level");
        grid.addColumn(WellnessRecordDto::wellnessNotes).setHeader("Reflections").setFlexGrow(2);

        grid.addComponentColumn(record -> {
            Button editBtn = new Button("Edit", e -> openDialog(record));
            editBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);

            Button delBtn = new Button("Delete", e -> {
                wellnessService.deleteRecord(currentUser, record.id());
                Notification.show("Wellness record deleted", 2000, Notification.Position.TOP_CENTER);
                refreshGrid();
            });
            delBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_ERROR);

            return new HorizontalLayout(editBtn, delBtn);
        }).setHeader("Actions");
    }

    private void refreshGrid() {
        if (currentUser != null) {
            grid.setItems(wellnessService.getRecords(currentUser, null, null));
        }
    }

    private void openDialog(WellnessRecordDto existing) {
        Dialog dialog = new Dialog();
        dialog.setHeaderTitle(existing == null ? "Log Daily Wellness" : "Edit Wellness");

        DatePicker datePicker = new DatePicker("Record Date");
        datePicker.setValue(existing != null ? existing.recordDate() : LocalDate.now());

        ComboBox<String> moodCombo = new ComboBox<>("Mood State", MOODS);
        moodCombo.setAllowCustomValue(true);
        if (existing != null) moodCombo.setValue(existing.mood());

        BigDecimalField sleepField = new BigDecimalField("Sleep Hours (e.g. 7.5)");
        sleepField.setValue(existing != null ? existing.sleepHours() : new BigDecimal("7.50"));

        IntegerField sleepQualField = new IntegerField("Sleep Quality (1 = Poor, 5 = Excellent)");
        sleepQualField.setMin(1); sleepQualField.setMax(5);
        sleepQualField.setValue(existing != null ? existing.sleepQuality() : 4);

        IntegerField stressField = new IntegerField("Stress Level (1 = Relaxed, 5 = High Stress)");
        stressField.setMin(1); stressField.setMax(5);
        stressField.setValue(existing != null ? existing.stressLevel() : 2);

        TextArea notesArea = new TextArea("Notes & Reflections");
        if (existing != null) notesArea.setValue(existing.wellnessNotes() != null ? existing.wellnessNotes() : "");

        VerticalLayout form = new VerticalLayout(datePicker, moodCombo, sleepField, sleepQualField, stressField, notesArea);

        Button saveBtn = new Button("Save Entry", e -> {
            if (moodCombo.isEmpty() || sleepField.isEmpty()) {
                Notification.show("Mood and sleep hours are required", 3000, Notification.Position.TOP_CENTER);
                return;
            }
            WellnessRecordDto dto = new WellnessRecordDto(
                existing != null ? existing.id() : null,
                datePicker.getValue(),
                moodCombo.getValue(),
                sleepField.getValue(),
                sleepQualField.getValue() != null ? sleepQualField.getValue() : 3,
                stressField.getValue() != null ? stressField.getValue() : 3,
                notesArea.getValue()
            );

            if (existing == null) {
                wellnessService.createRecord(currentUser, dto);
            } else {
                wellnessService.updateRecord(currentUser, existing.id(), dto);
            }

            dialog.close();
            refreshGrid();
            Notification.show("Wellness record saved", 3000, Notification.Position.TOP_CENTER);
        });
        saveBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        saveBtn.getStyle().set("background-color", "#C65F83");

        Button cancelBtn = new Button("Cancel", e -> dialog.close());

        dialog.add(form);
        dialog.getFooter().add(cancelBtn, saveBtn);
        dialog.open();
    }
}

