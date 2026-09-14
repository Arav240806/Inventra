package com.inventra.service.impl;
import com.inventra.entity.*;
import com.inventra.repository.*;
import com.inventra.service.*;
import java.util.*;
import com.inventra.exception.*;
import org.springframework.stereotype.Service;
@Service
public class SupplierServiceImpl implements SupplierService{
 private SupplierRepository supplierRepository;
 public SupplierServiceImpl(SupplierRepository supplierRepository){
    this.supplierRepository = supplierRepository;
 }
 public Supplier addSupplier(Supplier supplier){
    supplierRepository.save(supplier);
    return supplier;
 }
 public Supplier searchById(Long id, Long organizationId){
    return supplierRepository.findBySupplierIdAndOrganizationId(id, organizationId)
        .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
 }
 public Supplier updateSupplier(Supplier supplier){
    supplierRepository.findBySupplierIdAndOrganizationId(supplier.getSupplierId(), supplier.getOrganizationId())
        .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
    supplierRepository.save(supplier);
    return supplier;
 }
 public String deleteSupplier(Long id, Long organizationId){
    Supplier supplier = supplierRepository.findBySupplierIdAndOrganizationId(id, organizationId)
        .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
    supplierRepository.delete(supplier);
    return "Supplier deleted successfully";
 }
 public List<Supplier> showAllSupplier(Long organizationId){
    return supplierRepository.findByOrganizationId(organizationId);
 }
}