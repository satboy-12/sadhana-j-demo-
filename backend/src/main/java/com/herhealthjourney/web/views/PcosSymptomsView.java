package com.herhealthjourney.web.views;

import com.herhealthjourney.dto.SymptomRecordDto;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.service.SymptomService;
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
import com.vaadin.flow.component.textfield.IntegerField;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;

@Route(value = "pcos-symptoms", layout = MainLayout.class)
@PageTitle("PCOS Symptoms | HER HEALTH JOURNEY")
@PermitAll
public class PcosSymptomsView extends VerticalLayout {

    private final SymptomService symptomService;
    private final User currentUser;
    private final Grid<SymptomRecordDto> grid = new Grid<>(SymptomRecordDto.class, false);

    private static final List<String> COMMON_SYMPTOMS = List.of(
        "Pelvic Pain & Cramping",
        "Bloating & Water Retention",
        "Fatigue & Low Energy",
        "Hormonal Acne Flare",
        "Hirsutism / Unwanted Hair",
        "Mood Swings / Irritability",
        "Headache / Migraine",
        "Sugar Cravings"
    );

    public PcosSymptomsView(SymptomService symptomService, UserRepository userRepository) {
        this.symptomService = symptomService;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        this.currentUser = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);

        setPadding(true);
        setSpacing(true);
        setWidthFull();

        H2 title = new H2("PCOS Symptom Tracker");
        title.getStyle().set("color", "#54243D").set("margin-bottom", "4px");
        Span sub = new Span("Record daily observations, severity levels, and energy variations to identify patterns over time.");
        sub.getStyle().set("color", "#B66F86").set("font-size", "0.92rem");

        Button addBtn = new Button("Log Symptom", e -> openDialog(null));
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
        grid.addColumn(SymptomRecordDto::recordDate).setHeader("Date").setSortable(true);
        grid.addColumn(SymptomRecordDto::symptomType).setHeader("Symptom Type").setFlexGrow(2);
        grid.addColumn(r -> r.severityScale() + " / 5").setHeader("Severity");
        grid.addColumn(r -> r.painLevel() + " / 10").setHeader("Discomfort");
        grid.addColumn(r -> r.energyLevel() + " / 5").setHeader("Energy Level");
        grid.addColumn(SymptomRecordDto::dailyObservations).setHeader("Observations").setFlexGrow(2);

        grid.addComponentColumn(record -> {
            Button editBtn = new Button("Edit", e -> openDialog(record));
            editBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);

            Button delBtn = new Button("Delete", e -> {
                symptomService.deleteRecord(currentUser, record.id());
                Notification.show("Symptom deleted", 2000, Notification.Position.TOP_CENTER);
                refreshGrid();
            });
            delBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_ERROR);

            return new HorizontalLayout(editBtn, delBtn);
        }).setHeader("Actions");
    }

    private void refreshGrid() {
        if (currentUser != null) {
            grid.setItems(symptomService.getRecords(currentUser, null, null));
        }
    }

    private void openDialog(SymptomRecordDto existing) {
        Dialog dialog = new Dialog();
        dialog.setHeaderTitle(existing == null ? "Log Symptom" : "Edit Symptom");

        DatePicker datePicker = new DatePicker("Observation Date");
        datePicker.setValue(existing != null ? existing.recordDate() : LocalDate.now());

        ComboBox<String> symptomCombo = new ComboBox<>("Symptom Type", COMMON_SYMPTOMS);
        symptomCombo.setAllowCustomValue(true);
        if (existing != null) symptomCombo.setValue(existing.symptomType());

        IntegerField severityField = new IntegerField("Severity Scale (1 = Mild, 5 = Severe)");
        severityField.setMin(1); severityField.setMax(5);
        severityField.setValue(existing != null ? existing.severityScale() : 2);

        IntegerField painField = new IntegerField("Discomfort / Pain Level (0 = None, 10 = Severe)");
        painField.setMin(0); painField.setMax(10);
        painField.setValue(existing != null ? existing.painLevel() : 2);

        IntegerField energyField = new IntegerField("Energy Level (1 = Exhausted, 5 = High Energy)");
        energyField.setMin(1); energyField.setMax(5);
        energyField.setValue(existing != null ? existing.energyLevel() : 3);

        TextArea observationsArea = new TextArea("Observations & Triggers");
        if (existing != null) observationsArea.setValue(existing.dailyObservations() != null ? existing.dailyObservations() : "");

        VerticalLayout form = new VerticalLayout(datePicker, symptomCombo, severityField, painField, energyField, observationsArea);

        Button saveBtn = new Button("Save Observation", e -> {
            if (symptomCombo.isEmpty()) {
                Notification.show("Symptom type is required", 3000, Notification.Position.TOP_CENTER);
                return;
            }
            SymptomRecordDto dto = new SymptomRecordDto(
                existing != null ? existing.id() : null,
                datePicker.getValue(),
                symptomCombo.getValue(),
                severityField.getValue() != null ? severityField.getValue() : 1,
                painField.getValue() != null ? painField.getValue() : 0,
                energyField.getValue() != null ? energyField.getValue() : 3,
                observationsArea.getValue()
            );

            if (existing == null) {
                symptomService.createRecord(currentUser, dto);
            } else {
                symptomService.updateRecord(currentUser, existing.id(), dto);
            }

            dialog.close();
            refreshGrid();
            Notification.show("Symptom recorded successfully", 3000, Notification.Position.TOP_CENTER);
        });
        saveBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        saveBtn.getStyle().set("background-color", "#C65F83");

        Button cancelBtn = new Button("Cancel", e -> dialog.close());

        dialog.add(form);
        dialog.getFooter().add(cancelBtn, saveBtn);
        dialog.open();
    }
}

