package com.inventra.repository;
import com.inventra.entity.*;
import org.springframework.data.jpa.repository.*;
import java.util.List;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product, Long>{
    List<Product> findByProductName(String productName);
    List<Product> findByOrganizationId(Long organizationId);
    Optional<Product> findByProductIdAndOrganizationId(Long productId, Long organizationId);
}