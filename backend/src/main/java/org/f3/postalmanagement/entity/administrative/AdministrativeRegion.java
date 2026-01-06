package org.f3.postalmanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "administrative_regions")
@Getter
@Setter
public class AdministrativeRegion extends BaseEntity {

    @Column(name="name", nullable = false)
    private String name;

    @Column(name="code", nullable = false)
    private String code;
}
