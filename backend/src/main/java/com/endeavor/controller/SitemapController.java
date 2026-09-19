package com.endeavor.controller;

import com.endeavor.entity.ConferenceDetails;
import com.endeavor.entity.Webinar;
import com.endeavor.service.ConferenceDetailsService;
import com.endeavor.service.WebinarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
public class SitemapController {

    @Autowired
    private ConferenceDetailsService conferenceDetailsService;

    @Autowired
    private WebinarService webinarService;

    @GetMapping(value = {"/api/sitemap.xml", "/api/sitemap"}, produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getDynamicSitemap() {
        String baseUrl = "https://intelevoresearch.com";
        String today = LocalDate.now().toString();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"\n");
        xml.append("        xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n");

        // Static Main Core Routes
        addUrl(xml, baseUrl + "/", today, "daily", "1.0");
        addUrl(xml, baseUrl + "/about", today, "weekly", "0.9");
        addUrl(xml, baseUrl + "/contact", today, "monthly", "0.9");
        addUrl(xml, baseUrl + "/conferences", today, "daily", "0.9");
        addUrl(xml, baseUrl + "/sponsors", today, "monthly", "0.8");
        addUrl(xml, baseUrl + "/webinars", today, "weekly", "0.8");
        addUrl(xml, baseUrl + "/proceedings", today, "weekly", "0.8");
        addUrl(xml, baseUrl + "/register", today, "monthly", "0.8");
        addUrl(xml, baseUrl + "/submit-abstract", today, "monthly", "0.8");

        // Dynamic Conferences
        try {
            List<ConferenceDetails> conferences = conferenceDetailsService.getAllConferences();
            if (conferences != null) {
                for (ConferenceDetails conf : conferences) {
                    if (conf.getSlug() != null && !conf.getSlug().trim().isEmpty()) {
                        String confUrl = baseUrl + "/conferences/" + conf.getSlug();
                        addUrl(xml, confUrl, today, "weekly", "0.9");
                        addUrl(xml, confUrl + "/speakers", today, "weekly", "0.8");
                        addUrl(xml, confUrl + "/tracks", today, "weekly", "0.8");
                        addUrl(xml, confUrl + "/program", today, "weekly", "0.8");
                        addUrl(xml, confUrl + "/venue", today, "monthly", "0.8");
                        addUrl(xml, confUrl + "/register", today, "weekly", "0.8");
                        addUrl(xml, confUrl + "/guidelines", today, "monthly", "0.7");
                        addUrl(xml, confUrl + "/sponsorship", today, "monthly", "0.7");
                        addUrl(xml, confUrl + "/contact", today, "monthly", "0.7");
                    }
                }
            }
        } catch (Exception e) {
            // Ignore failure to ensure base sitemap still renders
        }

        // Dynamic Webinars
        try {
            List<Webinar> webinars = webinarService.getPublicWebinars(null, null, PageRequest.of(0, 100)).getContent();
            if (webinars != null) {
                for (Webinar w : webinars) {
                    if (w.getSlug() != null && !w.getSlug().trim().isEmpty()) {
                        addUrl(xml, baseUrl + "/webinars/" + w.getSlug(), today, "weekly", "0.8");
                    }
                }
            }
        } catch (Exception e) {
            // Ignore failure
        }

        xml.append("</urlset>");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);
        return new ResponseEntity<>(xml.toString(), headers, HttpStatus.OK);
    }

    private void addUrl(StringBuilder xml, String loc, String lastmod, String changefreq, String priority) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escapeXml(loc)).append("</loc>\n");
        xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

    private String escapeXml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
