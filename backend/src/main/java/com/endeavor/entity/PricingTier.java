package com.endeavor.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class PricingTier {

    private String type; // e.g. "Student", "Delegate"
    private Double earlyPrice;
    private Double midPrice;
    private Double finalPrice;

    public PricingTier() {
    }

    public PricingTier(String type, Double earlyPrice, Double midPrice, Double finalPrice) {
        this.type = type;
        this.earlyPrice = earlyPrice;
        this.midPrice = midPrice;
        this.finalPrice = finalPrice;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getEarlyPrice() {
        return earlyPrice;
    }

    public void setEarlyPrice(Double earlyPrice) {
        this.earlyPrice = earlyPrice;
    }

    public Double getMidPrice() {
        return midPrice;
    }

    public void setMidPrice(Double midPrice) {
        this.midPrice = midPrice;
    }

    public Double getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(Double finalPrice) {
        this.finalPrice = finalPrice;
    }
}
