package com.safalifter.authservice.service;

import com.safalifter.authservice.dto.UserDto;
import com.safalifter.authservice.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ActiveProfiles("test")
class JwtServiceTest {

    @Mock
    private CustomUserDetailsService customUserDetailsService;

    @InjectMocks
    private JwtService jwtService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void generateToken_shouldReturnValidToken() {
        // Arrange
        String username = "testuser";
        
        // Créer un UserDto pour le test
        UserDto userDto = new UserDto();
        userDto.setId("1");
        userDto.setUsername(username);
        userDto.setPassword("password");
        userDto.setRole(Role.USER);
        
        // Créer un CustomUserDetails avec le UserDto
        CustomUserDetails userDetails = new CustomUserDetails(userDto);
        
        // Configurer le mock
        when(customUserDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);

        // Act
        String token = jwtService.generateToken(username);

        // Assert
        assertNotNull(token);
        // Vous pourriez ajouter plus d'assertions ici pour vérifier le contenu du token
    }
}
