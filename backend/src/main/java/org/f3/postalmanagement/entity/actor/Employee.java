package org.f3.postalmanagement.entity.actor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.unit.Office;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "employees")
@Getter
@Setter
@SQLDelete(sql = "UPDATE employees SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Employee extends BaseEntity {

    @MapsId
    @OneToOne(optional = false)
    @JoinColumn(name = "id")
    private Account account;

    @Column(name="full_name", nullable = false)
    private String fullName;

    @Column(name="phone_number", nullable = false, unique = true)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="office_id", nullable = false)
    private Office office;
}
