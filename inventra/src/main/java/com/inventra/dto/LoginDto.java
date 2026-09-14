package com.inventra.dto;
import jakarta.validation.constraints.*;
public class LoginDto {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is must")
    private String password;

    @NotNull(message = "Enter Employee ID")
    private Long employeeId;

    @NotNull(message = "Enter Organization")
    private Long organizationId;

    @NotBlank(message = "Enter Role")
    private String role;

    public LoginDto(){}

    public void setUsername(String username){
        this.username = username;
    }
    public String getUsername(){
        return username;
    }
    public void setPassword(String password){
        this.password = password;
    }
    public String getPassword(){
        return password;
    }
    public void setEmployeeId(Long employeeId){
        this.employeeId = employeeId;
    }
    public Long getEmployeeId(){
        return employeeId;
    }
    public void setOrganizationId(Long organizationId){
        this.organizationId = organizationId;
    }
    public Long getOrganizationId(){
        return organizationId;
    }
    public void setRole(String role){
        this.role = role;
    }
    public String getRole(){
        return role;
    }
}
