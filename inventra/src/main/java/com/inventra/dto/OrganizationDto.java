package com.inventra.dto;
import jakarta.validation.constraints.*;
public class OrganizationDto {
    @NotBlank(message = "Organization Name should not be blank")
    private String organizationName;

    @NotBlank(message = "Type must be specified")
    private String organizationType;

    @NotBlank(message = "Email must be specified") @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Contact Number is required") @Pattern(regexp = "\\d{10}", message = "Contact Number must be 10 digits")
    private String contactNumber;

    
    
    public OrganizationDto(){}

    public void setOrganizationName(String organizationName){
        this.organizationName = organizationName;
    }
    public String getOrganizationName(){
        return organizationName;
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
    public void setOrganizationType(String organizationType){
        this.organizationType = organizationType;
    }
    public String getOrganizationType(){
        return organizationType;
    }
}
