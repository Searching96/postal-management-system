package org.f3.postalmanagement.entity.administrative;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "administrative_regions")
@Getter
@Setter
public class AdministrativeRegion {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;
}
