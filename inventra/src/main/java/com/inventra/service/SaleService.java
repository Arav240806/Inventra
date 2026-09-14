package com.inventra.service;
import com.inventra.entity.Sale;
import java.util.List;

public interface SaleService {
    Sale addSale(Sale sale);
    Sale searchById(Long id, Long organizationId);
    String deleteSale(Long id, Long organizationId);
    List<Sale> showAllSales(Long organizationId);
}