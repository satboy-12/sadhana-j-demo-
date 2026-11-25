package com.herhealthjourney.web.views;

import com.herhealthjourney.entity.User;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.web.MainLayout;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.VaadinServletRequest;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;

import java.time.format.DateTimeFormatter;

@Route(value = "profile", layout = MainLayout.class)
@PageTitle("Profile & Privacy | HER HEALTH JOURNEY")
@PermitAll
public class ProfileView extends VerticalLayout {

    public ProfileView(UserRepository userRepository) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);

        setPadding(true);
        setSpacing(true);
        setWidthFull();

        H2 title = new H2("Account & Privacy Settings");
        title.getStyle().set("color", "#54243D").set("margin-bottom", "4px");
        Span sub = new Span("Manage your account details and privacy configuration.");
        sub.getStyle().set("color", "#B66F86").set("font-size", "0.92rem");

        if (currentUser != null) {
            VerticalLayout card = new VerticalLayout();
            card.setMaxWidth("600px");
            card.getStyle().set("background-color", "#FFFFFF")
                           .set("padding", "28px")
                           .set("border-radius", "8px")
                           .set("border", "1px solid #EBE4E7")
                           .set("box-shadow", "0 2px 8px rgba(84, 36, 61, 0.05)")
                           .set("margin-top", "16px");

            H3 profileHeading = new H3("Personal Profile");
            profileHeading.getStyle().set("color", "#54243D").set("margin-top", "0");

            TextField usernameField = new TextField("Username", currentUser.getUsername(), "");
            usernameField.setReadOnly(true);
            usernameField.setWidthFull();

            TextField emailField = new TextField("Email Address", currentUser.getEmail(), "");
            emailField.setReadOnly(true);
            emailField.setWidthFull();

            TextField nameField = new TextField("Full Name", currentUser.getFirstName() + " " + currentUser.getLastName(), "");
            nameField.setReadOnly(true);
            nameField.setWidthFull();

            String dob = currentUser.getDateOfBirth() != null 
                ? currentUser.getDateOfBirth().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")) 
                : "Not set";
            TextField dobField = new TextField("Date of Birth", dob, "");
            dobField.setReadOnly(true);
            dobField.setWidthFull();

            Button logoutBtn = new Button("Sign Out of Session", e -> {
                SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
                logoutHandler.logout(VaadinServletRequest.getCurrent().getHttpServletRequest(), null, null);
                UI.getCurrent().getPage().setLocation("/login");
            });
            logoutBtn.addThemeVariants(ButtonVariant.LUMO_ERROR);
            logoutBtn.getStyle().set("margin-top", "20px");

            card.add(profileHeading, usernameField, emailField, nameField, dobField, logoutBtn);
            add(title, sub, card);
        }
    }
}

