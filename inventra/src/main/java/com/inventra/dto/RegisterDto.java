package com.inventra.dto;
import jakarta.validation.constraints.*;
public class RegisterDto {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Organization Name is required")
    private String organizationName;

    @NotBlank(message = "Organization Type is required")
    private String organizationType;

    @NotBlank(message = "Email is required") @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Contact number is required") @Pattern(regexp =  "\\d{10}", message = "Contact number must be 10 digits" )
    private String contactNumber;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    public RegisterDto(){}
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
    public void setOrganizationName(String organizationName){
        this.organizationName = organizationName;
    }
    public String getOrganizationName(){
        return organizationName;
    }
    public void setOrganizationType(String organizationType){
        this.organizationType = organizationType;
    }
    public String getOrganizationType(){
        return organizationType;
    }
    public void setEmail(String email){
        this.email = email;
    }
    public String getEmail(){
        return email;
    }
    public void setContactNumber(String contactNumber){
        this.contactNumber = contactNumber;
    }
    public String getContactNumber(){
        return contactNumber;
    }
    public void setRole(String role){
        this.role = role;
    }
    public String getRole(){
        return role;
    }
    public void setUsername(String username){
        this.username = username;
    }
    public String getUsername(){
        return username;
    }
    public void setPassword(String passsword){
        this.password = passsword;
    }
    public String getPassword(){
        return password;
    }

}
