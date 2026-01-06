package org.f3.postalmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "administrative_units")
@Getter
@Setter
public class AdministrativeUnit extends BaseEntity {

    @Column(name="code", nullable = false, length = 20)
    private String code;

    @Column(name="name", nullable = false)
    private String name;
}
