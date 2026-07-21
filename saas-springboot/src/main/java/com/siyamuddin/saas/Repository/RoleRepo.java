package com.siyamuddin.saas.Repository;

import com.siyamuddin.saas.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepo extends JpaRepository<Role,Integer> {
}
