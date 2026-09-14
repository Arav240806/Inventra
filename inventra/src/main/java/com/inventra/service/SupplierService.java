package com.inventra.service;
import com.inventra.entity.Supplier;
import java.util.*;
public interface SupplierService {
    public Supplier addSupplier(Supplier supplier);
    public Supplier searchById(Long id, Long organizationId);
    public Supplier updateSupplier(Supplier supplier);
    public String deleteSupplier(Long id, Long organizationId);
    public List<Supplier> showAllSupplier(Long organizationId);
}