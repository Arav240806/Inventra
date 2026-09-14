package com.inventra.service.impl;

import com.inventra.dto.JoinOrgDto;
import com.inventra.dto.RegisterDto;
import com.inventra.entity.Account;
import com.inventra.entity.Employee;
import com.inventra.entity.Organization;
import com.inventra.exception.ResourceNotFoundException;
import com.inventra.repository.AccountRepository;
import com.inventra.repository.EmployeeRepository;
import com.inventra.repository.OrganizationRepository;
import com.inventra.service.AccountService;

import org.springframework.stereotype.Service;

@Service
public class AccountServiceImpl implements AccountService {

    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final AccountRepository accountRepository;

    public AccountServiceImpl(AccountRepository accountRepository, OrganizationRepository organizationRepository, EmployeeRepository employeeRepository) {
        this.accountRepository = accountRepository;
        this.organizationRepository = organizationRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public Account login(
            String username,
            String password,
            Long organizationId,
            Long employeeId,
            String role) {

        Account account = accountRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

        if (!account.getPassword().equals(password)) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!account.getOrganizationId().equals(organizationId)) {
            throw new RuntimeException("Invalid organization ID");
        }

        if (!account.getEmployeeId().equals(employeeId)) {
            throw new RuntimeException("Invalid employee ID");
        }

        if (!account.getRole().equalsIgnoreCase(role)) {
            throw new RuntimeException("Invalid role");
        }

        return account;
    }

    @Override
 public Account register(RegisterDto registerDto){
    Organization organization = new Organization();

    organization.setOrganizationName(registerDto.getOrganizationName());

    organization.setOrganizationType(registerDto.getOrganizationType());

    organization.setEmail(registerDto.getEmail());

    organization.setContactNumber(registerDto.getContactNumber());

    organizationRepository.save(organization);

    Employee employee = new Employee();

    employee.setFirstName(registerDto.getFirstName());
    employee.setLastName(registerDto.getLastName());
    employee.setEmail(registerDto.getEmail());
    employee.setContactNumber(registerDto.getContactNumber());
    employee.setUserName(registerDto.getUsername());
    employee.setRole(registerDto.getRole());

    employee.setStatus("Active");

    employee.setOrganizationId(organization.getOrganizationId());
    employeeRepository.save(employee);

    Account account = new Account();

    account.setUserName(registerDto.getUsername());
    account.setPassword(registerDto.getPassword());

    account.setRole(registerDto.getRole());
    account.setEmployeeId(employee.getId());

    account.setOrganizationId(organization.getOrganizationId());

    return accountRepository.save(account);
 }

    @Override
    public Account changePassword(Long accountId, String newPassword) {

        Account account = accountRepository
                .findById(accountId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

        account.setPassword(newPassword);

        accountRepository.save(account);

        return account;
    }
    @Override
public Account joinOrganization(JoinOrgDto joinOrgDto){

    Organization organization = organizationRepository
            .findById(joinOrgDto.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

    Employee employee = new Employee();
    employee.setFirstName(joinOrgDto.getFirstName());
    employee.setLastName(joinOrgDto.getLastName());
    employee.setEmail(joinOrgDto.getEmail());
    employee.setUserName(joinOrgDto.getUsername());
    employee.setRole(joinOrgDto.getRole());
    employee.setStatus("Active");
    employee.setOrganizationId(organization.getOrganizationId());
    employeeRepository.save(employee);

    Account account = new Account();
    account.setUserName(joinOrgDto.getUsername());
    account.setPassword(joinOrgDto.getPassword());
    account.setRole(joinOrgDto.getRole());
    account.setEmployeeId(employee.getId());
    account.setOrganizationId(organization.getOrganizationId());

    return accountRepository.save(account);
}
}