package com.inventra.dto;
import jakarta.validation.constraints.*;

public class EmployeeDto {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required") @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "contact number is required") @Pattern(regexp = "\\d{10}", message = "contact number must be 10 digits")
    private String contactNumber;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    public EmployeeDto(){}
    public void setFirstName(String firstName){
        this.firstName = firstName;
    }
    public String getFirstName(){
        return firstName;
    }
    public void setLastName(String lastName){
        this.lastName = lastName;
    }
    public String getLastName(){
        return lastName;
    }
    public void setEmail(String email){
        this.email = email;
    }
    public String getEmail(){
        return email;
    }
    public void setUserName(String userName){
        this.userName = userName;
    }
    public String getUserName(){
        return userName;
    }
    public void setPassword(String password){
        this.password = password;
    }
    public String getPassword(){
        return password;
    }
    public void setRole(String role){
        this.role = role;
    }
    public String getRole(){
        return role;
    }
    public void setStatus(String status){
      this.status = status;
    }
    public String getStatus(){
        return status;
    }
    public void setOrganizationId(Long organizationId){
        this.organizationId = organizationId;
    }
    public Long getOrganizationId(){
        return organizationId;
    }
    public void setContactNumber(String contactNumber){
        this.contactNumber = contactNumber;
    }
    public String getContactNumber(){
        return contactNumber;
    }
}
