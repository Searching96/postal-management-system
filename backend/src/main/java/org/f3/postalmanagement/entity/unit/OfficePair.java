package org.f3.postalmanagement.entity.unit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "office_pairs")
@Getter
@Setter
@SQLDelete(sql = "UPDATE office_pairs SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class OfficePair extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "wh_office_id", nullable = false)
    private Office whOffice;

    @OneToOne
    @JoinColumn(name = "po_office_id", nullable = false)
    private Office poOffice;
}
