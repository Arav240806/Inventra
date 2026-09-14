package com.inventra.dto;
import jakarta.validation.constraints.*;
public class SupplierDto {
    @NotBlank(message = "Supplier Name is required")
    private String supplierName;

    @NotBlank(message = "Company Name is required")
    private String companyName;

    @NotBlank(message = "Contact Number is required") @Pattern(regexp = "\\d{10}",message = "Contact Number should be 10 digits")
    private String contactNumber;

    @NotBlank(message = "Email is required") @Email(message = "Invalid Email format")
    private String email;

    @NotBlank(message = "GST Number is required") 
    private String gstNumber;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Address is required")
    private String address;

    public SupplierDto(){}
    public void setSupplierName(String name){
        this.supplierName = name;
    }
    public String getSupplierName(){
        return supplierName;
    }
    public void setEmail(String email){
        this.email = email;
    }
    public String getEmail(){
        return email;
    }
    public void setContact(String contactNumber){
        this.contactNumber = contactNumber;
    }
    public String getContact(){
        return contactNumber;
    }
    public void setAddress(String address){
        this.address = address;
    }
    public String getAddress(){
        return address;
    }
    public void setGstNumber(String gstNumber){
        this.gstNumber = gstNumber;
    }
    public String getGstNumber(){
        return gstNumber;
    }
    public void setCompanyName(String companyName){
        this.companyName = companyName;
    }
    public String getCompanyName(){
        return companyName;
    }
    public void setCity(String city){
        this.city = city;
    }
    public String getCity(){
        return city;
    }
}
