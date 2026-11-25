package com.herhealthjourney.web.views;

import com.herhealthjourney.dto.RegisterRequest;
import com.herhealthjourney.service.AuthService;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.datepicker.DatePicker;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.EmailField;
import com.vaadin.flow.component.textfield.PasswordField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@Route("register")
@PageTitle("Create Account | HER HEALTH JOURNEY")
@AnonymousAllowed
public class RegistrationView extends VerticalLayout {

    public RegistrationView(AuthService authService) {
        setSizeFull();
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);
        getStyle().set("background-color", "#F8E7ED");

        VerticalLayout card = new VerticalLayout();
        card.setMaxWidth("480px");
        card.getStyle().set("background-color", "#FFFFFF")
                       .set("padding", "32px")
                       .set("border-radius", "8px")
                       .set("border", "1px solid #E6D0D8")
                       .set("box-shadow", "0 4px 12px rgba(84, 36, 61, 0.05)");

        H1 title = new H1("Create Account");
        title.getStyle().set("color", "#54243D").set("font-size", "1.4rem").set("margin-bottom", "4px");

        Span subtitle = new Span("Begin your personalized wellness tracking");
        subtitle.getStyle().set("color", "#B66F86").set("font-size", "0.88rem").set("margin-bottom", "16px");

        TextField usernameField = new TextField("Username");
        usernameField.setWidthFull();
        usernameField.setRequired(true);

        EmailField emailField = new EmailField("Email");
        emailField.setWidthFull();
        emailField.setRequired(true);

        HorizontalLayout nameRow = new HorizontalLayout();
        nameRow.setWidthFull();
        TextField firstNameField = new TextField("First Name");
        firstNameField.setWidthFull();
        firstNameField.setRequired(true);
        TextField lastNameField = new TextField("Last Name");
        lastNameField.setWidthFull();
        lastNameField.setRequired(true);
        nameRow.add(firstNameField, lastNameField);

        DatePicker dobPicker = new DatePicker("Date of Birth");
        dobPicker.setWidthFull();

        PasswordField passwordField = new PasswordField("Password (min 6 characters)");
        passwordField.setWidthFull();
        passwordField.setRequired(true);

        Button submitBtn = new Button("Register", e -> {
            try {
                if (usernameField.isEmpty() || emailField.isEmpty() || passwordField.isEmpty() || firstNameField.isEmpty() || lastNameField.isEmpty()) {
                    Notification.show("Please fill out all required fields.", 3000, Notification.Position.TOP_CENTER);
                    return;
                }
                RegisterRequest req = new RegisterRequest(
                    usernameField.getValue(),
                    emailField.getValue(),
                    passwordField.getValue(),
                    firstNameField.getValue(),
                    lastNameField.getValue(),
                    dobPicker.getValue()
                );
                authService.register(req);
                Notification n = Notification.show("Account created successfully! Please sign in.", 4000, Notification.Position.TOP_CENTER);
                n.addThemeVariants(NotificationVariant.LUMO_SUCCESS);
                UI.getCurrent().navigate(LoginView.class);
            } catch (Exception ex) {
                Notification n = Notification.show(ex.getMessage(), 4000, Notification.Position.TOP_CENTER);
                n.addThemeVariants(NotificationVariant.LUMO_ERROR);
            }
        });
        submitBtn.setWidthFull();
        submitBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        submitBtn.getStyle().set("background-color", "#C65F83").set("color", "#FFFFFF").set("margin-top", "12px");

        Button loginLink = new Button("Already registered? Sign in", e -> UI.getCurrent().navigate(LoginView.class));
        loginLink.addThemeVariants(ButtonVariant.LUMO_TERTIARY);
        loginLink.getStyle().set("color", "#C65F83");

        card.add(title, subtitle, usernameField, emailField, nameRow, dobPicker, passwordField, submitBtn, loginLink);
        add(card);
    }
}

