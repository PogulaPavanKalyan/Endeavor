package com.endeavor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "about_partner_network")
public class AboutPartnerNetwork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String logoFileName;
    private Integer displayOrder = 0;

    public AboutPartnerNetwork() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLogoFileName() { return logoFileName; }
    public void setLogoFileName(String logoFileName) { this.logoFileName = logoFileName; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
