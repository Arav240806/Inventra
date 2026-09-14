package com.inventra.service.impl;
import com.inventra.entity.*;
import com.inventra.repository.*;
import com.inventra.service.*;
import com.inventra.exception.*;
import java.time.LocalDate;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class SaleServiceImpl implements SaleService {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public SaleServiceImpl(SaleRepository saleRepository, ProductRepository productRepository){
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    public Sale addSale(Sale sale){
        Product product = productRepository
            .findByProductIdAndOrganizationId(sale.getProductId(), sale.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getQuantity() < sale.getQuantitySold()){
            throw new RuntimeException("Not enough stock — only " + product.getQuantity() + " left");
        }

        product.setQuantity(product.getQuantity() - sale.getQuantitySold());
        productRepository.save(product);

        sale.setProductName(product.getProductName());
        sale.setSellingPrice(product.getSellingPrice());
        sale.setTotalAmount(product.getSellingPrice() * sale.getQuantitySold());
        if (sale.getSaleDate() == null){
            sale.setSaleDate(LocalDate.now());
        }

        return saleRepository.save(sale);
    }

    public Sale searchById(Long id, Long organizationId){
        return saleRepository.findBySaleIdAndOrganizationId(id, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
    }

    public String deleteSale(Long id, Long organizationId){
        Sale sale = saleRepository.findBySaleIdAndOrganizationId(id, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        saleRepository.delete(sale);
        return "Sale deleted successfully";
    }

    public List<Sale> showAllSales(Long organizationId){
        return saleRepository.findByOrganizationId(organizationId);
    }
}