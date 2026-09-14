package com.inventra.dto;
import java.time.*;
import jakarta.validation.constraints.*;
public class ProductDto{

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "Brand name is required")
    private String brandName;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "supplier name is required")
    private String supplierName;
    
    @NotNull(message = "Quantity is required") @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Purchase price is required") @DecimalMin(value = "0.0", message = "Purchase price cannot be negative")
    private Float purchasePrice;

    @NotNull(message = "Selling price is required") @DecimalMin(value = "0.0", message = "Selling price cannot be negative")
    private Float sellingPrice;

   @NotNull(message = "Manufacturing date is required")
    private LocalDate manufacturingDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    @NotBlank(message = "Bar code is required")
    private String barCode;

    @NotBlank(message = "Storage location is required")
    private String storageLocation;
    public ProductDto(){}
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
     public void setQuantity(Integer quantity){
        this.quantity = quantity;
     }
     public Integer getQuantity(){
        return quantity;
     }
     public void setPurchasePrice(Float purchasePrice){
        this.purchasePrice = purchasePrice;
     }
     public Float getPurchasePrice(){
        return purchasePrice;
     }
     public void setSellingPrice(Float sellingPrice){
        this.sellingPrice = sellingPrice;
     }
     public Float getSellingPrice(){
        return sellingPrice;
     }
     public void setManufacturingDate(LocalDate manufacturingDate){
        this.manufacturingDate = manufacturingDate;
     }
     public LocalDate getManufacturingDate(){
        return manufacturingDate;
     }
     public void setExpiryDate(LocalDate expiryDate){
        this.expiryDate = expiryDate;
     }
     public LocalDate getExpiryDate(){
        return expiryDate;
     }
     public void setBarCode(String barCode){
        this.barCode = barCode;
     }
     public String getBarCode(){
        return barCode;
     }
     public void setStorageLocation(String storageLocation){
        this.storageLocation = storageLocation;
     }
     public String getStorageLocation(){
        return storageLocation;
     }
}