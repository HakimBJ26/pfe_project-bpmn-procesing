package com.safalifter.userservice.service;

import com.safalifter.userservice.client.FileStorageClient;
import com.safalifter.userservice.enums.Active;
import com.safalifter.userservice.enums.Role;
import com.safalifter.userservice.model.User;
import com.safalifter.userservice.repository.UserRepository;
import com.safalifter.userservice.request.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ActiveProfiles("test")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private FileStorageClient fileStorageClient;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void saveUser_shouldReturnSavedUser() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("password");
        request.setEmail("test@example.com");

        User mockUser = User.builder()
                .username(request.getUsername())
                .password("encodedPassword")
                .email(request.getEmail())
                .role(Role.USER)
                .active(Active.ACTIVE)
                .build();

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        User result = userService.saveUser(request);

        // Assert
        assertNotNull(result);
        assertEquals(request.getUsername(), result.getUsername());
        assertEquals(request.getEmail(), result.getEmail());
        assertEquals(Role.USER, result.getRole());
        assertEquals(Active.ACTIVE, result.getActive());
    }

    @Test
    void getUserByUsername_shouldReturnUser() {
        // Arrange
        String username = "testuser";
        User mockUser = User.builder()
                .username(username)
                .password("encodedPassword")
                .email("test@example.com")
                .role(Role.USER)
                .active(Active.ACTIVE)
                .build();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));

        // Act
        User result = userService.getUserByUsername(username);

        // Assert
        assertNotNull(result);
        assertEquals(username, result.getUsername());
    }
}
