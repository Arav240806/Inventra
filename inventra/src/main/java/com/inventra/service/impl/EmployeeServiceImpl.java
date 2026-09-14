package com.inventra.service.impl;
import com.inventra.entity.*;
import com.inventra.repository.*;
import com.inventra.service.*;
import java.util.*;
import org.springframework.stereotype.Service;
import com.inventra.exception.*;
@Service
public class EmployeeServiceImpl  implements EmployeeService{
    private EmployeeRepository employeeRepository;
    public EmployeeServiceImpl(EmployeeRepository employeeRepository){
        this.employeeRepository = employeeRepository;
    }
    public Employee addEmployee(Employee employee){
        employeeRepository.save(employee);
        return employee;
    }
    public Employee searchById(Long id, Long organizationId){
        return employeeRepository.findByIdAndOrganizationId(id, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }
    public Employee updateEmployee(Employee employee){
        employeeRepository.findByIdAndOrganizationId(employee.getId(), employee.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        employeeRepository.save(employee);
        return employee;
    }
    public String deleteEmployee(Long id, Long organizationId){
        Employee employee = employeeRepository.findByIdAndOrganizationId(id, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        employeeRepository.delete(employee);
        return "Employee deleted successfully";
    }
    public List<Employee> showAllEmployee(Long organizationId){
        return employeeRepository.findByOrganizationId(organizationId);
    }
    public List<Employee> findByFirstName(String firstName){
        return employeeRepository.findByFirstName(firstName);
    }
}