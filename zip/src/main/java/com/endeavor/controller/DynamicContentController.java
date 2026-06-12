package com.endeavor.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175"
})
public class DynamicContentController {

    @GetMapping("/homepage-dynamic-data")
    public ResponseEntity<Map<String, Object>> getHomepageDynamicData() {
        Map<String, Object> data = new HashMap<>();

        // 1. About Organization Details
        Map<String, Object> about = new HashMap<>();
        about.put("title", "Empowering Global Scientific Discovery");
        about.put("tag", "About Organization");
        about.put("description", "Research Endeavor acts as a pivotal axis connecting international experts, ideas, and publication pathways.");

        List<Map<String, String>> pillars = new ArrayList<>();
        pillars.add(createPillar("👤", "Who We Are", "Endeavor Conferences brings together academicians, researchers, and engineers worldwide to exchange discoveries."));
        pillars.add(createPillar("🎯", "What We Do", "We build communities through high-quality international meetings, workshops, virtual webinars, and proceedings."));
        pillars.add(createPillar("💡", "Why Choose Us", "Exceptional global networking, robust abstract review, and guaranteed distribution through indexed media channels."));
        about.put("pillars", pillars);

        Map<String, Map<String, Object>> tabs = new HashMap<>();
        tabs.put("about", createTab("About Company", 
            "Research Endeavor is the scientific perseverance and so is the learning. Scientific Events are not just limited to discussion, but to connect people with people, people with ideas, and people with opportunities. Endeavor Research is one of the innovative organizers of webinars, conferences, workshops and exhibitions. Our webinars and conferences provide a great platform to share scientific research among the attendees turning up round the globe.",
            List.of("https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80", 
                    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80")
        ));
        tabs.put("scientific", createTab("Scientific Endeavor", 
            "The very cognizance of How, What, Why, When, Where has been at the core of scientific endeavor, and has been the forefront in understanding the needs and creating developments which have improved life on Earth in boundless manners. Presently, life on this planet is confronting new difficulties from both nature and the constructed world, and logical application is our best instrument with which to respond. Science is a worldwide undertaking and we as researchers have the responsibility to make meetings more reasonable, and open to thoughtful analysis and experts.",
            List.of("https://images.unsplash.com/photo-1579389083046-7c64c784dc24?auto=format&fit=crop&w=800&q=80", 
                    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80")
        ));
        tabs.put("meeting", createTab("Meeting Endeavor", 
            "The very conscience of explore-get-explored and connect in an inexorably interconnected world encouraged by innovative progressions in correspondence, choices have been investigated to supplant the in-person experience that is unreachable for some experts, and ideal occasion to change logical gatherings. Webinars and Video-and virtual-conferencing of talks can significantly upgrade gathering openness and improve the experience and interaction.",
            List.of("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80", 
                    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80")
        ));
        tabs.put("services", createTab("Our Services", 
            "We provide a comprehensive range of services tailored to the global scientific community. Conferences: Organizing global summits and international meetings. Webinars: Interactive virtual sessions with industry leaders. Workshops: Hands-on training and skill development. Exhibitions: Showcasing the latest technological advancements in key sectors.",
            List.of("https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80", 
                    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80")
        ));
        about.put("tabs", tabs);
        data.put("about", about);

        // 2. Fields of Study (Categories)
        List<Map<String, String>> categories = new ArrayList<>();
        categories.add(createCategory("🤖", "AI & Machine Learning", "Artificial intelligence architectures, networks, and neural compute paradigms.", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"));
        categories.add(createCategory("🏥", "Healthcare & Medicine", "Biomedical engineering breakthroughs, diagnostics, and modern healthcare.", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"));
        categories.add(createCategory("⚙️", "Engineering", "Mechanical, electrical, structural systems and advanced computational materials.", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"));
        categories.add(createCategory("🌿", "Food Science", "Nutritional engineering, agricultural stability, and global supply chains.", "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=600&q=80"));
        categories.add(createCategory("🧬", "Biotechnology", "Genomic structures synthesis, protein engineering, and chemical linkages.", "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80"));
        categories.add(createCategory("📊", "Data Science", "Statistical data modelling, predictive modeling pipelines, and quantum compute.", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"));
        categories.add(createCategory("💼", "Business Management", "Corporate strategy, global market dynamics, and technological disruptions.", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"));
        categories.add(createCategory("🎓", "Education", "Virtual learning ecosystems, computational pedagogy, and academic platforms.", "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80"));
        data.put("categories", categories);

        // 3. Past Conferences
        List<Map<String, Object>> pastConferences = new ArrayList<>();
        pastConferences.add(createPastConference("past-1", "2nd International Conference on Food Science & Nutrition", "July 12 to July 14, 2025", "Paris, France", "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80", "350+ Scholars", "32 represented"));
        pastConferences.add(createPastConference("past-2", "1st Global Congress on Medical and Health Innovations", "Sept 18 to Sept 20, 2025", "Geneva, Switzerland", "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80", "500+ Delegates", "45 represented"));
        pastConferences.add(createPastConference("past-3", "International Symposium on Quantum Engineering Solutions", "Oct 10 to Oct 12, 2024", "Tokyo, Japan", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", "280+ Presenters", "28 represented"));
        data.put("pastConferences", pastConferences);

        // 4. Programs Timeline
        Map<String, List<Map<String, Object>>> timeline = new HashMap<>();
        timeline.put("day1", List.of(
            createSession(101, "Registration, Credentials Collection & Welcome Coffee", "08:30 AM - 09:30 AM", "Steering Committee", "Endeavor Board", "Attendees sign in and collect validation badges, folders, and conference catalogs."),
            createSession(102, "Official Opening Remarks & Plenary Keynote Address", "09:30 AM - 10:45 AM", "Dr. Andrea Miller", "University of Valencia", "Discussing agricultural stability, food security challenges, and technological adaptation."),
            createSession(103, "Track Session 01: Artificial Intelligence & Edge Paradigms", "11:00 AM - 01:00 PM", "Oral Presenters", "Track Chairs", "Presentations of accepted abstracts regarding deep learning models and diagnostics."),
            createSession(104, "Networking Lunch & Poster Presentation Walk", "01:00 PM - 02:00 PM", "All Attendees", "Exhibition Hall", "Interactions and evaluations of poster boards displayed in the main lobby.")
        ));
        timeline.put("day2", List.of(
            createSession(201, "Keynote Address: Genomes and Bio-Chemical Synthesis", "09:00 AM - 10:15 AM", "Prof. Sarah Higgins", "University of Oxford", "Frontiers in protein engineering, structural analysis, and genomic editing capabilities."),
            createSession(202, "Track Session 02: Computational Engineering & Materials", "10:30 AM - 12:30 PM", "Research Presenters", "Review Panel", "Papers on advanced structural modeling, quantum compute, and alloy stress-loads."),
            createSession(203, "Academic Panel: International Funding & Grants Review", "01:30 PM - 03:00 PM", "Steering Panel", "Global Advisory Board", "Discussing collaborative project opportunities, EU grants, and international joint projects.")
        ));
        timeline.put("day3", List.of(
            createSession(301, "Keynote Address: Decarbonizing Energy Topologies", "09:30 AM - 10:45 AM", "Dr. Claire Dupont", "Energy Research Lab", "Microgrid designs, renewable storage limits, and smart load-balancing strategies."),
            createSession(302, "Track Session 03: Business Strategy & Digitization", "11:00 AM - 01:00 PM", "Oral Presenters", "Session Coordinator", "Managing corporate strategy transitions and next-gen agility methodologies."),
            createSession(303, "Steering Awards Ceremony & Closing Valedictory Session", "02:00 PM - 03:30 PM", "Host Committee", "Academic Panel", "Distributing 'Best Paper Awards' and announcing the venue for the next edition.")
        ));
        data.put("timeline", timeline);

        // 5. Committee Members
        List<Map<String, String>> committee = new ArrayList<>();
        committee.add(createCommitteeMember("Prof. Sarah Higgins", "Scientific Committee Chair", "University of Oxford", "UK", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80"));
        committee.add(createCommitteeMember("Dr. Kenji Sato", "Steering Board Advisor", "Tokyo Institute of Technology", "Japan", "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80"));
        committee.add(createCommitteeMember("Dr. Andrea Miller", "Technical Panel Coordinator", "University of Valencia", "Spain", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80"));
        committee.add(createCommitteeMember("Prof. Alan Vance", "Research Publication Lead", "CERN Particle Accelerator", "Switzerland", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80"));
        committee.add(createCommitteeMember("Dr. Marcus Thorne", "Neuroscience Section Head", "Stanford University", "USA", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80"));
        committee.add(createCommitteeMember("Dr. Claire Dupont", "Grid Topologies Coordinator", "Energy Research Lab", "France", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80"));
        committee.add(createCommitteeMember("Prof. Charles Watson", "Educational Pedagogy Advisor", "Cambridge University", "UK", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80"));
        committee.add(createCommitteeMember("Dr. Li Wei", "Machine Intelligence Expert", "National University of Singapore", "Singapore", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80"));
        data.put("committee", committee);

        // 6. Publication Pathways
        List<Map<String, String>> publications = new ArrayList<>();
        publications.add(createPublicationPathway("Scopus Proceedings", "Proceedings volumes carrying standard ISBN numbers and DOI links, submitted for full Scopus indexing.", "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80", "regular"));
        publications.add(createPublicationPathway("ESCI & WoS Journals", "Expanded research works are fast-tracked for publication inside partner Web of Science and ESCI journals.", "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80", "featured"));
        publications.add(createPublicationPathway("Open Access Portals", "Indexed inside Google Scholar, DOAJ, and digital repositories for maximum citation and visibility.", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80", "regular"));
        data.put("publications", publications);

        // 7. Associated Journals
        List<Map<String, String>> journals = new ArrayList<>();
        journals.add(createJournal("International Journal of Food Sciences", "Endeavor Publications Group", "4.8", "ISSN 2643-9821", "Scopus, Web of Science, Google Scholar"));
        journals.add(createJournal("Global Medical & Health Review", "Scientific Press International", "5.2", "ISSN 2981-0043", "ESCI, PubMed Direct Link, Scopus"));
        journals.add(createJournal("Advanced Engineering & Tech Journal", "Academic Research Networks", "4.5", "ISSN 2544-7721", "DOAJ, Google Scholar, Web of Science"));
        data.put("journals", journals);

        // 8. Webinars Catalog
        List<Map<String, Object>> webinars = new ArrayList<>();
        webinars.add(createWebinar(1, "AI & Machine Learning in Modern Healthcare", "Dr. Sarah Lee (MIT)", "Jun 25, 2026", "14:00 GMT", "upcoming", "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=600&q=80", "Explore the diagnostic capabilities of advanced deep neural models and their role in standard patient care pipelines."));
        webinars.add(createWebinar(2, "Data Science Futures: Quantum Processing", "Prof. Alan Vance (CERN)", "Jun 28, 2026", "10:00 GMT", "upcoming", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80", "An inquiry into quantum compute acceleration and standard algorithm refactoring for large-scale physics research."));
        webinars.add(createWebinar(3, "Business & Digital Transformation 2026", "Elena Rostova (McKinsey)", "Jun 30, 2026", "16:00 GMT", "live", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", "Managing corporate strategy transitions, distributed cloud services migrations, and next-gen agility methodologies."));
        webinars.add(createWebinar(4, "Frontiers in Cognitive Neuroscience", "Dr. Marcus Thorne (Stanford)", "Jul 05, 2026", "11:00 GMT", "upcoming", "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=600&q=80", "Synaptic plastic mappings, sensory encoding layers, and prosthetic neural linkages interfaces."));
        webinars.add(createWebinar(5, "Decarbonizing the Global Energy Grid", "Dr. Claire Dupont (Energy Lab)", "Jul 12, 2026", "09:00 GMT", "live", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80", "Analyzing high-voltage storage capabilities, distributed microgrid topologies, and smart load-balancing strategies."));
        data.put("webinars", webinars);

        // 9. Critical Research Areas with Sub-Tracks
        List<Map<String, Object>> researchAreas = new ArrayList<>();
        researchAreas.add(createResearchArea("🧬", "Genetics & Bio-Tech", "Protein linkage mapping, bio-informatics analysis, and genomic editing models.", "https://images.unsplash.com/photo-1530026405186-ed1ea0007b2c?auto=format&fit=crop&w=600&q=80", List.of("CRISPR Cas-9 Models", "Enzymatic Engineering", "Genomic Sequencing")));
        researchAreas.add(createResearchArea("🤖", "Machine Intelligence", "Deep neural networks, computer vision, edge-computing chips, and semantic parsing.", "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80", List.of("Neural Architecture Search", "Natural Language Processing", "Edge-AI System Integration")));
        researchAreas.add(createResearchArea("⚡", "Renewable Infrastructures", "Solid-state storage cells, distributed smart loads, and grid synchronization topologies.", "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80", List.of("Microgrid Storage Optimization", "High-Voltage Synchronization", "Solar Conversion Yield")));
        researchAreas.add(createResearchArea("🏥", "Clinical Diagnostics", "Advanced patient diagnostic models, computer-aided radiology, and clinical data pipelines.", "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?auto=format&fit=crop&w=600&q=80", List.of("Deep Tumor Localization", "Radiological Data Structuring", "EHR Interoperability")));
        researchAreas.add(createResearchArea("⚙️", "Advanced Computational Engineering", "Finite element analysis, mechanical system stress models, and quantum structural compute.", "https://images.unsplash.com/photo-1581092162384-86872662870c?auto=format&fit=crop&w=600&q=80", List.of("Alloy Fatigue Estimation", "Structural Fluid Dynamics", "Vibration Isolation Physics")));
        researchAreas.add(createResearchArea("💼", "Digital Transformation & Business Strategy", "Enterprise cloud structures, distributed team workflows, and next-gen market disruptions.", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", List.of("Distributed Cloud Architecture", "Corporate Agility Methodologies", "Fintech Disruptive Channels")));
        data.put("researchAreas", researchAreas);

        // 10. Large Gallery Section
        List<Map<String, String>> gallery = new ArrayList<>();
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80", "auditorium"));
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80", "auditorium"));
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80", "networking"));
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80", "networking"));
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80", "networking"));
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80", "awards"));
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1544531584-a4ee566763aa?auto=format&fit=crop&w=600&q=80", "awards"));
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", "awards"));
        gallery.add(createGalleryItem("https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&w=600&q=80", "auditorium"));
        data.put("gallery", gallery);

        // 11. News Section
        List<Map<String, String>> news = new ArrayList<>();
        news.add(createNewsArticle("Special Abstract Submission Deadline Extended", "Deadlines", "June 10, 2026", "Due to high volume requests, the abstract review board has extended the oral presentation submission cutoff for Spain events.", "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80"));
        news.add(createNewsArticle("Scopus indexation confirmed for all 2026 Proceedings", "Indexation", "June 05, 2026", "All papers presented in our upcoming academic congresses are pre-approved for indexing inside Elsevier digital database.", "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80"));
        news.add(createNewsArticle("Webinar Series: Machine Learning in Genomics added", "Announcements", "May 28, 2026", "A new virtual lecture led by MIT computational genetics group has been appended to the schedule for next month.", "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80"));
        data.put("news", news);

        // 12. Call for Abstracts
        Map<String, Object> callForAbstracts = new HashMap<>();
        callForAbstracts.put("title", "Share Your Innovations Internationally");
        callForAbstracts.put("badge", "Call For Abstracts 2026");
        callForAbstracts.put("description", "Submitting your proposal to Endeavor Conferences is streamlined. Authors must register, upload a short draft abstract (word/pdf format), and select their target research category.");
        callForAbstracts.put("image", "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80");
        data.put("callForAbstracts", callForAbstracts);

        return ResponseEntity.ok(data);
    }

    private Map<String, String> createPillar(String icon, String title, String desc) {
        Map<String, String> p = new HashMap<>();
        p.put("icon", icon);
        p.put("title", title);
        p.put("desc", desc);
        return p;
    }

    private Map<String, Object> createTab(String title, String text, List<String> images) {
        Map<String, Object> t = new HashMap<>();
        t.put("title", title);
        t.put("text", text);
        t.put("images", images);
        return t;
    }

    private Map<String, String> createCategory(String icon, String label, String desc, String image) {
        Map<String, String> c = new HashMap<>();
        c.put("icon", icon);
        c.put("label", label);
        c.put("desc", desc);
        c.put("image", image);
        return c;
    }

    private Map<String, Object> createPastConference(String id, String title, String date, String venue, String image, String attendees, String countries) {
        Map<String, Object> pc = new HashMap<>();
        pc.put("id", id);
        pc.put("title", title);
        pc.put("date", date);
        pc.put("venue", venue);
        pc.put("image", image);
        pc.put("attendees", attendees);
        pc.put("countries", countries);
        return pc;
    }

    private Map<String, Object> createSession(int id, String name, String timeRange, String speakerName, String affiliation, String description) {
        Map<String, Object> s = new HashMap<>();
        s.put("id", id);
        s.put("name", name);
        s.put("timeRange", timeRange);
        s.put("speakerName", speakerName);
        s.put("affiliation", affiliation);
        s.put("description", description);
        return s;
    }

    private Map<String, String> createCommitteeMember(String name, String role, String institution, String country, String photo) {
        Map<String, String> cm = new HashMap<>();
        cm.put("name", name);
        cm.put("role", role);
        cm.put("institution", institution);
        cm.put("country", country);
        cm.put("photo", photo);
        return cm;
    }

    private Map<String, String> createPublicationPathway(String title, String description, String image, String type) {
        Map<String, String> p = new HashMap<>();
        p.put("title", title);
        p.put("description", description);
        p.put("image", image);
        p.put("type", type);
        return p;
    }

    private Map<String, String> createJournal(String name, String publisher, String impact, String issn, String indexing) {
        Map<String, String> j = new HashMap<>();
        j.put("name", name);
        j.put("publisher", publisher);
        j.put("impact", impact);
        j.put("issn", issn);
        j.put("indexing", indexing);
        return j;
    }

    private Map<String, Object> createWebinar(int id, String title, String speaker, String date, String time, String status, String image, String desc) {
        Map<String, Object> w = new HashMap<>();
        w.put("id", id);
        w.put("title", title);
        w.put("speaker", speaker);
        w.put("date", date);
        w.put("time", time);
        w.put("status", status);
        w.put("image", image);
        w.put("desc", desc);
        return w;
    }

    private Map<String, Object> createResearchArea(String icon, String label, String desc, String image, List<String> tracks) {
        Map<String, Object> ra = new HashMap<>();
        ra.put("icon", icon);
        ra.put("label", label);
        ra.put("desc", desc);
        ra.put("image", image);
        ra.put("tracks", tracks);
        return ra;
    }

    private Map<String, String> createGalleryItem(String url, String tag) {
        Map<String, String> gi = new HashMap<>();
        gi.put("url", url);
        gi.put("tag", tag);
        return gi;
    }

    private Map<String, String> createNewsArticle(String title, String category, String date, String summary, String image) {
        Map<String, String> na = new HashMap<>();
        na.put("title", title);
        na.put("category", category);
        na.put("date", date);
        na.put("summary", summary);
        na.put("image", image);
        return na;
    }
}
