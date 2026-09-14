package com.inventra.repository;
import com.inventra.entity.*;
import org.springframework.data.jpa.repository.*;
import java.util.List;
import java.util.Optional;
public interface EmployeeRepository extends JpaRepository<Employee, Long>{
    public List<Employee> findByFirstName(String firstName);
    List<Employee> findByOrganizationId(Long organizationId);
    Optional<Employee> findByIdAndOrganizationId(Long id, Long organizationId);
}