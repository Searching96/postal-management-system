package org.f3.postalmanagement.entity.unit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(name = "ward_office_assignments")
@Getter
@Setter
@SQLDelete(sql = "UPDATE ward_office_assignments SET deleted_at = NOW() WHERE id = ?")
public class WardOfficeAssignment extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_pair_id", nullable = false)
    private OfficePair officePair;
}
