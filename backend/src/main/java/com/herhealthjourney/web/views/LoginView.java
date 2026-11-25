package com.herhealthjourney.web.views;

import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.login.LoginForm;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.BeforeEnterEvent;
import com.vaadin.flow.router.BeforeEnterObserver;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@Route("login")
@PageTitle("Login | HER HEALTH JOURNEY")
@AnonymousAllowed
public class LoginView extends VerticalLayout implements BeforeEnterObserver {

    private final LoginForm login = new LoginForm();

    public LoginView() {
        setSizeFull();
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);
        getStyle().set("background-color", "#F8E7ED");

        VerticalLayout card = new VerticalLayout();
        card.setMaxWidth("420px");
        card.setAlignItems(Alignment.CENTER);
        card.getStyle().set("background-color", "#FFFFFF")
                       .set("padding", "32px")
                       .set("border-radius", "8px")
                       .set("border", "1px solid #E6D0D8")
                       .set("box-shadow", "0 4px 12px rgba(84, 36, 61, 0.05)");

        H1 title = new H1("HER HEALTH JOURNEY");
        title.getStyle().set("color", "#54243D")
                        .set("font-size", "1.4rem")
                        .set("font-weight", "700")
                        .set("margin-bottom", "4px");

        Span subtitle = new Span("Sign in to your private health journal");
        subtitle.getStyle().set("color", "#B66F86")
                           .set("font-size", "0.88rem")
                           .set("margin-bottom", "16px");

        login.setAction("login");
        login.setForgotPasswordButtonVisible(false);

        Button registerLink = new Button("Don't have an account? Register here", e -> UI.getCurrent().navigate(RegistrationView.class));
        registerLink.addThemeVariants(ButtonVariant.LUMO_TERTIARY);
        registerLink.getStyle().set("color", "#C65F83").set("font-size", "0.85rem");

        card.add(title, subtitle, login, registerLink);
        add(card);
    }

    @Override
    public void beforeEnter(BeforeEnterEvent beforeEnterEvent) {
        if (beforeEnterEvent.getLocation().getQueryParameters().getParameters().containsKey("error")) {
            login.setError(true);
        }
    }
}

