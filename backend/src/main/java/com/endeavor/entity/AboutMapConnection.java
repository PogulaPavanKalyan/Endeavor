package com.endeavor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "about_map_connection")
public class AboutMapConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer startX;
    private Integer startY;
    private Integer controlX;
    private Integer controlY;
    private Integer endX;
    private Integer endY;
    private Double opacity = 0.4;
    private String dashArray; // E.g., "8 5"

    public AboutMapConnection() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getStartX() { return startX; }
    public void setStartX(Integer startX) { this.startX = startX; }

    public Integer getStartY() { return startY; }
    public void setStartY(Integer startY) { this.startY = startY; }

    public Integer getControlX() { return controlX; }
    public void setControlX(Integer controlX) { this.controlX = controlX; }

    public Integer getControlY() { return controlY; }
    public void setControlY(Integer controlY) { this.controlY = controlY; }

    public Integer getEndX() { return endX; }
    public void setEndX(Integer endX) { this.endX = endX; }

    public Integer getEndY() { return endY; }
    public void setEndY(Integer endY) { this.endY = endY; }

    public Double getOpacity() { return opacity; }
    public void setOpacity(Double opacity) { this.opacity = opacity; }

    public String getDashArray() { return dashArray; }
    public void setDashArray(String dashArray) { this.dashArray = dashArray; }
}
