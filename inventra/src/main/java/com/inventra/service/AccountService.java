package com.inventra.service;

import com.inventra.dto.RegisterDto;
import com.inventra.dto.JoinOrgDto;
import com.inventra.entity.Account;

public interface AccountService {

    Account login(
        String username,
        String password,
        Long organizationId,
        Long employeeId,
        String role
    );

    Account register(RegisterDto registerDto);

    Account joinOrganization(JoinOrgDto joinOrgDto);

    Account changePassword(Long accountId, String newPassword);
}