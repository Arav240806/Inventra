package com.inventra.controllers;

import com.inventra.entity.Product;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import com.inventra.service.ProductService;
import java.util.*;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;




@RestController
@RequestMapping("/api/products")
public class ProductController{
    private ProductService productService;

    public ProductController(ProductService productService){
        this.productService = productService;
    }
    @PostMapping("/add")
   public ResponseEntity<Product> addProduct(@RequestBody Product product){
    Product addProduct =  productService.addProduct(product);
    return ResponseEntity.ok(addProduct);
   }
    
   @GetMapping("/{id}")
  public ResponseEntity<Product> searchById(@PathVariable Long id, @RequestParam Long organizationId){
     Product searchProduct = productService.searchById(id, organizationId);
     return ResponseEntity.ok(searchProduct);

  }

 @PutMapping("/update")
 public ResponseEntity<Product> updateProduct(@Valid @RequestBody Product product){
    Product updateProduct = productService.updateProduct(product);

    return ResponseEntity.ok(updateProduct);
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<String> deleteProduct(@PathVariable Long id, @RequestParam Long organizationId){
    String deleteMessage = productService.deleteProduct(id, organizationId);

    return ResponseEntity.ok(deleteMessage);
 }

 @GetMapping("/all")
 public ResponseEntity<List<Product>> showAllProduct(@RequestParam Long organizationId){
    List<Product> products = productService.showAllProduct(organizationId);

    return ResponseEntity.ok(products);
 }
 
}