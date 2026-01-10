package org.f3.postalmanagement.entity.unit;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;

@Entity
@Table(name = "offices")
@Getter
@Setter
public class Office extends BaseEntity {


}
