package com.herhealthjourney;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.herhealthjourney.controller.AuthController;
import com.herhealthjourney.dto.AuthResponse;
import com.herhealthjourney.dto.RegisterRequest;
import com.herhealthjourney.exception.ConflictException;
import com.herhealthjourney.exception.GlobalExceptionHandler;
import com.herhealthjourney.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testRegister_returns201Created_forValidUser() throws Exception {
        RegisterRequest req = new RegisterRequest("Test User", "test@example.com", "SecurePassword123");
        AuthResponse mockResponse = new AuthResponse("mock-jwt-token", 1L, "test", "test@example.com", "Test", "User");

        when(authService.register(any(RegisterRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void testRegister_returns409Conflict_forDuplicateEmail() throws Exception {
        RegisterRequest req = new RegisterRequest("Duplicate User", "existing@example.com", "SecurePassword123");

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new ConflictException("Email is already registered. Please log in."));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email is already registered. Please log in."));
    }

    @Test
    void testRegister_returns400BadRequest_forInvalidEmail() throws Exception {
        RegisterRequest req = new RegisterRequest("Invalid User", "not-an-email", "SecurePassword123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    void testRegister_returns400BadRequest_forMissingPassword() throws Exception {
        RegisterRequest req = new RegisterRequest("No Pass", "valid@example.com", "");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void testRegister_returns405MethodNotAllowed_forGetRequest() throws Exception {
        mockMvc.perform(get("/api/auth/register"))
                .andExpect(status().isMethodNotAllowed());
    }
}
