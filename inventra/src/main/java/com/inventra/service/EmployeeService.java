package com.inventra.service;
import com.inventra.entity.Employee;
import java.util.*;
public interface EmployeeService {
    public Employee addEmployee(Employee employee);
    public Employee searchById(Long id, Long organizationId);
    public Employee updateEmployee(Employee employee);
    public String deleteEmployee(Long id, Long organizationId);
    public List<Employee> showAllEmployee(Long organizationId);
}