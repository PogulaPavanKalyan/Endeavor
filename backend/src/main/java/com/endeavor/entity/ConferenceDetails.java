package com.endeavor.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.List;

@Entity
@Table(name = "conference_details")
public class ConferenceDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tittle")
    private String title;
    
    private Integer year;
    private Boolean isDeleted = false;

    @ManyToOne
    @JoinColumn(name = "series_id")
    private ConferenceSeries series;

    private String startDate;
    private String endDate;

    @Column(columnDefinition = "TEXT")
    private String venue;

    @Column(columnDefinition = "TEXT")
    private String mapUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    private String brochureFileName;

    @Column(unique = true, nullable = false)
    private String slug;

    private String status = "PUBLISHED"; // DRAFT, PUBLISHED, ARCHIVED
    private String themePrimary = "#e74c3c";
    private String themePrimaryHover = "#c0392b";
    private String themeAccent = "#f39c12";
    private String contactEmail;
    private String contactPhone;
    private String metaTitle;
    
    @Column(columnDefinition = "TEXT")
    private String metaDescription;
    
    private String city;
    private String country;
    private Boolean isFeatured = false;
    
    @Column(columnDefinition = "TEXT")
    private String shortDescription;


    @ElementCollection
    private List<PricingTier> pricingTiers;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "photo_id", referencedColumnName = "id")
    @JsonManagedReference
    private ConferencePhoto photo;

    public ConferenceDetails() {
    }

    public ConferenceDetails(Long id, String title, String startDate, String endDate, String venue, String mapUrl, String description, ConferencePhoto photo) {
        this.id = id;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.venue = venue;
        this.mapUrl = mapUrl;
        this.description = description;
        this.photo = photo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // Alias for backward compatibility
    public String getTittle() {
        return title;
    }

    // Alias for backward compatibility
    public void setTittle(String tittle) {
        this.title = tittle;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getMapUrl() {
        return mapUrl;
    }

    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }

    public ConferencePhoto getPhoto() {
        return photo;
    }

    public void setPhoto(ConferencePhoto photo) {
        this.photo = photo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public List<PricingTier> getPricingTiers() {
        return pricingTiers;
    }

    public void setPricingTiers(List<PricingTier> pricingTiers) {
        this.pricingTiers = pricingTiers;
    }

    public String getBrochureFileName() {
        return brochureFileName;
    }

    public void setBrochureFileName(String brochureFileName) {
        this.brochureFileName = brochureFileName;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getThemePrimary() {
        return themePrimary;
    }

    public void setThemePrimary(String themePrimary) {
        this.themePrimary = themePrimary;
    }

    public String getThemePrimaryHover() {
        return themePrimaryHover;
    }

    public void setThemePrimaryHover(String themePrimaryHover) {
        this.themePrimaryHover = themePrimaryHover;
    }

    public String getThemeAccent() {
        return themeAccent;
    }

    public void setThemeAccent(String themeAccent) {
        this.themeAccent = themeAccent;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getMetaTitle() {
        return metaTitle;
    }

    public void setMetaTitle(String metaTitle) {
        this.metaTitle = metaTitle;
    }

    public String getMetaDescription() {
        return metaDescription;
    }

    public void setMetaDescription(String metaDescription) {
        this.metaDescription = metaDescription;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public ConferenceSeries getSeries() {
        return series;
    }

    public void setSeries(ConferenceSeries series) {
        this.series = series;
    }
}
