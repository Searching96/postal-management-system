package org.f3.postalmanagement.utils;

import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public abstract class SecurityUtils {

    private SecurityUtils() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    public static UUID getCurrentAccountId() {
        return getCurrentAccount().getId();
    }

    public static Account getCurrentAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        return customUserDetails.getAccount();
    }
}
