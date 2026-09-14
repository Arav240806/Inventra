package com.inventra.service;
import java.util.List;
import com.inventra.entity.Product;

public interface ProductService{
    public Product addProduct(Product product);
    public Product searchById(Long id, Long organizationId);
    public String deleteProduct(Long id, Long organizationId);
    public List<Product> showAllProduct(Long organizationId);
    public Product updateProduct(Product product);
}