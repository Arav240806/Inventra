package com.inventra.repository;
import com.inventra.entity.*;
import org.springframework.data.jpa.repository.*;
import java.util.List;
import java.util.Optional;
public interface SupplierRepository extends JpaRepository<Supplier, Long>{
    List<Supplier> findBySupplierName(String supplierName);
    List<Supplier> findByOrganizationId(Long organizationId);
    Optional<Supplier> findBySupplierIdAndOrganizationId(Long supplierId, Long organizationId);
}