package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.response.user.UserResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.service.IUserService;
import org.f3.postalmanagement.utils.SecurityUtils;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {


    @Override
    public UserResponse fetchMe() {

        Account account = SecurityUtils.getCurrentAccount();



//        return UserResponse.builder()
//                .id(account.getId())
//                .username(account.getUsername())
//                .phoneNumber(account.getUsername())
//                .email(account.getEmail())
//                .role(account.getRole().toString())
//                .isActive(account.isActive())
//                .fullName(ac)
//                .build();
        return null;
    }
}
