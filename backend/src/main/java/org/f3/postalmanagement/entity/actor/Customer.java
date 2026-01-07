package org.f3.postalmanagement.entity.actor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;

@Entity
@Table(name = "customers")
@Getter
@Setter
public class Customer extends BaseEntity {

    @OneToOne(optional = true)
    @JoinColumn(name = "account_id", unique = true)
    private Account account;

    @Column(name="full_name", nullable = false)
    private String fullName;

    @Column(name="phoneNumber", nullable = false)
    private String phoneNumber;

    @Column(name="address", nullable = false)
    private String address;
}
