package com.inventra.controllers;
import com.inventra.entity.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.inventra.service.SupplierService;

import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;




 @RestController
 @RequestMapping("api/Suppliers")
public class SupplierController {
    private SupplierService supplierService;

    public SupplierController(SupplierService supplierService){
        this.supplierService = supplierService;
    }

@PostMapping("/add")
public ResponseEntity<Supplier> addSupplier( @Valid @RequestBody Supplier supplier){
    Supplier savedSupplier = supplierService.addSupplier(supplier);

    return ResponseEntity.ok(savedSupplier);
}

@GetMapping("/{id}")
public ResponseEntity<Supplier> searchById(@PathVariable Long id, @RequestParam Long organizationId){

    Supplier findSupplier = supplierService.searchById(id, organizationId);

    return ResponseEntity.ok(findSupplier);
}

@PutMapping("/update")
public ResponseEntity<Supplier> updateSupplier(@RequestBody Supplier supplier){
    Supplier updatSupplier = supplierService.updateSupplier(supplier);

    return ResponseEntity.ok(updatSupplier);
}

@DeleteMapping("/{id}")
public ResponseEntity<String> deleteSupplier(@PathVariable Long id, @RequestParam Long organizationId){
    
    String delMessage = supplierService.deleteSupplier(id, organizationId);

    return ResponseEntity.ok(delMessage);
}

@GetMapping("/all")
public ResponseEntity<List<Supplier>>showAllSupplier(@RequestParam Long organizationId){
List<Supplier> suppliers = supplierService.showAllSupplier(organizationId);

return ResponseEntity.ok(suppliers);
}

}
