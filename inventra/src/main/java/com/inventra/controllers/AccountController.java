package com.inventra.controllers;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inventra.dto.JoinOrgDto;
import com.inventra.dto.LoginDto;
import com.inventra.dto.RegisterDto;
import com.inventra.entity.Account;
import com.inventra.service.AccountService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/accounts")
public class AccountController{
   private final AccountService accountService;

   public AccountController(AccountService accountService){
    this.accountService = accountService;
   }
   @PostMapping("/login")
   public ResponseEntity<Account> login(@Valid @RequestBody LoginDto loginDto) {
        Account account = accountService.login(
            loginDto.getUsername(),
            loginDto.getPassword(),
            loginDto.getOrganizationId(),
        loginDto.getEmployeeId(),
loginDto.getRole()
);
        return ResponseEntity.ok(account);      
   }
   
   @PostMapping("/register")
   public ResponseEntity<Account> register(@Valid @RequestBody RegisterDto registerDto) {
       Account account = accountService.register(registerDto);
       return ResponseEntity.ok(account);
   }
   
   @PutMapping("/{accountId}/password")
   public ResponseEntity<Account> changePassword(@PathVariable Long accountId, @RequestBody String newPassword) {
       Account account = accountService.changePassword(accountId, newPassword);

       return ResponseEntity.ok(account);
   }

   @PostMapping("/join")
public ResponseEntity<Account> joinOrganization(@Valid @RequestBody JoinOrgDto joinOrgDto) {
    Account account = accountService.joinOrganization(joinOrgDto);
    return ResponseEntity.ok(account);
}
}