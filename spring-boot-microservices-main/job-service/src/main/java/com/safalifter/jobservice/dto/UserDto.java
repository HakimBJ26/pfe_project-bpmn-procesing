package com.safalifter.jobservice.dto;

import lombok.Data;
import org.springframework.security.core.userdetails.UserDetails;

@Data
public class UserDto {
    private String id;
    private String username;
    private String email;
    private UserDetails userDetails;
}