# Authentication API Documentation

## Overview
This document describes the authentication endpoints for login and customer registration.

## Endpoints

### 1. Register (Customer)
**Endpoint:** `POST /api/auth/register`

**Description:** Register a new customer account

**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "0123456789",
  "password": "password123",
  "email": "john@example.com",
  "address": "123, ABC Street, A Ward, B Province"
}
```

**Validation Rules:**
- `fullName`: Required
- `username`: Required, must be a valid Vietnamese phone number
- `password`: Required, minimum 6 characters
- `email`: Optional
- `address`: Required

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": null,
  "errorCode": null,
  "timestamp": "2026-01-09T10:30:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Username already exists",
  "data": null,
  "errorCode": "INVALID_ARGUMENT",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Description:** Login with username and password to get JWT token

**Request Body:**
```json
{
  "username": "0123456789",
  "password": "password123"
}
```

**Validation Rules:**
- `username`: Required
- `password`: Required, minimum 6 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "errorCode": null,
  "timestamp": "2026-01-09T10:30:00"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null,
  "errorCode": "BAD_CREDENTIALS",
  "timestamp": "2026-01-09T10:30:00"
}
```

---

## Authentication
After successful login, include the JWT token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your-jwt-token>
```

## Security Features
- Passwords are encrypted using BCrypt
- JWT tokens expire after 24 hours (configurable)
- Stateless session management
- Role-based access control (RBAC)
- Validation on all inputs

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "username": "0987654321",
    "password": "password123",
    "email": "john@example.com",
    "address": "123 Main Street"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "0987654321",
    "password": "password123"
  }'
```

### Access Protected Endpoint (example)
```bash
curl -X GET http://localhost:8080/api/protected-resource \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Swagger UI
Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui/index.html
```
