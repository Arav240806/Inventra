package com.inventra.service;
import com.inventra.entity.Organization;
public interface OrganizationService {
    public Organization addOrganization(Organization organization);
    public Organization searchById(Long id);
    public Organization updateOrganization(Organization organization);
}
