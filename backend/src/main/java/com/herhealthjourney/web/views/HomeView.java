package com.herhealthjourney.web.views;

import com.herhealthjourney.web.MainLayout;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@Route(value = "home", layout = MainLayout.class)
@PageTitle("Welcome | HER HEALTH JOURNEY")
@AnonymousAllowed
public class HomeView extends VerticalLayout {

    public HomeView() {
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);
        setSizeFull();
        getStyle().set("background-color", "#F8E7ED");

        VerticalLayout card = new VerticalLayout();
        card.setMaxWidth("720px");
        card.getStyle().set("background-color", "#FFFFFF")
                       .set("padding", "40px")
                       .set("border-radius", "8px")
                       .set("border", "1px solid #E6D0D8")
                       .set("box-shadow", "0 4px 12px rgba(84, 36, 61, 0.05)");

        H1 title = new H1("HER HEALTH JOURNEY");
        title.getStyle().set("color", "#54243D")
                        .set("margin-bottom", "8px")
                        .set("font-size", "2rem");

        H2 subtitle = new H2("Period, PCOS and Wellness Tracking System");
        subtitle.getStyle().set("color", "#C65F83")
                           .set("margin-top", "0")
                           .set("font-size", "1.1rem")
                           .set("font-weight", "500");

        Paragraph desc = new Paragraph("A clinical-grade, dignified health management platform empowering women to track menstrual cycles, monitor PCOS symptoms with scientific clarity, and balance daily nutrition, hydration, and mental well-being.");
        desc.getStyle().set("color", "#54243D")
                       .set("line-height", "1.6")
                       .set("font-size", "1rem");

        Button loginBtn = new Button("Sign In", e -> UI.getCurrent().navigate(LoginView.class));
        loginBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        loginBtn.getStyle().set("background-color", "#C65F83")
                           .set("color", "#FFFFFF")
                           .set("font-weight", "600");

        Button registerBtn = new Button("Create Account", e -> UI.getCurrent().navigate(RegistrationView.class));
        registerBtn.getStyle().set("color", "#54243D")
                              .set("border", "1px solid #B66F86");

        HorizontalLayout buttons = new HorizontalLayout(loginBtn, registerBtn);
        buttons.setSpacing(true);

        card.add(title, subtitle, desc, buttons);
        add(card);
    }
}

