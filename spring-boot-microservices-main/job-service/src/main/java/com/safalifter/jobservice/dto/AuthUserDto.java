package com.safalifter.jobservice.dto;

import lombok.Data;

@Data
public class AuthUserDto {
    private String id;
    private String username;
    private String password;
    private String role; // Adaptez au type réel si nécessaire
}
