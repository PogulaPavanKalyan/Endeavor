package com.endeavor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "about_map_location")
public class AboutMapLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer x;
    private Integer y;
    private Boolean isOffice = false;
    private String officeTitle;
    private String officeAddress;

    public AboutMapLocation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getX() { return x; }
    public void setX(Integer x) { this.x = x; }

    public Integer getY() { return y; }
    public void setY(Integer y) { this.y = y; }

    public Boolean getIsOffice() { return isOffice; }
    public void setIsOffice(Boolean isOffice) { this.isOffice = isOffice; }

    public String getOfficeTitle() { return officeTitle; }
    public void setOfficeTitle(String officeTitle) { this.officeTitle = officeTitle; }

    public String getOfficeAddress() { return officeAddress; }
    public void setOfficeAddress(String officeAddress) { this.officeAddress = officeAddress; }
}
