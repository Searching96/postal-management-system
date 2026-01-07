package org.f3.postalmanagement.exception;

import org.f3.postalmanagement.entity.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccountNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleUserNotFoundException(AccountNotFoundException ex) {
        ApiResponse<?> response = new ApiResponse<>(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                null,
                "ACCOUNT_NOT_FOUND"
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception ex) {
        ApiResponse<?> apiResponse = new ApiResponse<>(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred: " + ex.getMessage(),
                null,
                "INTERNAL_SERVER_ERROR"
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(apiResponse);
    }

}
