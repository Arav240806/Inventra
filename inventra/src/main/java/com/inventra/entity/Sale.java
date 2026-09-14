package com.inventra.entity;

import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "Sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long saleId;

    private Long organizationId;
    private Long productId;
    private String productName;
    private int quantitySold;
    private float sellingPrice;
    private float totalAmount;
    private LocalDate saleDate;
    private Long employeeId;

    public Sale(){}

    public void setSaleId(Long saleId){ this.saleId = saleId; }
    public Long getSaleId(){ return saleId; }

    public void setOrganizationId(Long organizationId){ this.organizationId = organizationId; }
    public Long getOrganizationId(){ return organizationId; }

    public void setProductId(Long productId){ this.productId = productId; }
    public Long getProductId(){ return productId; }

    public void setProductName(String productName){ this.productName = productName; }
    public String getProductName(){ return productName; }

    public void setQuantitySold(int quantitySold){ this.quantitySold = quantitySold; }
    public int getQuantitySold(){ return quantitySold; }

    public void setSellingPrice(float sellingPrice){ this.sellingPrice = sellingPrice; }
    public float getSellingPrice(){ return sellingPrice; }

    public void setTotalAmount(float totalAmount){ this.totalAmount = totalAmount; }
    public float getTotalAmount(){ return totalAmount; }

    public void setSaleDate(LocalDate saleDate){ this.saleDate = saleDate; }
    public LocalDate getSaleDate(){ return saleDate; }

    public void setEmployeeId(Long employeeId){ this.employeeId = employeeId; }
    public Long getEmployeeId(){ return employeeId; }
}