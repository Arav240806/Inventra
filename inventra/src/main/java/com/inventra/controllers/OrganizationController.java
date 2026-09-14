package com.inventra.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inventra.entity.Organization;
import com.inventra.service.OrganizationService;

import jakarta.validation.Valid;



import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;




@RestController
@RequestMapping("/api/organization")
public class OrganizationController {
    private OrganizationService organizationService;
    
    public OrganizationController(OrganizationService organizationService){
        this.organizationService = organizationService;
    }

    @PostMapping("/add")
   public ResponseEntity<Organization> addOrganization(@Valid @RequestBody Organization organization){
     Organization savedOrganization = organizationService.addOrganization(organization);

     return ResponseEntity.ok(savedOrganization);

   }

   @GetMapping("/search/{id}")
   public ResponseEntity<Organization> searchById( @PathVariable Long id ){
     Organization searchOrganization = organizationService.searchById(id);

     return ResponseEntity.ok(searchOrganization);
   }

   @PutMapping("/update")
   public ResponseEntity<Organization> updateOrganization( @RequestBody Organization organization){
     Organization modifyOrganization = organizationService.updateOrganization(organization);

     return ResponseEntity.ok(modifyOrganization);
   }
   
    
}
