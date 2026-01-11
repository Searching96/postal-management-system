package org.f3.postalmanagement.entity.actor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.enums.Role;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@SQLDelete(sql = "UPDATE accounts SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Account extends BaseEntity {

    @Column(name="username", nullable = false, unique = true) // For customer, this field is phone number
    private String username;

    @Column(name="password", nullable = false)
    private String password;

    @Column(name="email", nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name="role_name", nullable = false)
    private Role role;

    @Column(name="is_active", nullable = false)
    private boolean isActive;
}
