package com.inventra.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "Organizations")


public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long organizationId;
    private String organizationName;
    private String organizationType;
    private String email;
    private String contactNumber;
     public Organization(){}

    public void setOrganizationId(Long organizationId){
        this.organizationId = organizationId;
    }
    public Long getOrganizationId(){
        return organizationId;
    }
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
