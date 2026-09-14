package com.inventra.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "Suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long supplierId;
    private String supplierName;
    private String email;
    private String contactNumber;
    private String address;
    private String gstNumber;
    private String companyName;
    private String city;
     private Long organizationId;
    public Supplier(){}
    public void setSupplierId(Long id){
        this.supplierId = id;
    }
    public Long getSupplierId(){
        return supplierId;
    }
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
    public void setContactNumber(String contactNumber){
        this.contactNumber = contactNumber;
    }
    public String getContactNumber(){
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
public void setOrganizationId(Long organizationId){
    this.organizationId = organizationId;
}
public Long getOrganizationId(){
    return organizationId;
}
}
