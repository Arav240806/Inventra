package com.inventra.repository;
import com.inventra.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long>{
    List<Sale> findByOrganizationId(Long organizationId);
    Optional<Sale> findBySaleIdAndOrganizationId(Long saleId, Long organizationId);
}