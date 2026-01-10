package org.f3.postalmanagement.entity.unit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.enums.OfficeType;

@Entity
@Table(name = "offices")
@Getter
@Setter
public class Office extends BaseEntity {

    @Column(name="office_name", nullable = false)
    private String officeName;

    @Column(name="office_email", nullable = false, unique = true)
    private String officeEmail;

    @Column(name="office_phone_number", nullable = false)
    private String officePhoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="parent_id")
    private Office parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="province_code")
    private Province province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="ward_code")
    private Ward ward;

    @Enumerated(EnumType.STRING)
    @Column(name="office_type", nullable = false)
    private OfficeType officeType;
}
