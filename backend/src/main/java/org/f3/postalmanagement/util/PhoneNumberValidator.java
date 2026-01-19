package org.f3.postalmanagement.util;

/**
 * Phone Number Utility & Validator
 * Implements FINDING-2026-01-19-002 padding strategy
 * All phone numbers must be exactly 10 digits (09XXXXXXX format)
 */
public class PhoneNumberValidator {

    /**
     * Pads phone number to exactly 10 digits (09XXXXXXX format)
     * @param phoneNumber raw phone number string
     * @return 10-digit phone number with trailing zeros if needed
     * @throws IllegalArgumentException if cannot be padded to 10 digits
     */
    public static String padToTenDigits(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            throw new IllegalArgumentException("Phone number cannot be null or blank");
        }

        String cleaned = phoneNumber.trim();

        // Already 10 digits - valid
        if (cleaned.length() == 10) {
            return cleaned;
        }

        // Less than 10 digits - right pad with zeros
        if (cleaned.length() < 10) {
            return (cleaned + "0000000000").substring(0, 10);
        }

        // More than 10 digits - data integrity issue
        if (cleaned.length() > 10) {
            throw new IllegalArgumentException(
                "Phone number '" + cleaned + "' is " + cleaned.length() +
                " digits. Cannot exceed 10 digits. Data corruption suspected."
            );
        }

        return cleaned;
    }

    /**
     * Validates phone number is 10 digits starting with 09
     */
    public static boolean isValidPhoneNumber(String phoneNumber) {
        return phoneNumber != null &&
               phoneNumber.length() == 10 &&
               phoneNumber.startsWith("09") &&
               phoneNumber.matches("\\d{10}");
    }
}
