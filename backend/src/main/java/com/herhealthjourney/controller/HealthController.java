package com.herhealthjourney.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Health Check", description = "System and service status verification")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Application health status", description = "Used by container healthchecks, cloud monitors and pingers")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "application", "HER HEALTH JOURNEY"
        ));
    }
}

