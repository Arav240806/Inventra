package com.inventra.repository;
import com.inventra.entity.*;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;
public interface AccountRepository extends JpaRepository<Account, Long>{
    Optional<Account> findByUsername(String username);
}
