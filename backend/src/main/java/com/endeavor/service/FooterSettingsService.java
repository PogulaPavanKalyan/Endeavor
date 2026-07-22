package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.endeavor.entity.FooterSettings;
import com.endeavor.repository.FooterSettingsRepository;

import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
public class FooterSettingsService {

    @Autowired
    private FooterSettingsRepository repository;

    public FooterSettings getByConferenceId(Long conferenceId) {
        if (conferenceId == null) {
            return getDefaultFooterSettings(null);
        }
        Optional<FooterSettings> opt = repository.findByConferenceId(conferenceId);
        if (opt.isPresent()) {
            return opt.get();
        }
        // Initialize defaults if not saved yet
        FooterSettings defaults = getDefaultFooterSettings(conferenceId);
        return repository.save(defaults);
    }

    public FooterSettings saveFooterSettings(Long conferenceId, FooterSettings incoming) {
        FooterSettings settings = repository.findByConferenceId(conferenceId)
                .orElseGet(() -> {
                    FooterSettings newSettings = new FooterSettings();
                    newSettings.setConferenceId(conferenceId);
                    return newSettings;
                });

        // Sponsorship
        settings.setSponsorshipTitle(incoming.getSponsorshipTitle());
        settings.setSponsorshipDescription(incoming.getSponsorshipDescription());
        settings.setSponsorshipContent(incoming.getSponsorshipContent());
        settings.setSponsorshipPdf(incoming.getSponsorshipPdf());
        settings.setSponsorshipCtaText(incoming.getSponsorshipCtaText());
        settings.setSponsorshipCtaUrl(incoming.getSponsorshipCtaUrl());

        // Guidelines
        settings.setGuidelinesTitle(incoming.getGuidelinesTitle());
        settings.setGuidelinesContent(incoming.getGuidelinesContent());
        settings.setGuidelinesPdf(incoming.getGuidelinesPdf());

        // Contact
        settings.setContactEmail(incoming.getContactEmail());
        settings.setContactPhone(incoming.getContactPhone());
        settings.setContactWhatsapp(incoming.getContactWhatsapp());
        settings.setContactAddress(incoming.getContactAddress());
        settings.setGoogleMap(incoming.getGoogleMap());
        settings.setOfficeHours(incoming.getOfficeHours());

        // Policies
        settings.setPrivacyContent(incoming.getPrivacyContent());
        settings.setTermsContent(incoming.getTermsContent());
        settings.setCookiesContent(incoming.getCookiesContent());

        // Social Media
        settings.setFacebook(incoming.getFacebook());
        settings.setLinkedin(incoming.getLinkedin());
        settings.setInstagram(incoming.getInstagram());
        settings.setTwitter(incoming.getTwitter());
        settings.setYoutube(incoming.getYoutube());
        settings.setGithub(incoming.getGithub());
        settings.setWebsite(incoming.getWebsite());

        // Newsletter
        settings.setNewsletterEnabled(incoming.getNewsletterEnabled() != null ? incoming.getNewsletterEnabled() : true);
        settings.setNewsletterSuccessMessage(incoming.getNewsletterSuccessMessage());

        // SEO Fields
        settings.setSponsorshipMetaTitle(incoming.getSponsorshipMetaTitle());
        settings.setSponsorshipMetaDesc(incoming.getSponsorshipMetaDesc());
        settings.setSponsorshipKeywords(incoming.getSponsorshipKeywords());
        settings.setSponsorshipOgImage(incoming.getSponsorshipOgImage());
        settings.setSponsorshipCanonicalUrl(incoming.getSponsorshipCanonicalUrl());

        settings.setGuidelinesMetaTitle(incoming.getGuidelinesMetaTitle());
        settings.setGuidelinesMetaDesc(incoming.getGuidelinesMetaDesc());
        settings.setGuidelinesKeywords(incoming.getGuidelinesKeywords());
        settings.setGuidelinesOgImage(incoming.getGuidelinesOgImage());
        settings.setGuidelinesCanonicalUrl(incoming.getGuidelinesCanonicalUrl());

        settings.setContactMetaTitle(incoming.getContactMetaTitle());
        settings.setContactMetaDesc(incoming.getContactMetaDesc());
        settings.setContactKeywords(incoming.getContactKeywords());
        settings.setContactOgImage(incoming.getContactOgImage());
        settings.setContactCanonicalUrl(incoming.getContactCanonicalUrl());

        settings.setPrivacyMetaTitle(incoming.getPrivacyMetaTitle());
        settings.setPrivacyMetaDesc(incoming.getPrivacyMetaDesc());
        settings.setPrivacyKeywords(incoming.getPrivacyKeywords());
        settings.setPrivacyOgImage(incoming.getPrivacyOgImage());
        settings.setPrivacyCanonicalUrl(incoming.getPrivacyCanonicalUrl());

        settings.setTermsMetaTitle(incoming.getTermsMetaTitle());
        settings.setTermsMetaDesc(incoming.getTermsMetaDesc());
        settings.setTermsKeywords(incoming.getTermsKeywords());
        settings.setTermsOgImage(incoming.getTermsOgImage());
        settings.setTermsCanonicalUrl(incoming.getTermsCanonicalUrl());

        settings.setCookiesMetaTitle(incoming.getCookiesMetaTitle());
        settings.setCookiesMetaDesc(incoming.getCookiesMetaDesc());
        settings.setCookiesKeywords(incoming.getCookiesKeywords());
        settings.setCookiesOgImage(incoming.getCookiesOgImage());
        settings.setCookiesCanonicalUrl(incoming.getCookiesCanonicalUrl());

        return repository.save(settings);
    }

    public String storeFile(MultipartFile file) throws IOException {
        String folder = "uploads/footer/";
        String absolutePath = System.getProperty("user.dir") + "/" + folder;
        File uploadDir = new File(absolutePath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        String ext = "";
        String origName = file.getOriginalFilename();
        if (origName != null && origName.contains(".")) {
            ext = origName.substring(origName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + ext;
        File destFile = new File(uploadDir, fileName);
        file.transferTo(destFile);
        return "/uploads/footer/" + fileName;
    }

    private FooterSettings getDefaultFooterSettings(Long conferenceId) {
        FooterSettings f = new FooterSettings();
        f.setConferenceId(conferenceId);
        f.setSponsorshipTitle("Sponsorship Packages");
        f.setSponsorshipDescription("Partner with us for maximum global visibility and networking opportunities.");
        f.setSponsorshipContent("<h3>Why Sponsor Us?</h3><p>Our international conferences gather world-class researchers, industry leaders, and academics. Become a sponsor to showcase your innovations.</p>");
        f.setSponsorshipCtaText("Become a Sponsor");
        f.setSponsorshipCtaUrl("/register");

        f.setGuidelinesTitle("Author & Submission Guidelines");
        f.setGuidelinesContent("<h3>Abstract & Paper Submission Rules</h3><p>All submitted abstracts undergo double-blind peer review by our scientific committee.</p><ul><li>Submitted abstracts must be in English.</li><li>Word limit: 300 - 500 words.</li><li>Ensure original work with zero plagiarism.</li></ul>");

        f.setContactEmail("contact@intelevoresearch.org");
        f.setContactPhone("+1 (209) 299-5348");
        f.setContactWhatsapp("+1 (209) 299-5348");
        f.setContactAddress("1043 Garland Ave, Unit C #1012, San Jose, CA 95126-3159");
        f.setGoogleMap("https://maps.google.com/?q=1043+Garland+Ave,+San+Jose,+CA+95126");
        f.setOfficeHours("Mon – Fri, 9:00 AM – 6:00 PM EST");

        f.setPrivacyContent("<h3>Privacy Policy</h3><p>We value your privacy and are committed to protecting your personal data. We collect essential information to facilitate event registrations and communications.</p>");
        f.setTermsContent("<h3>Terms & Conditions</h3><p>By registering or submitting content to our conference portal, you agree to our standard terms and guidelines regarding attendance and code of conduct.</p>");
        f.setCookiesContent("<h3>Cookies Policy</h3><p>We use essential cookies to maintain session preferences and optimize portal responsiveness.</p>");

        f.setFacebook("https://facebook.com");
        f.setLinkedin("https://linkedin.com");
        f.setInstagram("https://instagram.com");
        f.setTwitter("https://twitter.com");
        f.setYoutube("https://youtube.com");
        f.setNewsletterEnabled(true);
        f.setNewsletterSuccessMessage("Thank you for subscribing to our conference newsletter!");
        return f;
    }
}
