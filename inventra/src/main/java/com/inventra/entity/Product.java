package com.inventra.entity;
import java.time.LocalDate;

import jakarta.persistence.*;
@Entity
@Table(name = "Products")
public class Product{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long productId;
   private String productName;
   private String brandName;
   private String category;
   private String supplierName;
   private int quantity;
   private float purchasePrice;
   private float sellingPrice;
   private LocalDate manufacturingDate;
    private LocalDate expiryDate;
   private String barCode;
   private String storageLocation;
   private Long organizationId;

    public Product(){}
    public void setProductId(Long id){
    this.productId = id;
 }
 public Long getProductId(){
    return productId;
 }
    public void setProductName(String productName){
        this.productName = productName;
    }
    public String getProductName(){
        return productName;
    }
     public void setBrandName(String brandName){
        this.brandName = brandName;
     }
     public String getBrandName(){
        return brandName;
     }
     public void setCategory(String category){
        this.category = category;
     }
     public String getCategory(){
        return category;
     }
     public void setSupplierName(String supplierName){
        this.supplierName = supplierName;
     }
     public String getSupplierName(){
        return supplierName;
     }
     public void setQuantity(int quant){
        this.quantity = quant;
     }
     public int getQuantity(){
        return quantity;
     }
     public void setPurchasePrice(float purchasePrice){
        this.purchasePrice = purchasePrice;
     }
     public float getPurchasePrice(){
        return purchasePrice;
     }
     public void setSellingPrice(float sellingPrice){
        this.sellingPrice = sellingPrice;
     }
     public float getSellingPrice(){
        return sellingPrice;
     }
     public void setBarcode(String barCode){
        this.barCode = barCode;
     }
     public String getBarcode(){
        return barCode;
     }
 public void setStorageLocation(String location){
    this.storageLocation = location;
 }
 public String getStorageLocation(){
    return storageLocation;
 }
 public void setManufacturingDate(LocalDate date){
    this.manufacturingDate = date;
 }
 public LocalDate getManufacturingDate(){
    return manufacturingDate;
 }
 public void setExpiryDate(LocalDate date){
    this.expiryDate = date;
 }
 public LocalDate getExpiryDate(){
    return expiryDate;
 }
public void setOrganizationId(Long organizationId){
    this.organizationId = organizationId;
}
public Long getOrganizationId(){
    return organizationId;
}
}
 
