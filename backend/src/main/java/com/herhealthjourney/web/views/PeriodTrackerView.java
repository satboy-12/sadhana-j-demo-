package com.herhealthjourney.web.views;

import com.herhealthjourney.dto.PeriodRecordDto;
import com.herhealthjourney.dto.PeriodSummaryDto;
import com.herhealthjourney.entity.PeriodRecord.FlowIntensity;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.service.PeriodTrackerService;
import com.herhealthjourney.web.MainLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.combobox.ComboBox;
import com.vaadin.flow.component.datepicker.DatePicker;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.H3;
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
import java.time.format.DateTimeFormatter;

@Route(value = "period-tracker", layout = MainLayout.class)
@PageTitle("Period Tracker | HER HEALTH JOURNEY")
@PermitAll
public class PeriodTrackerView extends VerticalLayout {

    private final PeriodTrackerService periodService;
    private final User currentUser;
    private final Grid<PeriodRecordDto> grid = new Grid<>(PeriodRecordDto.class, false);

    public PeriodTrackerView(PeriodTrackerService periodService, UserRepository userRepository) {
        this.periodService = periodService;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        this.currentUser = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);

        setPadding(true);
        setSpacing(true);
        setWidthFull();

        H2 title = new H2("Period & Cycle Tracker");
        title.getStyle().set("color", "#54243D").set("margin-bottom", "4px");
        Span sub = new Span("Log your cycle dates, track flow patterns, and monitor your personal rhythm.");
        sub.getStyle().set("color", "#B66F86").set("font-size", "0.92rem");

        // Summary Bar
        PeriodSummaryDto summary = periodService.calculateCycleSummary(currentUser);
        HorizontalLayout summaryBar = new HorizontalLayout();
        summaryBar.setWidthFull();
        summaryBar.getStyle().set("background-color", "#F8E7ED")
                             .set("padding", "16px")
                             .set("border-radius", "8px")
                             .set("margin", "12px 0");

        VerticalLayout avgCycle = new VerticalLayout(new Span("Average Cycle"), new H3(summary.averageCycleLengthDays() + " Days"));
        avgCycle.setSpacing(false); avgCycle.setPadding(false);

        String nextEst = summary.estimatedNextPeriodStart() != null 
            ? summary.estimatedNextPeriodStart().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) 
            : "Requires 2+ cycles";
        VerticalLayout nextCycle = new VerticalLayout(new Span("Estimated Next Cycle"), new H3(nextEst));
        nextCycle.setSpacing(false); nextCycle.setPadding(false);

        summaryBar.add(avgCycle, nextCycle);

        // Action Toolbar
        Button addBtn = new Button("Log New Period", e -> openRecordDialog(null));
        addBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        addBtn.getStyle().set("background-color", "#C65F83").set("color", "#FFFFFF");

        HorizontalLayout toolbar = new HorizontalLayout(addBtn);
        toolbar.setWidthFull();
        toolbar.setJustifyContentMode(JustifyContentMode.END);

        // Grid
        configureGrid();
        refreshGrid();

        add(title, sub, summaryBar, toolbar, grid);
    }

    private void configureGrid() {
        grid.addColumn(PeriodRecordDto::startDate).setHeader("Start Date").setSortable(true);
        grid.addColumn(r -> r.endDate() != null ? r.endDate().toString() : "Ongoing").setHeader("End Date");
        grid.addColumn(PeriodRecordDto::flowIntensity).setHeader("Flow Intensity");
        grid.addColumn(r -> r.painLevel() + " / 10").setHeader("Pain Scale");
        grid.addColumn(PeriodRecordDto::notes).setHeader("Observations").setFlexGrow(2);

        grid.addComponentColumn(record -> {
            Button editBtn = new Button("Edit", e -> openRecordDialog(record));
            editBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);

            Button delBtn = new Button("Delete", e -> {
                periodService.deleteRecord(currentUser, record.id());
                Notification.show("Record deleted", 2000, Notification.Position.TOP_CENTER);
                refreshGrid();
            });
            delBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_ERROR);

            return new HorizontalLayout(editBtn, delBtn);
        }).setHeader("Actions");
    }

    private void refreshGrid() {
        if (currentUser != null) {
            grid.setItems(periodService.getRecords(currentUser, null, null));
        }
    }

    private void openRecordDialog(PeriodRecordDto existing) {
        Dialog dialog = new Dialog();
        dialog.setHeaderTitle(existing == null ? "Log Period" : "Edit Period");

        DatePicker startPicker = new DatePicker("Start Date");
        startPicker.setValue(existing != null ? existing.startDate() : LocalDate.now());
        startPicker.setRequired(true);

        DatePicker endPicker = new DatePicker("End Date (Optional)");
        if (existing != null) endPicker.setValue(existing.endDate());

        ComboBox<FlowIntensity> flowCombo = new ComboBox<>("Flow Intensity", FlowIntensity.values());
        flowCombo.setValue(existing != null ? existing.flowIntensity() : FlowIntensity.MEDIUM);

        IntegerField painField = new IntegerField("Pain Level (0-10)");
        painField.setMin(0); painField.setMax(10);
        painField.setValue(existing != null ? existing.painLevel() : 2);

        TextArea notesArea = new TextArea("Observations & Notes");
        if (existing != null) notesArea.setValue(existing.notes() != null ? existing.notes() : "");

        VerticalLayout form = new VerticalLayout(startPicker, endPicker, flowCombo, painField, notesArea);
        form.setSpacing(true);

        Button saveBtn = new Button("Save Record", e -> {
            if (startPicker.isEmpty()) {
                Notification.show("Start Date is required", 3000, Notification.Position.TOP_CENTER);
                return;
            }
            PeriodRecordDto dto = new PeriodRecordDto(
                existing != null ? existing.id() : null,
                startPicker.getValue(),
                endPicker.getValue(),
                flowCombo.getValue(),
                painField.getValue() != null ? painField.getValue() : 0,
                notesArea.getValue()
            );

            if (existing == null) {
                periodService.createRecord(currentUser, dto);
            } else {
                periodService.updateRecord(currentUser, existing.id(), dto);
            }

            dialog.close();
            refreshGrid();
            Notification.show("Cycle record saved successfully", 3000, Notification.Position.TOP_CENTER);
        });
        saveBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        saveBtn.getStyle().set("background-color", "#C65F83");

        Button cancelBtn = new Button("Cancel", e -> dialog.close());

        dialog.add(form);
        dialog.getFooter().add(cancelBtn, saveBtn);
        dialog.open();
    }
}

