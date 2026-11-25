package com.herhealthjourney.web.views;

import com.herhealthjourney.dto.NutritionRecordDto;
import com.herhealthjourney.entity.NutritionRecord.MealType;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.service.NutritionService;
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

@Route(value = "nutrition", layout = MainLayout.class)
@PageTitle("Nutrition & Diet | HER HEALTH JOURNEY")
@PermitAll
public class NutritionView extends VerticalLayout {

    private final NutritionService nutritionService;
    private final User currentUser;
    private final Grid<NutritionRecordDto> grid = new Grid<>(NutritionRecordDto.class, false);

    public NutritionView(NutritionService nutritionService, UserRepository userRepository) {
        this.nutritionService = nutritionService;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        this.currentUser = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);

        setPadding(true);
        setSpacing(true);
        setWidthFull();

        H2 title = new H2("Nutrition & Food Diary");
        title.getStyle().set("color", "#54243D").set("margin-bottom", "4px");
        Span sub = new Span("Track your meals and nutritional choices to understand metabolic patterns and PCOS health.");
        sub.getStyle().set("color", "#B66F86").set("font-size", "0.92rem");

        Button addBtn = new Button("Log Meal", e -> openDialog(null));
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
        grid.addColumn(NutritionRecordDto::recordDate).setHeader("Date").setSortable(true);
        grid.addColumn(NutritionRecordDto::mealType).setHeader("Meal");
        grid.addColumn(NutritionRecordDto::foodDescription).setHeader("Food Description").setFlexGrow(3);
        grid.addColumn(r -> r.caloriesEstimate() != null ? r.caloriesEstimate() + " kcal" : "-").setHeader("Calories");

        grid.addComponentColumn(record -> {
            Button editBtn = new Button("Edit", e -> openDialog(record));
            editBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);

            Button delBtn = new Button("Delete", e -> {
                nutritionService.deleteRecord(currentUser, record.id());
                Notification.show("Meal entry deleted", 2000, Notification.Position.TOP_CENTER);
                refreshGrid();
            });
            delBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_ERROR);

            return new HorizontalLayout(editBtn, delBtn);
        }).setHeader("Actions");
    }

    private void refreshGrid() {
        if (currentUser != null) {
            grid.setItems(nutritionService.getRecords(currentUser, null, null));
        }
    }

    private void openDialog(NutritionRecordDto existing) {
        Dialog dialog = new Dialog();
        dialog.setHeaderTitle(existing == null ? "Log Meal" : "Edit Meal");

        DatePicker datePicker = new DatePicker("Meal Date");
        datePicker.setValue(existing != null ? existing.recordDate() : LocalDate.now());

        ComboBox<MealType> mealCombo = new ComboBox<>("Meal Category", MealType.values());
        mealCombo.setValue(existing != null ? existing.mealType() : MealType.BREAKFAST);

        TextArea descArea = new TextArea("Food Items & Ingredients");
        if (existing != null) descArea.setValue(existing.foodDescription());

        IntegerField calField = new IntegerField("Approximate Calories (Optional)");
        if (existing != null && existing.caloriesEstimate() != null) calField.setValue(existing.caloriesEstimate());

        VerticalLayout form = new VerticalLayout(datePicker, mealCombo, descArea, calField);

        Button saveBtn = new Button("Save Meal", e -> {
            if (descArea.isEmpty()) {
                Notification.show("Food description is required", 3000, Notification.Position.TOP_CENTER);
                return;
            }
            NutritionRecordDto dto = new NutritionRecordDto(
                existing != null ? existing.id() : null,
                datePicker.getValue(),
                mealCombo.getValue(),
                descArea.getValue(),
                calField.getValue()
            );

            if (existing == null) {
                nutritionService.createRecord(currentUser, dto);
            } else {
                nutritionService.updateRecord(currentUser, existing.id(), dto);
            }

            dialog.close();
            refreshGrid();
            Notification.show("Meal logged successfully", 3000, Notification.Position.TOP_CENTER);
        });
        saveBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        saveBtn.getStyle().set("background-color", "#C65F83");

        Button cancelBtn = new Button("Cancel", e -> dialog.close());

        dialog.add(form);
        dialog.getFooter().add(cancelBtn, saveBtn);
        dialog.open();
    }
}

