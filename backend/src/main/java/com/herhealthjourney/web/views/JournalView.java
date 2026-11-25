package com.herhealthjourney.web.views;

import com.herhealthjourney.dto.JournalEntryDto;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.service.JournalService;
import com.herhealthjourney.web.MainLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.checkbox.Checkbox;
import com.vaadin.flow.component.datepicker.DatePicker;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;

@Route(value = "journal", layout = MainLayout.class)
@PageTitle("Health Journal | HER HEALTH JOURNEY")
@PermitAll
public class JournalView extends VerticalLayout {

    private final JournalService journalService;
    private final User currentUser;
    private final Grid<JournalEntryDto> grid = new Grid<>(JournalEntryDto.class, false);

    public JournalView(JournalService journalService, UserRepository userRepository) {
        this.journalService = journalService;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        this.currentUser = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username))
                .orElse(null);

        setPadding(true);
        setSpacing(true);
        setWidthFull();

        H2 title = new H2("Private Health Journal");
        title.getStyle().set("color", "#54243D").set("margin-bottom", "4px");
        Span sub = new Span(
                "A safe, confidential space to document your physical thoughts, feelings, and body experiences.");
        sub.getStyle().set("color", "#B66F86").set("font-size", "0.92rem");

        Button addBtn = new Button("New Entry", e -> openDialog(null));
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
        grid.addColumn(JournalEntryDto::entryDate).setHeader("Date").setSortable(true);
        grid.addColumn(JournalEntryDto::title).setHeader("Title").setFlexGrow(2);
        grid.addColumn(JournalEntryDto::content).setHeader("Excerpt").setFlexGrow(3);

        grid.addComponentColumn(record -> {
            Button editBtn = new Button("Read/Edit", e -> openDialog(record));
            editBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);

            Button delBtn = new Button("Delete", e -> {
                journalService.deleteEntry(currentUser, record.id());
                Notification.show("Entry removed", 2000, Notification.Position.TOP_CENTER);
                refreshGrid();
            });
            delBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_ERROR);

            return new HorizontalLayout(editBtn, delBtn);
        }).setHeader("Actions");
    }

    private void refreshGrid() {
        if (currentUser != null) {
            grid.setItems(journalService.getEntries(currentUser, null, null));
        }
    }

    private void openDialog(JournalEntryDto existing) {
        Dialog dialog = new Dialog();
        dialog.setHeaderTitle(existing == null ? "New Journal Entry" : "Edit Journal Entry");
        dialog.setWidth("640px");

        DatePicker datePicker = new DatePicker("Entry Date");
        datePicker.setValue(existing != null ? existing.entryDate() : LocalDate.now());

        TextField titleField = new TextField("Entry Title");
        titleField.setWidthFull();
        if (existing != null)
            titleField.setValue(existing.title());

        TextArea contentArea = new TextArea("Journal Thoughts & Body Reflections");
        contentArea.setWidthFull();
        contentArea.setMinHeight("200px");
        if (existing != null)
            contentArea.setValue(existing.content());

        Checkbox privateBox = new Checkbox("Keep this entry strictly private", true);

        VerticalLayout form = new VerticalLayout(datePicker, titleField, contentArea, privateBox);

        Button saveBtn = new Button("Save Reflection", e -> {
            if (titleField.isEmpty() || contentArea.isEmpty()) {
                Notification.show("Title and content cannot be empty", 3000, Notification.Position.TOP_CENTER);
                return;
            }
            JournalEntryDto dto = new JournalEntryDto(
                    existing != null ? existing.id() : null,
                    datePicker.getValue(),
                    titleField.getValue(),
                    contentArea.getValue(),
                    privateBox.getValue());

            if (existing == null) {
                journalService.createEntry(currentUser, dto);
            } else {
                journalService.updateEntry(currentUser, existing.id(), dto);
            }

            dialog.close();
            refreshGrid();
            Notification.show("Journal entry saved", 3000, Notification.Position.TOP_CENTER);
        });
        saveBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        saveBtn.getStyle().set("background-color", "#C65F83");

        Button cancelBtn = new Button("Cancel", e -> dialog.close());

        dialog.add(form);
        dialog.getFooter().add(cancelBtn, saveBtn);
        dialog.open();
    }
}
