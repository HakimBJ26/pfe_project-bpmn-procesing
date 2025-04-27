package com.example.workflow.exception;

public class DuplicateFormException extends RuntimeException {
    public DuplicateFormException(String message) {
        super(message);
    }
}