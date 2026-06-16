package com.endeavor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String currency; // e.g. "USD", "EUR"
    private String title;      // e.g. "Mr.", "Dr.", "Prof."
    private String fullName;
    private String email;
    private String phone;
    private String company;
    private String country;

    private String packageType;  // e.g. "Speaker Registration", "Delegate Registration", "Student Registration"
    private Double packagePrice;

    private String addOns;       // e.g. "Single Occupancy (3 Nights)", "Double Occupancy (3 Nights)", "None"
    private Double addOnsPrice;

    private Double totalAmount;
    private String paymentStatus; // e.g. "PENDING", "COMPLETED", "FAILED"
    private String transactionId; // payment gateway transaction reference

    public Registration() {
    }

    public Registration(Long id, String currency, String title, String fullName, String email, String phone, String company, 
                        String country, String packageType, Double packagePrice, String addOns, Double addOnsPrice, 
                        Double totalAmount, String paymentStatus, String transactionId) {
        this.id = id;
        this.currency = currency;
        this.title = title;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.company = company;
        this.country = country;
        this.packageType = packageType;
        this.packagePrice = packagePrice;
        this.addOns = addOns;
        this.addOnsPrice = addOnsPrice;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.transactionId = transactionId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPackageType() {
        return packageType;
    }

    public void setPackageType(String packageType) {
        this.packageType = packageType;
    }

    public Double getPackagePrice() {
        return packagePrice;
    }

    public void setPackagePrice(Double packagePrice) {
        this.packagePrice = packagePrice;
    }

    public String getAddOns() {
        return addOns;
    }

    public void setAddOns(String addOns) {
        this.addOns = addOns;
    }

    public Double getAddOnsPrice() {
        return addOnsPrice;
    }

    public void setAddOnsPrice(Double addOnsPrice) {
        this.addOnsPrice = addOnsPrice;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    @Column(name="conference_id")
    private Long conferenceId;

    public Long getConferenceId() { return conferenceId; }
    public void setConferenceId(Long conferenceId) { this.conferenceId = conferenceId; }
}
