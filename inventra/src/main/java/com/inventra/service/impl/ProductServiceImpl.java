package com.inventra.service.impl;
import com.inventra.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import com.inventra.entity.*;
import com.inventra.service.*;
import com.inventra.exception.*;
@Service
public class ProductServiceImpl implements ProductService{
private final ProductRepository productRepository;
    ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
public Product addProduct(Product product){
     productRepository.save(product);
     return product;
}
public Product searchById(Long id, Long organizationId){
    return productRepository.findByProductIdAndOrganizationId(id, organizationId)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
}
public String deleteProduct(Long id, Long organizationId){
    Product product = productRepository.findByProductIdAndOrganizationId(id, organizationId)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    productRepository.delete(product);
    return "Product deleted successfully";
}
public List<Product> showAllProduct(Long organizationId){
    return productRepository.findByOrganizationId(organizationId);
}
public Product updateProduct(Product product){
   productRepository.findByProductIdAndOrganizationId(product.getProductId(), product.getOrganizationId())
        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
   productRepository.save(product);
   return product;
}
public List<Product> findByProductName(String productName){
    return productRepository.findByProductName(productName);
}
}
