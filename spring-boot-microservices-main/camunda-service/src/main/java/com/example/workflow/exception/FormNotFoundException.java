package com.example.workflow.exception;

public class FormNotFoundException extends RuntimeException {
    public FormNotFoundException(String message) {
        super(message);
    }
}