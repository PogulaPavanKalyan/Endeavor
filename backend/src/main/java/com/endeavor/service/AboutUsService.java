package com.endeavor.service;

import com.endeavor.entity.*;
import com.endeavor.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AboutUsService {

    @Autowired
    private AboutUsSectionRepo sectionRepo;

    @Autowired
    private AboutOverviewFeatureRepo overviewFeatureRepo;

    @Autowired
    private AboutServiceItemRepo serviceItemRepo;

    @Autowired
    private AboutWhyChooseItemRepo whyChooseItemRepo;

    @Autowired
    private AboutPartnerNetworkRepo partnerNetworkRepo;

    @Autowired
    private AboutTimelineMilestoneRepo timelineMilestoneRepo;

    @Autowired
    private AboutAdvisoryLeaderRepo advisoryLeaderRepo;

    @Autowired
    private AboutMapLocationRepo mapLocationRepo;

    @Autowired
    private AboutMapConnectionRepo mapConnectionRepo;

    // --- AboutUsSection (Single Config) ---
    public AboutUsSection getAboutUsSection() {
        Optional<AboutUsSection> sectionOpt = sectionRepo.findById(1L);
        if (sectionOpt.isPresent()) {
            return sectionOpt.get();
        }
        // Initialize and return default static content if empty
        AboutUsSection s = new AboutUsSection();
        s.setId(1L);
        s.setHeroBadge("About Research Endeavor");
        s.setHeroTitle("Connecting Global\nResearch Communities");
        s.setHeroDescription("Research Endeavor brings together researchers, academicians, industry experts and innovators through international conferences, publications and scientific networking across 50+ countries worldwide.");
        s.setHeroCtaText1("🏛️ Explore Conferences");
        s.setHeroCtaLink1("/conferences");
        s.setHeroCtaText2("Submit Abstract →");
        s.setHeroCtaLink2("/submit-abstract");
        s.setHeroBgImage("https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1800&q=90");

        s.setOverviewLabel("Company Overview");
        s.setOverviewTitle("Who We Are");
        s.setOverviewLead("Research Endeavor is a premier global platform designed specifically to connect researchers, scientists, academicians, and industry experts worldwide.");
        s.setOverviewBody("We focus on building international communities by organizing double-blind peer-reviewed conferences, workshops, and dynamic webinars. Through strategic indexing relationships, we ensure the dissemination of accepted abstracts inside recognized global proceedings.");
        s.setOverviewImage1("https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80");
        s.setOverviewImage2("https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=500&q=80");
        s.setOverviewBadgeIcon("🏆");
        s.setOverviewBadgeTitle("Est. 2015");
        s.setOverviewBadgeText("10+ Years of Excellence");

        s.setMissionTitle("Our Mission");
        s.setMissionDesc("To empower the global research community by organizing high-impact international conferences and virtual assemblies. We facilitate knowledge exchange, ensure robust abstract vetting, and build stable bridges between pioneer researchers and index databases — making science accessible to all.");
        s.setMissionPoints("🔬 Peer-reviewed quality assurance\n🌍 Global researcher connectivity\n📖 Open-access publication pathways");

        s.setVisionTitle("Our Vision");
        s.setVisionDesc("To lead as the world's most trusted scientific communication framework. We aim to accelerate the publication cycle of pioneering discoveries, making scientific findings accessible, discoverable, and impactful for global policy developers and innovators.");
        s.setVisionPoints("🚀 200+ annual conferences by 2030\n🤝 Cross-border research collaboration\n🏛️ Open-access journal series launch");

        s.setStatConferences(150);
        s.setStatResearchers(10000);
        s.setStatCountries(50);
        s.setStatPublications(500);
        s.setStatSpeakers(200);
        s.setStatSatisfaction(98);

        s.setCtaTitle("Join the Global Research Community");
        s.setCtaDesc("Submit your abstract proposal to obtain rigorous peer reviews, expand your publication footprint, and network with distinguished scholars from 50+ countries.");
        s.setCtaButton1Text("Explore Conferences");
        s.setCtaButton1Link("/conferences");
        s.setCtaButton2Text("Submit Abstract");
        s.setCtaButton2Link("/submit-abstract");

        return sectionRepo.save(s);
    }

    public AboutUsSection saveAboutUsSection(AboutUsSection section) {
        section.setId(1L);
        return sectionRepo.save(section);
    }

    // --- Overview Features ---
    public List<AboutOverviewFeature> getOverviewFeatures() {
        List<AboutOverviewFeature> list = overviewFeatureRepo.findAllByOrderByDisplayOrderAsc();
        if (list.isEmpty()) {
            // Seed defaults
            list = new ArrayList<>();
            list.add(createOverviewFeature("Global Dissemination", "Fast-tracking proceedings publication through Scopus channels.", 1));
            list.add(createOverviewFeature("Rigorous Peer Assessment", "Supervised by distinguished steering boards and domain committees.", 2));
            list.add(createOverviewFeature("International Recognition", "Indexed by Scopus, Web of Science, CrossRef, and Google Scholar.", 3));
            overviewFeatureRepo.saveAll(list);
        }
        return list;
    }

    private AboutOverviewFeature createOverviewFeature(String title, String desc, int order) {
        AboutOverviewFeature f = new AboutOverviewFeature();
        f.setTitle(title);
        f.setDescription(desc);
        f.setDisplayOrder(order);
        return f;
    }

    // --- Service Items ---
    public List<AboutServiceItem> getServiceItems() {
        List<AboutServiceItem> list = serviceItemRepo.findAllByOrderByDisplayOrderAsc();
        if (list.isEmpty()) {
            list = new ArrayList<>();
            list.add(createServiceItem("🏛️", "International Conferences", "Organize high-quality in-person, hybrid and virtual international conferences across all major scientific disciplines and engineering tracks.", "150+ Events", 1));
            list.add(createServiceItem("📖", "Research Publications", "Fast-track publication of conference proceedings in globally recognized and indexed journals including Scopus, Web of Science and CrossRef.", "500+ Papers", 2));
            list.add(createServiceItem("💻", "Webinars & Workshops", "Expert-led virtual webinars and intensive skill workshops bringing cutting-edge research insights directly to your screen from leading institutions.", "200+ Sessions", 3));
            list.add(createServiceItem("🤝", "Academic Networking", "Connect with 10,000+ researchers, professors, scientists and industry leaders to discover collaboration opportunities and joint research programs.", "10,000+ Members", 4));
            serviceItemRepo.saveAll(list);
        }
        return list;
    }

    private AboutServiceItem createServiceItem(String icon, String title, String desc, String tag, int order) {
        AboutServiceItem s = new AboutServiceItem();
        s.setIcon(icon);
        s.setTitle(title);
        s.setDescription(desc);
        s.setTag(tag);
        s.setDisplayOrder(order);
        return s;
    }

    // --- Why Choose Items ---
    public List<AboutWhyChooseItem> getWhyChooseItems() {
        List<AboutWhyChooseItem> list = whyChooseItemRepo.findAllByOrderByDisplayOrderAsc();
        if (list.isEmpty()) {
            list = new ArrayList<>();
            list.add(createWhyChooseItem("🌐", "Global Reach", "Connect with researchers and academics from 50+ countries across 6 continents at every event.", 1));
            list.add(createWhyChooseItem("✅", "Expert Review Process", "Rigorous double-blind peer review by domain experts ensuring quality, integrity and academic standards.", 2));
            list.add(createWhyChooseItem("📚", "Publication Opportunities", "Fast-track publication in Scopus, Web of Science, and CrossRef indexed journals and proceedings.", 3));
            list.add(createWhyChooseItem("🤝", "Industry Collaboration", "Bridge academia and industry through strategic partnerships and innovation-focused symposiums.", 4));
            list.add(createWhyChooseItem("🏆", "Academic Excellence", "Recognized internationally for maintaining the highest standards in conference organization and proceedings.", 5));
            list.add(createWhyChooseItem("🔬", "Scientific Innovation", "Platform for cutting-edge discoveries across AI, healthcare, engineering, life sciences and more.", 6));
            whyChooseItemRepo.saveAll(list);
        }
        return list;
    }

    private AboutWhyChooseItem createWhyChooseItem(String icon, String title, String desc, int order) {
        AboutWhyChooseItem w = new AboutWhyChooseItem();
        w.setIcon(icon);
        w.setTitle(title);
        w.setDescription(desc);
        w.setDisplayOrder(order);
        return w;
    }

    // --- Partner Networks ---
    public List<AboutPartnerNetwork> getPartnerNetworks() {
        List<AboutPartnerNetwork> list = partnerNetworkRepo.findAllByOrderByDisplayOrderAsc();
        if (list.isEmpty()) {
            list = new ArrayList<>();
            list.add(createPartnerNetwork("IEEE", "ieee", 1));
            list.add(createPartnerNetwork("Springer Nature", "springer", 2));
            list.add(createPartnerNetwork("Elsevier", "elsevier", 3));
            list.add(createPartnerNetwork("CrossRef", "crossref", 4));
            list.add(createPartnerNetwork("Scopus", "scopus", 5));
            list.add(createPartnerNetwork("Google Scholar", "google", 6));
            partnerNetworkRepo.saveAll(list);
        }
        return list;
    }

    private AboutPartnerNetwork createPartnerNetwork(String name, String logo, int order) {
        AboutPartnerNetwork p = new AboutPartnerNetwork();
        p.setName(name);
        p.setLogoFileName(logo);
        p.setDisplayOrder(order);
        return p;
    }

    // --- Timeline Milestones ---
    public List<AboutTimelineMilestone> getTimelineMilestones() {
        List<AboutTimelineMilestone> list = timelineMilestoneRepo.findAllByOrderByDisplayOrderAsc();
        if (list.isEmpty()) {
            list = new ArrayList<>();
            list.add(createTimelineMilestone("2015", "Founded", "Research Endeavor incorporated with a mission to bring global researchers together through high-impact academic events.", "left", 1));
            list.add(createTimelineMilestone("2017", "First International Conference", "Hosted our inaugural international conference with delegates from 18 countries, establishing our commitment to quality.", "right", 2));
            list.add(createTimelineMilestone("2019", "Scopus Partnership", "Established formal indexing agreements with Elsevier's Scopus, ensuring all proceedings reach global academic databases.", "left", 3));
            list.add(createTimelineMilestone("2021", "100+ Conferences Milestone", "Crossed the landmark of 100 successfully organized conferences across three continents.", "right", 4));
            list.add(createTimelineMilestone("2023", "10,000+ Researcher Network", "Built a thriving community of over 10,000 researchers, scientists and academicians across 50+ countries.", "left", 5));
            list.add(createTimelineMilestone("2026", "Global Vision 2030", "Expanding to serve 200+ conferences annually and launch our open-access journal series.", "right", 6));
            timelineMilestoneRepo.saveAll(list);
        }
        return list;
    }

    private AboutTimelineMilestone createTimelineMilestone(String year, String title, String desc, String side, int order) {
        AboutTimelineMilestone m = new AboutTimelineMilestone();
        m.setYear(year);
        m.setTitle(title);
        m.setDescription(desc);
        m.setSide(side);
        m.setDisplayOrder(order);
        return m;
    }

    // --- Advisory Leaders ---
    public List<AboutAdvisoryLeader> getAdvisoryLeaders() {
        List<AboutAdvisoryLeader> list = advisoryLeaderRepo.findAllByOrderByDisplayOrderAsc();
        if (list.isEmpty()) {
            list = new ArrayList<>();
            list.add(createAdvisoryLeader("👩‍🔬", "Prof. Sarah Higgins", "Scientific Committee Chair", "University of Oxford", "United Kingdom", null, 
                "Over 20 years of academic experience in modern literature and academic editing. Leads scientific committee guidelines globally.", "https://linkedin.com/in/sarah-higgins-oxford", 1));
            list.add(createAdvisoryLeader("👨‍🏫", "Dr. Rajan Mehta", "Advisory Board Member", "IIT Bombay", "India", null, 
                "Distinguished researcher in computer science, robotics, and machine learning architectures with multiple IEEE publications.", "https://linkedin.com/in/rajan-mehta-iit", 2));
            list.add(createAdvisoryLeader("👩‍💼", "Prof. Maria Chen", "Publication Director", "MIT Cambridge", "USA", null, 
                "Specialist in publishing open-access research proceedings. Former editorial chief for leading technology research journals.", "https://linkedin.com/in/maria-chen-mit", 3));
            list.add(createAdvisoryLeader("👨‍🔬", "Dr. Ahmed Al-Farsi", "Peer Review Lead", "KAUST", "Saudi Arabia", null, 
                "Pioneers robust double-blind peer vetting frameworks. Coordinates international reviewer panel alignments.", "https://linkedin.com/in/ahmed-al-farsi-kaust", 4));
            list.add(createAdvisoryLeader("👩‍🏫", "Prof. Elena Vasquez", "Program Committee Head", "University of Madrid", "Spain", null, 
                "Focuses on curriculum development and academic program management. Leads Spain's computing coalition steering panel.", "https://linkedin.com/in/elena-vasquez-madrid", 5));
            list.add(createAdvisoryLeader("👨‍💻", "Dr. Lucas Hoffmann", "Technology & Innovation", "TU Munich", "Germany", null, 
                "Expert in digital innovation, online conference platforms, and semantic search algorithms for academic metadata indexing.", "https://linkedin.com/in/lucas-hoffmann-tum", 6));
            advisoryLeaderRepo.saveAll(list);
        }
        return list;
    }

    private AboutAdvisoryLeader createAdvisoryLeader(String emoji, String name, String role, String inst, String country, String photo, String bio, String linkedin, int order) {
        AboutAdvisoryLeader l = new AboutAdvisoryLeader();
        l.setEmoji(emoji);
        l.setName(name);
        l.setRole(role);
        l.setInstitution(inst);
        l.setCountry(country);
        l.setPhotoFileName(photo);
        l.setBio(bio);
        l.setLinkedin(linkedin);
        l.setDisplayOrder(order);
        return l;
    }

    // --- Map Locations ---
    public List<AboutMapLocation> getMapLocations() {
        List<AboutMapLocation> list = mapLocationRepo.findAll();
        if (list.isEmpty()) {
            list = new ArrayList<>();
            list.add(createMapLocation("San Jose, USA", 185, 155, true, "USA Office", "San Jose, California"));
            list.add(createMapLocation("Bangalore, India", 685, 230, true, "India Office", "Bangalore, Karnataka"));
            list.add(createMapLocation("Europe", 512, 125, false, null, null));
            list.add(createMapLocation("Asia Pacific", 820, 170, false, null, null));
            mapLocationRepo.saveAll(list);
        }
        return list;
    }

    private AboutMapLocation createMapLocation(String name, int x, int y, boolean isOffice, String ot, String oa) {
        AboutMapLocation loc = new AboutMapLocation();
        loc.setName(name);
        loc.setX(x);
        loc.setY(y);
        loc.setIsOffice(isOffice);
        loc.setOfficeTitle(ot);
        loc.setOfficeAddress(oa);
        return loc;
    }

    // --- Map Connections ---
    public List<AboutMapConnection> getMapConnections() {
        List<AboutMapConnection> list = mapConnectionRepo.findAll();
        if (list.isEmpty()) {
            list = new ArrayList<>();
            list.add(createMapConnection(185, 155, 500, 60, 685, 230, 0.5, "8 5"));
            list.add(createMapConnection(685, 230, 900, 160, 820, 165, 0.35, "6 5"));
            list.add(createMapConnection(510, 135, 580, 120, 685, 230, 0.4, "6 5"));
            list.add(createMapConnection(185, 155, 340, 250, 265, 280, 0.25, "6 5"));
            mapConnectionRepo.saveAll(list);
        }
        return list;
    }

    private AboutMapConnection createMapConnection(int sx, int sy, int cx, int cy, int ex, int ey, double opacity, String dash) {
        AboutMapConnection conn = new AboutMapConnection();
        conn.setStartX(sx);
        conn.setStartY(sy);
        conn.setControlX(cx);
        conn.setControlY(cy);
        conn.setEndX(ex);
        conn.setEndY(ey);
        conn.setOpacity(opacity);
        conn.setDashArray(dash);
        return conn;
    }

    // Consolidated Data Retrieval
    public Map<String, Object> getConsolidatedAboutData() {
        Map<String, Object> data = new HashMap<>();
        data.put("section", getAboutUsSection());
        data.put("features", getOverviewFeatures());
        data.put("services", getServiceItems());
        data.put("whyChoose", getWhyChooseItems());
        data.put("partners", getPartnerNetworks());
        data.put("milestones", getTimelineMilestones());
        data.put("leaders", getAdvisoryLeaders());
        data.put("locations", getMapLocations());
        data.put("connections", getMapConnections());
        return data;
    }
}
