package org.f3.postalmanagement.entity.actor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.enums.SubscriptionPlan;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "customers")
@Getter
@Setter
@SQLDelete(sql = "UPDATE customers SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Customer extends BaseEntity {

    @OneToOne(optional = true)
    @JoinColumn(name = "account_id", unique = true)
    private Account account;

    @Column(name="full_name", nullable = false)
    private String fullName;

    @Column(name="phone_number", nullable = false)
    private String phoneNumber;

    @Column(name="address", nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_plan", nullable = false)
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.BASIC;
}
