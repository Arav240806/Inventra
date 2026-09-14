package com.inventra.service.impl;
import org.springframework.stereotype.Service;
import com.inventra.exception.*;
import com.inventra.entity.*;
import com.inventra.repository.*;
import com.inventra.service.*;
@Service
public class OrganizationServiceImpl implements OrganizationService {
    private OrganizationRepository organizationRepository;
    public OrganizationServiceImpl(OrganizationRepository organizationRepository){
        this.organizationRepository = organizationRepository;  
      }
      public Organization addOrganization(Organization organization){
        organizationRepository.save(organization);
        return organization;
      }
      public Organization searchById(Long id){
        return organizationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
      }
      public Organization updateOrganization(Organization organization){
        if(organizationRepository.existsById(organization.getOrganizationId())){
            organizationRepository.save(organization);
            return organization;
        }else{
            throw new ResourceNotFoundException("Organization not found");
        }
      }
}
