package com.inventra.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Employees")
public class Employee {
    @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String contactNumber;
    private String userName;
    private String password;
    private String role;
    private String status;
    private Long organizationId;
    private String department;
    private String joiningDate;
    public Employee(){}

   public void setId(Long eId){
    this.id = eId;
   }
   public Long getId(){
    return id;
   }
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
    public void setEmail(String Email){
        this.email = Email;
    }
    public String getEmail(){
        return email;
    }
    public void setContactNumber(String contactNo){
        this.contactNumber = contactNo;
    }
    public String getContactNumber(){
        return contactNumber;
    }
    public void setUserName(String uName){
        this.userName = uName;
    }
    public String getUserName(){
        return userName;
    }
    public void setPassword(String pw){
        this.password = pw;
    }
    public String getPassword(){
        return password;
    }
    public void setRole(String roles){
        this.role = roles;
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
    public void setOrganizationId(Long oId){
       this.organizationId = oId;
    }
    public Long getOrganizationId(){
        return organizationId;
    }
    public void setDepartment(String dept){
        this.department = dept;
    }
    public String getDepartment(){
        return department;
    }
    public void setJoiningDate(String jDate){
        this.joiningDate = jDate;
    }
    public String getJoiningDate(){
        return joiningDate;
    }
}
