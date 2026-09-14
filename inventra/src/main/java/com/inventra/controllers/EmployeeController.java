package com.inventra.controllers;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.inventra.entity.Employee;
import com.inventra.service.EmployeeService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/Employees")
public class EmployeeController{
    private EmployeeService employeeService;
    public EmployeeController(EmployeeService employeeService){
        this.employeeService = employeeService;
    }

@PostMapping("/add")
    public ResponseEntity<Employee> addEmployee(@Valid @RequestBody Employee employee){
        Employee addEmployee = employeeService.addEmployee(employee);

        return ResponseEntity.ok(addEmployee);

    }

@GetMapping("{id}")
public ResponseEntity<Employee> searchById( @PathVariable Long id, @RequestParam Long organizationId) {
    Employee searchEmployee = employeeService.searchById(id, organizationId);

    return ResponseEntity.ok(searchEmployee);

}

@PutMapping("/update")
public ResponseEntity<Employee> updateEmployee(@Valid @RequestBody Employee employee){
    Employee updateEmployee = employeeService.updateEmployee(employee);

    return ResponseEntity.ok(updateEmployee);
}

@DeleteMapping("/{id}")
public ResponseEntity<String> deleteEmployee(@PathVariable Long id, @RequestParam Long organizationId){

    String message = employeeService.deleteEmployee(id, organizationId);

    return ResponseEntity.ok(message);
}

@GetMapping("/all")
public ResponseEntity<List<Employee>> showAllEmployee(@RequestParam Long organizationId){
    List<Employee> employees = employeeService.showAllEmployee(organizationId);

    return ResponseEntity.ok(employees);
}



}