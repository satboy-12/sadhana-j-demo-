package com.herhealthjourney.service;

import com.herhealthjourney.dto.AuthResponse;
import com.herhealthjourney.dto.LoginRequest;
import com.herhealthjourney.dto.RegisterRequest;
import com.herhealthjourney.dto.UserProfileDto;
import com.herhealthjourney.entity.User;
import com.herhealthjourney.exception.BadRequestException;
import com.herhealthjourney.repository.UserRepository;
import com.herhealthjourney.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String effectiveEmail = request.email() != null ? request.email().trim().toLowerCase() : null;
        if (effectiveEmail == null || effectiveEmail.isEmpty()) {
            throw new BadRequestException("Email is required.");
        }
        if (userRepository.existsByEmail(effectiveEmail)) {
            throw new com.herhealthjourney.exception.ConflictException("Email is already registered. Please log in.");
        }

        String username = request.effectiveUsername();
        if (userRepository.existsByUsername(username)) {
            if (request.username() != null && !request.username().trim().isEmpty()) {
                throw new com.herhealthjourney.exception.ConflictException("Username is already taken.");
            }
            // Auto-resolve derived username collisions with unique suffix
            username = username + "_" + (System.currentTimeMillis() % 10000);
        }

        String firstName = request.effectiveFirstName();
        String lastName = request.effectiveLastName();

        User user = new User(
            username,
            effectiveEmail,
            passwordEncoder.encode(request.password()),
            firstName,
            lastName,
            request.dateOfBirth()
        );

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getUsername());

        return new AuthResponse(
            token,
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getFirstName(),
            savedUser.getLastName()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.usernameOrEmail(), request.password())
        );

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .or(() -> userRepository.findByEmail(username))
            .orElseThrow(() -> new BadRequestException("User not found."));

        String token = tokenProvider.generateToken(user.getUsername());

        return new AuthResponse(
            token,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(User user) {
        return new UserProfileDto(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getDateOfBirth()
        );
    }
}

