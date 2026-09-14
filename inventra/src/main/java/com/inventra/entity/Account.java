package com.inventra.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "Accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;
    private String username;
    private String password;
    private String role;
    private Long employeeId;
    private Long organizationId;
    public Account(){}
        public void setId(Long accountId){
            this.accountId = accountId;
        }
        public Long getId(){
            return accountId;
        }
        public void setUserName(String username){
            this.username = username;
        }
        public String getUserName(){
            return username;
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
    
}
