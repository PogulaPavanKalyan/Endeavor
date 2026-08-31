package com.endeavor.service;

import com.endeavor.entity.*;
import com.endeavor.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AboutUsService {

    @Autowired(required = false)
    private AboutUsSectionRepo sectionRepo;

    @Autowired(required = false)
    private AboutOverviewFeatureRepo overviewFeatureRepo;

    @Autowired(required = false)
    private AboutServiceItemRepo serviceItemRepo;

    @Autowired(required = false)
    private AboutWhyChooseItemRepo whyChooseItemRepo;

    @Autowired(required = false)
    private AboutPartnerNetworkRepo partnerNetworkRepo;

    @Autowired(required = false)
    private AboutTimelineMilestoneRepo timelineMilestoneRepo;

    @Autowired(required = false)
    private AboutAdvisoryLeaderRepo advisoryLeaderRepo;

    @Autowired(required = false)
    private AboutMapLocationRepo mapLocationRepo;

    @Autowired(required = false)
    private AboutMapConnectionRepo mapConnectionRepo;

    // --- AboutUsSection (Single Config) ---
    public AboutUsSection getAboutUsSection() {
        if (sectionRepo != null) {
            try {
                Optional<AboutUsSection> sectionOpt = sectionRepo.findById(1L);
                if (sectionOpt.isPresent()) {
                    return sectionOpt.get();
                }
            } catch (Exception e) {
                System.err.println("Notice: Could not read AboutUsSection from DB: " + e.getMessage());
            }
        }

        // Return default static content if DB is empty
        AboutUsSection s = new AboutUsSection();
        s.setId(1L);
        s.setHeroBadge("About Intelevo Research");
        s.setHeroTitle("Connecting Global\nResearch Communities");
        s.setHeroDescription("Intelevo Research brings together researchers, academicians, industry experts and innovators through international conferences, publications and scientific networking across 50+ countries worldwide.");
        s.setHeroCtaText1("🏛️ Explore Conferences");
        s.setHeroCtaLink1("/conferences");
        s.setHeroCtaText2("Submit Abstract →");
        s.setHeroCtaLink2("/submit-abstract");
        s.setHeroBgImage("https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1800&q=90");

        s.setOverviewLabel("About Organization");
        s.setOverviewTitle("Empowering Global Scientific Discovery");
        s.setOverviewLead("Intelevo Research acts as a pivotal axis connecting international experts, ideas, and publication pathways across 50+ countries.");
        s.setOverviewBody("We focus on building international communities by organizing double-blind peer-reviewed conferences, workshops, and dynamic webinars. Through strategic indexing relationships, we ensure the dissemination of accepted abstracts inside recognized global proceedings.");
        s.setOverviewImage1("https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80");
        s.setOverviewImage2("https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=600&q=80");
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

        return s;
    }

    @Transactional
    public AboutUsSection saveAboutUsSection(AboutUsSection incoming) {
        if (sectionRepo == null) return incoming;
        try {
            AboutUsSection target = sectionRepo.findById(1L).orElse(new AboutUsSection());
            target.setId(1L);
            if (incoming.getHeroBadge() != null) target.setHeroBadge(incoming.getHeroBadge());
            if (incoming.getHeroTitle() != null) target.setHeroTitle(incoming.getHeroTitle());
            if (incoming.getHeroDescription() != null) target.setHeroDescription(incoming.getHeroDescription());
            if (incoming.getHeroCtaText1() != null) target.setHeroCtaText1(incoming.getHeroCtaText1());
            if (incoming.getHeroCtaLink1() != null) target.setHeroCtaLink1(incoming.getHeroCtaLink1());
            if (incoming.getHeroCtaText2() != null) target.setHeroCtaText2(incoming.getHeroCtaText2());
            if (incoming.getHeroCtaLink2() != null) target.setHeroCtaLink2(incoming.getHeroCtaLink2());
            if (incoming.getHeroBgImage() != null) target.setHeroBgImage(incoming.getHeroBgImage());

            if (incoming.getOverviewLabel() != null) target.setOverviewLabel(incoming.getOverviewLabel());
            if (incoming.getOverviewTitle() != null) target.setOverviewTitle(incoming.getOverviewTitle());
            if (incoming.getOverviewLead() != null) target.setOverviewLead(incoming.getOverviewLead());
            if (incoming.getOverviewBody() != null) target.setOverviewBody(incoming.getOverviewBody());
            if (incoming.getOverviewImage1() != null) target.setOverviewImage1(incoming.getOverviewImage1());
            if (incoming.getOverviewImage2() != null) target.setOverviewImage2(incoming.getOverviewImage2());
            if (incoming.getOverviewBadgeIcon() != null) target.setOverviewBadgeIcon(incoming.getOverviewBadgeIcon());
            if (incoming.getOverviewBadgeTitle() != null) target.setOverviewBadgeTitle(incoming.getOverviewBadgeTitle());
            if (incoming.getOverviewBadgeText() != null) target.setOverviewBadgeText(incoming.getOverviewBadgeText());

            if (incoming.getMissionTitle() != null) target.setMissionTitle(incoming.getMissionTitle());
            if (incoming.getMissionDesc() != null) target.setMissionDesc(incoming.getMissionDesc());
            if (incoming.getMissionPoints() != null) target.setMissionPoints(incoming.getMissionPoints());
            if (incoming.getVisionTitle() != null) target.setVisionTitle(incoming.getVisionTitle());
            if (incoming.getVisionDesc() != null) target.setVisionDesc(incoming.getVisionDesc());
            if (incoming.getVisionPoints() != null) target.setVisionPoints(incoming.getVisionPoints());

            if (incoming.getStatConferences() != null) target.setStatConferences(incoming.getStatConferences());
            if (incoming.getStatResearchers() != null) target.setStatResearchers(incoming.getStatResearchers());
            if (incoming.getStatCountries() != null) target.setStatCountries(incoming.getStatCountries());
            if (incoming.getStatPublications() != null) target.setStatPublications(incoming.getStatPublications());
            if (incoming.getStatSpeakers() != null) target.setStatSpeakers(incoming.getStatSpeakers());
            if (incoming.getStatSatisfaction() != null) target.setStatSatisfaction(incoming.getStatSatisfaction());

            if (incoming.getCtaTitle() != null) target.setCtaTitle(incoming.getCtaTitle());
            if (incoming.getCtaDesc() != null) target.setCtaDesc(incoming.getCtaDesc());
            if (incoming.getCtaButton1Text() != null) target.setCtaButton1Text(incoming.getCtaButton1Text());
            if (incoming.getCtaButton1Link() != null) target.setCtaButton1Link(incoming.getCtaButton1Link());
            if (incoming.getCtaButton2Text() != null) target.setCtaButton2Text(incoming.getCtaButton2Text());
            if (incoming.getCtaButton2Link() != null) target.setCtaButton2Link(incoming.getCtaButton2Link());

            return sectionRepo.save(target);
        } catch (Exception e) {
            System.err.println("Error saving AboutUsSection: " + e.getMessage());
            e.printStackTrace();
            return incoming;
        }
    }

    // --- Overview Features ---
    public List<AboutOverviewFeature> getOverviewFeatures() {
        if (overviewFeatureRepo != null) {
            try {
                List<AboutOverviewFeature> list = overviewFeatureRepo.findAllByOrderByDisplayOrderAsc();
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("Notice: Error reading OverviewFeatures: " + e.getMessage());
            }
        }
        List<AboutOverviewFeature> list = new ArrayList<>();
        list.add(createOverviewFeature("Global Dissemination", "Fast-tracking proceedings publication through Scopus channels.", 1));
        list.add(createOverviewFeature("Rigorous Peer Assessment", "Supervised by distinguished steering boards and domain committees.", 2));
        list.add(createOverviewFeature("International Recognition", "Indexed by Scopus, Web of Science, CrossRef, and Google Scholar.", 3));
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
        if (serviceItemRepo != null) {
            try {
                List<AboutServiceItem> list = serviceItemRepo.findAllByOrderByDisplayOrderAsc();
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("Notice: Error reading ServiceItems: " + e.getMessage());
            }
        }
        List<AboutServiceItem> list = new ArrayList<>();
        list.add(createServiceItem("🏛️", "International Conferences", "Orchestrating high-impact global assemblies across STEM and medical disciplines.", "Core Focus", 1));
        list.add(createServiceItem("💻", "Virtual Scientific Webinars", "Connecting researchers across borders through high-definition interactive symposia.", "Online", 2));
        list.add(createServiceItem("📚", "Proceedings & Publications", "Ensuring accepted abstracts are indexed with major scientific indexing databases.", "Publishing", 3));
        list.add(createServiceItem("🤝", "Academic Collaborations", "Bridging international faculty, research labs, and early-career investigators.", "Networking", 4));
        return list;
    }

    private AboutServiceItem createServiceItem(String icon, String title, String desc, String tag, int order) {
        AboutServiceItem item = new AboutServiceItem();
        item.setIcon(icon);
        item.setTitle(title);
        item.setDescription(desc);
        item.setTag(tag);
        item.setDisplayOrder(order);
        item.setIsActive(true);
        return item;
    }

    @Transactional
    public AboutServiceItem saveServiceItem(AboutServiceItem item) {
        return serviceItemRepo != null ? serviceItemRepo.save(item) : item;
    }

    @Transactional
    public void deleteServiceItem(Long id) {
        if (serviceItemRepo != null) serviceItemRepo.deleteById(id);
    }

    // --- Why Choose Items ---
    public List<AboutWhyChooseItem> getWhyChooseItems() {
        if (whyChooseItemRepo != null) {
            try {
                List<AboutWhyChooseItem> list = whyChooseItemRepo.findAllByOrderByDisplayOrderAsc();
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("Notice: Error reading WhyChooseItems: " + e.getMessage());
            }
        }
        List<AboutWhyChooseItem> list = new ArrayList<>();
        list.add(createWhyChooseItem("🌐", "Global Reach & Diversity", "Delegates and speakers from over 50+ countries representing top institutions.", 1));
        list.add(createWhyChooseItem("🔬", "Rigorous Peer Review", "Ensuring the highest scientific standard and constructive feedback for all submissions.", 2));
        list.add(createWhyChooseItem("📖", "Indexed Publications", "Strategic partnerships for fast-track indexing in Scopus and Web of Science.", 3));
        list.add(createWhyChooseItem("💡", "Cross-Disciplinary Synergy", "Fostering partnerships at the intersection of engineering, medicine, and technology.", 4));
        return list;
    }

    private AboutWhyChooseItem createWhyChooseItem(String icon, String title, String desc, int order) {
        AboutWhyChooseItem item = new AboutWhyChooseItem();
        item.setIcon(icon);
        item.setTitle(title);
        item.setDescription(desc);
        item.setDisplayOrder(order);
        return item;
    }

    @Transactional
    public AboutWhyChooseItem saveWhyChooseItem(AboutWhyChooseItem item) {
        return whyChooseItemRepo != null ? whyChooseItemRepo.save(item) : item;
    }

    @Transactional
    public void deleteWhyChooseItem(Long id) {
        if (whyChooseItemRepo != null) whyChooseItemRepo.deleteById(id);
    }

    // --- Partner Networks ---
    public List<AboutPartnerNetwork> getPartnerNetworks() {
        if (partnerNetworkRepo != null) {
            try {
                List<AboutPartnerNetwork> list = partnerNetworkRepo.findAllByOrderByDisplayOrderAsc();
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("Notice: Error reading PartnerNetworks: " + e.getMessage());
            }
        }
        List<AboutPartnerNetwork> list = new ArrayList<>();
        list.add(createPartner("IEEE Technical Chapter", "Technical Co-Sponsor", 1));
        list.add(createPartner("Scopus Indexed Journals", "Publication Partner", 2));
        list.add(createPartner("Global Science Network", "Academic Alliance", 3));
        list.add(createPartner("Springer Proceedings", "Indexing Partner", 4));
        return list;
    }

    private AboutPartnerNetwork createPartner(String name, String type, int order) {
        AboutPartnerNetwork p = new AboutPartnerNetwork();
        p.setName(name);
        p.setType(type);
        p.setDisplayOrder(order);
        return p;
    }

    // --- Timeline Milestones ---
    public List<AboutTimelineMilestone> getTimelineMilestones() {
        if (timelineMilestoneRepo != null) {
            try {
                List<AboutTimelineMilestone> list = timelineMilestoneRepo.findAllByOrderByDisplayOrderAsc();
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("Notice: Error reading TimelineMilestones: " + e.getMessage());
            }
        }
        List<AboutTimelineMilestone> list = new ArrayList<>();
        list.add(createMilestone("2015", "Founding", "Established to promote cross-border scientific communication.", 1));
        list.add(createMilestone("2018", "50+ Global Summits", "Expanded congress portfolio into international destinations.", 2));
        list.add(createMilestone("2021", "Digital Transformation", "Pioneered virtual symposiums connecting 10,000+ delegates.", 3));
        list.add(createMilestone("2026", "Global Innovation Hub", "Organizing 200+ hybrid assemblies across 50+ countries.", 4));
        return list;
    }

    private AboutTimelineMilestone createMilestone(String year, String title, String desc, int order) {
        AboutTimelineMilestone m = new AboutTimelineMilestone();
        m.setYear(year);
        m.setTitle(title);
        m.setDescription(desc);
        m.setDisplayOrder(order);
        return m;
    }

    // --- Advisory Leaders ---
    public List<AboutAdvisoryLeader> getAdvisoryLeaders() {
        if (advisoryLeaderRepo != null) {
            try {
                List<AboutAdvisoryLeader> list = advisoryLeaderRepo.findAllByOrderByDisplayOrderAsc();
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("Notice: Error reading AdvisoryLeaders: " + e.getMessage());
            }
        }
        List<AboutAdvisoryLeader> list = new ArrayList<>();
        list.add(createLeader("Dr. Alexander Wright", "Scientific Advisory Chair", "Stanford University", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", 1));
        list.add(createLeader("Prof. Elena Rostova", "Steering Committee Lead", "Oxford University", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", 2));
        list.add(createLeader("Dr. Kenji Tanaka", "Publication Quality Director", "University of Tokyo", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", 3));
        return list;
    }

    private AboutAdvisoryLeader createLeader(String name, String role, String affiliation, String photo, int order) {
        AboutAdvisoryLeader l = new AboutAdvisoryLeader();
        l.setName(name);
        l.setRole(role);
        l.setAffiliation(affiliation);
        l.setPhoto(photo);
        l.setDisplayOrder(order);
        return l;
    }

    // --- Map Locations ---
    public List<AboutMapLocation> getMapLocations() {
        if (mapLocationRepo != null) {
            try {
                List<AboutMapLocation> list = mapLocationRepo.findAll();
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("Notice: Error reading MapLocations: " + e.getMessage());
            }
        }
        List<AboutMapLocation> list = new ArrayList<>();
        list.add(createMapLocation("San Jose, USA", 185, 155, true, "USA Office", "San Jose, California"));
        list.add(createMapLocation("Bangalore, India", 685, 230, true, "India Office", "Bangalore, Karnataka"));
        list.add(createMapLocation("Europe", 512, 125, false, null, null));
        list.add(createMapLocation("Asia Pacific", 820, 170, false, null, null));
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
        if (mapConnectionRepo != null) {
            try {
                List<AboutMapConnection> list = mapConnectionRepo.findAll();
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception e) {
                System.err.println("Notice: Error reading MapConnections: " + e.getMessage());
            }
        }
        List<AboutMapConnection> list = new ArrayList<>();
        list.add(createMapConnection(185, 155, 500, 60, 685, 230, 0.5, "8 5"));
        list.add(createMapConnection(685, 230, 900, 160, 820, 165, 0.35, "6 5"));
        list.add(createMapConnection(510, 135, 580, 120, 685, 230, 0.4, "6 5"));
        list.add(createMapConnection(185, 155, 340, 250, 265, 280, 0.25, "6 5"));
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
        try {
            data.put("section", getAboutUsSection());
        } catch (Exception e) {
            data.put("section", new AboutUsSection());
        }
        try {
            data.put("features", getOverviewFeatures());
        } catch (Exception e) {
            data.put("features", Collections.emptyList());
        }
        try {
            data.put("services", getServiceItems());
        } catch (Exception e) {
            data.put("services", Collections.emptyList());
        }
        try {
            data.put("whyChoose", getWhyChooseItems());
        } catch (Exception e) {
            data.put("whyChoose", Collections.emptyList());
        }
        try {
            data.put("partners", getPartnerNetworks());
        } catch (Exception e) {
            data.put("partners", Collections.emptyList());
        }
        try {
            data.put("milestones", getTimelineMilestones());
        } catch (Exception e) {
            data.put("milestones", Collections.emptyList());
        }
        try {
            data.put("leaders", getAdvisoryLeaders());
        } catch (Exception e) {
            data.put("leaders", Collections.emptyList());
        }
        try {
            data.put("locations", getMapLocations());
        } catch (Exception e) {
            data.put("locations", Collections.emptyList());
        }
        try {
            data.put("connections", getMapConnections());
        } catch (Exception e) {
            data.put("connections", Collections.emptyList());
        }
        return data;
    }
}
