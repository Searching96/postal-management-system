package org.f3.postalmanagement.entity.administrative;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "administrative_units")
@Getter
@Setter
public class AdministrativeUnit {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "full_name", length = 255)
    private String name;
}
