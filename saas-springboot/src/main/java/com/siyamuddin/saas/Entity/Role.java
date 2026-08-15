package com.siyamuddin.saas.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class Role {
    @Id
    private int id;
    private String name;
}
