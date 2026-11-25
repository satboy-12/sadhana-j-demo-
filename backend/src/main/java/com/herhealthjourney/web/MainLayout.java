package com.herhealthjourney.web;

import com.herhealthjourney.web.views.*;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.applayout.DrawerToggle;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.sidenav.SideNav;
import com.vaadin.flow.component.sidenav.SideNavItem;
import com.vaadin.flow.server.VaadinServletRequest;
import com.vaadin.flow.theme.lumo.LumoUtility;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;

public class MainLayout extends AppLayout {

    public MainLayout() {
        createHeader();
        createDrawer();
    }

    private void createHeader() {
        DrawerToggle toggle = new DrawerToggle();
        toggle.getStyle().set("color", "#C65F83");

        H1 logo = new H1("HER HEALTH JOURNEY");
        logo.getStyle().set("font-size", "1.2rem")
                       .set("font-weight", "700")
                       .set("letter-spacing", "0.5px")
                       .set("color", "#54243D")
                       .set("margin", "0");

        Span subtitle = new Span("Period, PCOS & Wellness Tracking System");
        subtitle.getStyle().set("font-size", "0.78rem")
                           .set("color", "#B66F86");

        VerticalLayout brandLayout = new VerticalLayout(logo, subtitle);
        brandLayout.setSpacing(false);
        brandLayout.setPadding(false);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userDisplay = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) 
                ? "Signed in as " + auth.getName() : "";
        Span userBadge = new Span(userDisplay);
        userBadge.getStyle().set("font-size", "0.85rem")
                            .set("font-weight", "500")
                            .set("color", "#54243D")
                            .set("margin-right", "10px");

        Button logoutBtn = new Button("Log out", e -> {
            SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
            logoutHandler.logout(
                VaadinServletRequest.getCurrent().getHttpServletRequest(), null, null);
            UI.getCurrent().getPage().setLocation("/login");
        });
        logoutBtn.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);
        logoutBtn.getStyle().set("color", "#C65F83");

        HorizontalLayout userActions = new HorizontalLayout(userBadge, logoutBtn);
        userActions.setDefaultVerticalComponentAlignment(FlexComponent.Alignment.CENTER);

        HorizontalLayout header = new HorizontalLayout(toggle, brandLayout, userActions);
        header.expand(brandLayout);
        header.setDefaultVerticalComponentAlignment(FlexComponent.Alignment.CENTER);
        header.setWidthFull();
        header.addClassNames(LumoUtility.Padding.Vertical.SMALL, LumoUtility.Padding.Horizontal.MEDIUM);
        header.getStyle().set("border-bottom", "1px solid #F8E7ED")
                         .set("background-color", "#FFFFFF");

        addToNavbar(header);
    }

    private void createDrawer() {
        SideNav nav = new SideNav();
        nav.getStyle().set("padding", "12px 8px");

        nav.addItem(new SideNavItem("Dashboard", DashboardView.class));
        nav.addItem(new SideNavItem("Period Tracker", PeriodTrackerView.class));
        nav.addItem(new SideNavItem("PCOS Symptoms", PcosSymptomsView.class));
        nav.addItem(new SideNavItem("Mood & Wellness", WellnessView.class));
        nav.addItem(new SideNavItem("Nutrition & Diet", NutritionView.class));
        nav.addItem(new SideNavItem("Water Tracker", WaterTrackerView.class));
        nav.addItem(new SideNavItem("Health Journal", JournalView.class));
        nav.addItem(new SideNavItem("Profile & Settings", ProfileView.class));

        addToDrawer(nav);
    }
}

