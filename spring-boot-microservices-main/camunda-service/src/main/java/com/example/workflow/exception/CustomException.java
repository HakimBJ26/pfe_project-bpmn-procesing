
package com.example.workflow.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomException extends RuntimeException {
    private int status;
    private String error;
    private String message;

    public CustomException(String message, int status, String error) {
        super(message);
        this.status = status;
        this.error = error;
        this.message = message;
    }
}   