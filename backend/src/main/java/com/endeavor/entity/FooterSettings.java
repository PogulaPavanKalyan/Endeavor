package com.endeavor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "footer_settings")
public class FooterSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conference_id", unique = true, nullable = false)
    private Long conferenceId;

    // 1. Sponsorship Page
    private String sponsorshipTitle;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String sponsorshipDescription;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String sponsorshipContent;

    private String sponsorshipPdf;
    private String sponsorshipCtaText;
    private String sponsorshipCtaUrl;

    // 2. Guidelines Page
    private String guidelinesTitle;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String guidelinesContent;

    private String guidelinesPdf;

    // 3. Contact Page / Information
    private String contactEmail;
    private String contactPhone;
    private String contactWhatsapp;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String contactAddress;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String googleMap;

    private String officeHours;

    // 4. Privacy Policy Page
    @Lob
    @Column(columnDefinition = "TEXT")
    private String privacyContent;

    // 5. Terms & Conditions Page
    @Lob
    @Column(columnDefinition = "TEXT")
    private String termsContent;

    // 6. Cookies Policy Page
    @Lob
    @Column(columnDefinition = "TEXT")
    private String cookiesContent;

    // 7. Social Media Links
    private String facebook;
    private String linkedin;
    private String instagram;
    private String twitter;
    private String youtube;
    private String github;
    private String website;

    // 8. Newsletter Settings
    private Boolean newsletterEnabled = true;
    private String newsletterSuccessMessage;

    // SEO Meta Fields
    private String sponsorshipMetaTitle;
    private String sponsorshipMetaDesc;
    private String sponsorshipKeywords;
    private String sponsorshipOgImage;
    private String sponsorshipCanonicalUrl;

    private String guidelinesMetaTitle;
    private String guidelinesMetaDesc;
    private String guidelinesKeywords;
    private String guidelinesOgImage;
    private String guidelinesCanonicalUrl;

    private String contactMetaTitle;
    private String contactMetaDesc;
    private String contactKeywords;
    private String contactOgImage;
    private String contactCanonicalUrl;

    private String privacyMetaTitle;
    private String privacyMetaDesc;
    private String privacyKeywords;
    private String privacyOgImage;
    private String privacyCanonicalUrl;

    private String termsMetaTitle;
    private String termsMetaDesc;
    private String termsKeywords;
    private String termsOgImage;
    private String termsCanonicalUrl;

    private String cookiesMetaTitle;
    private String cookiesMetaDesc;
    private String cookiesKeywords;
    private String cookiesOgImage;
    private String cookiesCanonicalUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public FooterSettings() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConferenceId() {
        return conferenceId;
    }

    public void setConferenceId(Long conferenceId) {
        this.conferenceId = conferenceId;
    }

    public String getSponsorshipTitle() {
        return sponsorshipTitle;
    }

    public void setSponsorshipTitle(String sponsorshipTitle) {
        this.sponsorshipTitle = sponsorshipTitle;
    }

    public String getSponsorshipDescription() {
        return sponsorshipDescription;
    }

    public void setSponsorshipDescription(String sponsorshipDescription) {
        this.sponsorshipDescription = sponsorshipDescription;
    }

    public String getSponsorshipContent() {
        return sponsorshipContent;
    }

    public void setSponsorshipContent(String sponsorshipContent) {
        this.sponsorshipContent = sponsorshipContent;
    }

    public String getSponsorshipPdf() {
        return sponsorshipPdf;
    }

    public void setSponsorshipPdf(String sponsorshipPdf) {
        this.sponsorshipPdf = sponsorshipPdf;
    }

    public String getSponsorshipCtaText() {
        return sponsorshipCtaText;
    }

    public void setSponsorshipCtaText(String sponsorshipCtaText) {
        this.sponsorshipCtaText = sponsorshipCtaText;
    }

    public String getSponsorshipCtaUrl() {
        return sponsorshipCtaUrl;
    }

    public void setSponsorshipCtaUrl(String sponsorshipCtaUrl) {
        this.sponsorshipCtaUrl = sponsorshipCtaUrl;
    }

    public String getGuidelinesTitle() {
        return guidelinesTitle;
    }

    public void setGuidelinesTitle(String guidelinesTitle) {
        this.guidelinesTitle = guidelinesTitle;
    }

    public String getGuidelinesContent() {
        return guidelinesContent;
    }

    public void setGuidelinesContent(String guidelinesContent) {
        this.guidelinesContent = guidelinesContent;
    }

    public String getGuidelinesPdf() {
        return guidelinesPdf;
    }

    public void setGuidelinesPdf(String guidelinesPdf) {
        this.guidelinesPdf = guidelinesPdf;
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

    public String getContactWhatsapp() {
        return contactWhatsapp;
    }

    public void setContactWhatsapp(String contactWhatsapp) {
        this.contactWhatsapp = contactWhatsapp;
    }

    public String getContactAddress() {
        return contactAddress;
    }

    public void setContactAddress(String contactAddress) {
        this.contactAddress = contactAddress;
    }

    public String getGoogleMap() {
        return googleMap;
    }

    public void setGoogleMap(String googleMap) {
        this.googleMap = googleMap;
    }

    public String getOfficeHours() {
        return officeHours;
    }

    public void setOfficeHours(String officeHours) {
        this.officeHours = officeHours;
    }

    public String getPrivacyContent() {
        return privacyContent;
    }

    public void setPrivacyContent(String privacyContent) {
        this.privacyContent = privacyContent;
    }

    public String getTermsContent() {
        return termsContent;
    }

    public void setTermsContent(String termsContent) {
        this.termsContent = termsContent;
    }

    public String getCookiesContent() {
        return cookiesContent;
    }

    public void setCookiesContent(String cookiesContent) {
        this.cookiesContent = cookiesContent;
    }

    public String getFacebook() {
        return facebook;
    }

    public void setFacebook(String facebook) {
        this.facebook = facebook;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getInstagram() {
        return instagram;
    }

    public void setInstagram(String instagram) {
        this.instagram = instagram;
    }

    public String getTwitter() {
        return twitter;
    }

    public void setTwitter(String twitter) {
        this.twitter = twitter;
    }

    public String getYoutube() {
        return youtube;
    }

    public void setYoutube(String youtube) {
        this.youtube = youtube;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public Boolean getNewsletterEnabled() {
        return newsletterEnabled;
    }

    public void setNewsletterEnabled(Boolean newsletterEnabled) {
        this.newsletterEnabled = newsletterEnabled;
    }

    public String getNewsletterSuccessMessage() {
        return newsletterSuccessMessage;
    }

    public void setNewsletterSuccessMessage(String newsletterSuccessMessage) {
        this.newsletterSuccessMessage = newsletterSuccessMessage;
    }

    public String getSponsorshipMetaTitle() {
        return sponsorshipMetaTitle;
    }

    public void setSponsorshipMetaTitle(String sponsorshipMetaTitle) {
        this.sponsorshipMetaTitle = sponsorshipMetaTitle;
    }

    public String getSponsorshipMetaDesc() {
        return sponsorshipMetaDesc;
    }

    public void setSponsorshipMetaDesc(String sponsorshipMetaDesc) {
        this.sponsorshipMetaDesc = sponsorshipMetaDesc;
    }

    public String getSponsorshipKeywords() {
        return sponsorshipKeywords;
    }

    public void setSponsorshipKeywords(String sponsorshipKeywords) {
        this.sponsorshipKeywords = sponsorshipKeywords;
    }

    public String getSponsorshipOgImage() {
        return sponsorshipOgImage;
    }

    public void setSponsorshipOgImage(String sponsorshipOgImage) {
        this.sponsorshipOgImage = sponsorshipOgImage;
    }

    public String getSponsorshipCanonicalUrl() {
        return sponsorshipCanonicalUrl;
    }

    public void setSponsorshipCanonicalUrl(String sponsorshipCanonicalUrl) {
        this.sponsorshipCanonicalUrl = sponsorshipCanonicalUrl;
    }

    public String getGuidelinesMetaTitle() {
        return guidelinesMetaTitle;
    }

    public void setGuidelinesMetaTitle(String guidelinesMetaTitle) {
        this.guidelinesMetaTitle = guidelinesMetaTitle;
    }

    public String getGuidelinesMetaDesc() {
        return guidelinesMetaDesc;
    }

    public void setGuidelinesMetaDesc(String guidelinesMetaDesc) {
        this.guidelinesMetaDesc = guidelinesMetaDesc;
    }

    public String getGuidelinesKeywords() {
        return guidelinesKeywords;
    }

    public void setGuidelinesKeywords(String guidelinesKeywords) {
        this.guidelinesKeywords = guidelinesKeywords;
    }

    public String getGuidelinesOgImage() {
        return guidelinesOgImage;
    }

    public void setGuidelinesOgImage(String guidelinesOgImage) {
        this.guidelinesOgImage = guidelinesOgImage;
    }

    public String getGuidelinesCanonicalUrl() {
        return guidelinesCanonicalUrl;
    }

    public void setGuidelinesCanonicalUrl(String guidelinesCanonicalUrl) {
        this.guidelinesCanonicalUrl = guidelinesCanonicalUrl;
    }

    public String getContactMetaTitle() {
        return contactMetaTitle;
    }

    public void setContactMetaTitle(String contactMetaTitle) {
        this.contactMetaTitle = contactMetaTitle;
    }

    public String getContactMetaDesc() {
        return contactMetaDesc;
    }

    public void setContactMetaDesc(String contactMetaDesc) {
        this.contactMetaDesc = contactMetaDesc;
    }

    public String getContactKeywords() {
        return contactKeywords;
    }

    public void setContactKeywords(String contactKeywords) {
        this.contactKeywords = contactKeywords;
    }

    public String getContactOgImage() {
        return contactOgImage;
    }

    public void setContactOgImage(String contactOgImage) {
        this.contactOgImage = contactOgImage;
    }

    public String getContactCanonicalUrl() {
        return contactCanonicalUrl;
    }

    public void setContactCanonicalUrl(String contactCanonicalUrl) {
        this.contactCanonicalUrl = contactCanonicalUrl;
    }

    public String getPrivacyMetaTitle() {
        return privacyMetaTitle;
    }

    public void setPrivacyMetaTitle(String privacyMetaTitle) {
        this.privacyMetaTitle = privacyMetaTitle;
    }

    public String getPrivacyMetaDesc() {
        return privacyMetaDesc;
    }

    public void setPrivacyMetaDesc(String privacyMetaDesc) {
        this.privacyMetaDesc = privacyMetaDesc;
    }

    public String getPrivacyKeywords() {
        return privacyKeywords;
    }

    public void setPrivacyKeywords(String privacyKeywords) {
        this.privacyKeywords = privacyKeywords;
    }

    public String getPrivacyOgImage() {
        return privacyOgImage;
    }

    public void setPrivacyOgImage(String privacyOgImage) {
        this.privacyOgImage = privacyOgImage;
    }

    public String getPrivacyCanonicalUrl() {
        return privacyCanonicalUrl;
    }

    public void setPrivacyCanonicalUrl(String privacyCanonicalUrl) {
        this.privacyCanonicalUrl = privacyCanonicalUrl;
    }

    public String getTermsMetaTitle() {
        return termsMetaTitle;
    }

    public void setTermsMetaTitle(String termsMetaTitle) {
        this.termsMetaTitle = termsMetaTitle;
    }

    public String getTermsMetaDesc() {
        return termsMetaDesc;
    }

    public void setTermsMetaDesc(String termsMetaDesc) {
        this.termsMetaDesc = termsMetaDesc;
    }

    public String getTermsKeywords() {
        return termsKeywords;
    }

    public void setTermsKeywords(String termsKeywords) {
        this.termsKeywords = termsKeywords;
    }

    public String getTermsOgImage() {
        return termsOgImage;
    }

    public void setTermsOgImage(String termsOgImage) {
        this.termsOgImage = termsOgImage;
    }

    public String getTermsCanonicalUrl() {
        return termsCanonicalUrl;
    }

    public void setTermsCanonicalUrl(String termsCanonicalUrl) {
        this.termsCanonicalUrl = termsCanonicalUrl;
    }

    public String getCookiesMetaTitle() {
        return cookiesMetaTitle;
    }

    public void setCookiesMetaTitle(String cookiesMetaTitle) {
        this.cookiesMetaTitle = cookiesMetaTitle;
    }

    public String getCookiesMetaDesc() {
        return cookiesMetaDesc;
    }

    public void setCookiesMetaDesc(String cookiesMetaDesc) {
        this.cookiesMetaDesc = cookiesMetaDesc;
    }

    public String getCookiesKeywords() {
        return cookiesKeywords;
    }

    public void setCookiesKeywords(String cookiesKeywords) {
        this.cookiesKeywords = cookiesKeywords;
    }

    public String getCookiesOgImage() {
        return cookiesOgImage;
    }

    public void setCookiesOgImage(String cookiesOgImage) {
        this.cookiesOgImage = cookiesOgImage;
    }

    public String getCookiesCanonicalUrl() {
        return cookiesCanonicalUrl;
    }

    public void setCookiesCanonicalUrl(String cookiesCanonicalUrl) {
        this.cookiesCanonicalUrl = cookiesCanonicalUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
