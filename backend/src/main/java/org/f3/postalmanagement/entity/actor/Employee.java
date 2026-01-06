package org.f3.postalmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "employees")
@Getter
@Setter
public class Employee extends BaseEntity {

    @MapsId
    @OneToOne(optional = false)
    @JoinColumn(name = "id")
    private Account account;

    @Column(name="full_name", nullable = false)
    private String fullName;

    @Column(name="phone_number", nullable = false, unique = true)
    private String phoneNumber;


}
