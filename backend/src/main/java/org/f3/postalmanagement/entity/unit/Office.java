package org.f3.postalmanagement.entity.unit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.administrative.AdministrativeRegion;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.enums.OfficeType;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "offices")
@Getter
@Setter
@SQLDelete(sql = "UPDATE offices SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Office extends BaseEntity {

    @Column(name="office_name", nullable = false)
    private String officeName;

    @Column(name="office_email", nullable = false, unique = true)
    private String officeEmail;

    @Column(name="office_phone_number", nullable = false)
    private String officePhoneNumber;

    @Column(name="office_address_line1", nullable = false)
    private String officeAddressLine1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="ward_code")
    private Ward ward;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="region_id", nullable = false)
    private AdministrativeRegion region;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="parent_id")
    private Office parent;

    @Enumerated(EnumType.STRING)
    @Column(name="office_type", nullable = false)
    private OfficeType officeType;

    @Column(name="capacity")
    private Integer capacity;

    @Column(name = "is_accepting_orders", nullable = false)
    private Boolean isAcceptingOrders = true;

    @Column(name = "working_hours", nullable = false)
    private String workingHours = "07:00-17:00";

    public Province getProvince() {
        return ward != null ? ward.getProvince() : null;
    }
}
