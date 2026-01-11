package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.service.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User management API")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final IUserService userService;

    @GetMapping("/me")
    @Operation(
            summary = "Get current user info", 
            description = "Get information of the currently logged-in user. Returns CustomerMeResponse for customers and EmployeeMeResponse for employees."
    )
    public ResponseEntity<ApiResponse<Object>> fetchMe() {
        Object response = userService.fetchMe();
        
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("User info fetched successfully")
                        .data(response)
                        .build()
        );
    }
}
