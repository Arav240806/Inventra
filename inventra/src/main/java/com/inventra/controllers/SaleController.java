package com.inventra.controllers;
import com.inventra.entity.Sale;
import com.inventra.service.SaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {
    private final SaleService saleService;
    public SaleController(SaleService saleService){ this.saleService = saleService; }

    @PostMapping("/add")
    public ResponseEntity<Sale> addSale(@RequestBody Sale sale){
        return ResponseEntity.ok(saleService.addSale(sale));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Sale>> showAllSales(@RequestParam Long organizationId){
        return ResponseEntity.ok(saleService.showAllSales(organizationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> searchById(@PathVariable Long id, @RequestParam Long organizationId){
        return ResponseEntity.ok(saleService.searchById(id, organizationId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSale(@PathVariable Long id, @RequestParam Long organizationId){
        return ResponseEntity.ok(saleService.deleteSale(id, organizationId));
    }
}