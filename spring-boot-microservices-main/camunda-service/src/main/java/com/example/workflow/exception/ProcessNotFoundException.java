package com.example.workflow.exception;

public class ProcessNotFoundException extends RuntimeException {
    public ProcessNotFoundException(String message) {
        super(message);
    }
}