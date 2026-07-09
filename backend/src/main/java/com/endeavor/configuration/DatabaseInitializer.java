package com.endeavor.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.endeavor.entity.ConferenceDetails;
import com.endeavor.entity.ConferencePhoto;
import com.endeavor.entity.Speaker;
import com.endeavor.entity.SpeakerPhoto;
import com.endeavor.entity.Sponsor;
import com.endeavor.entity.SponsorImage;
import com.endeavor.entity.Users;
import com.endeavor.repo.ConferenceDetailsRepo;
import com.endeavor.repo.SpeakerRepo;
import com.endeavor.repo.SponsorRepo;
import com.endeavor.repo.UserRepo;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.endeavor.entity.ConferenceImportantDate;
import java.time.LocalDate;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private ConferenceDetailsRepo repo;

    @Autowired
    private SpeakerRepo speakerRepo;

    @Autowired
    private SponsorRepo sponsorRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private com.endeavor.repo.ConferenceSeriesRepo seriesRepo;

    @Autowired
    private com.endeavor.repo.ConferenceImportantDateRepo importantDateRepo;

    @Autowired
    private com.endeavor.repo.CommitteeMemberRepo committeeMemberRepo;

    @Autowired
    private com.endeavor.repo.AdvisoryBoardMemberRepo advisoryBoardMemberRepo;

    @Autowired
    private com.endeavor.repo.AgendaDayRepo agendaDayRepo;

    @Autowired
    private com.endeavor.repo.AgendaSessionRepo agendaSessionRepo;

    @Autowired
    private com.endeavor.repo.ScientificTrackRepo trackRepo;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("UPDATE conference_details SET tittle = title WHERE tittle IS NULL AND title IS NOT NULL");
            System.out.println(">>> Migrated 'title' to legacy 'tittle' column successfully! <<<");
        } catch (Exception e) {
            System.out.println(">>> Title migration skipped: " + e.getMessage() + " <<<");
        }
        try {
            jdbcTemplate.execute("UPDATE conference_details SET is_deleted = false WHERE is_deleted IS NULL");
            System.out.println(">>> Migrated 'is_deleted' column successfully! <<<");
        } catch (Exception e) {
            System.out.println(">>> Is_deleted migration skipped: " + e.getMessage() + " <<<");
        }

        try {
            Integer sessionsCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'sessions'", Integer.class);
            if (sessionsCount != null && sessionsCount > 0) {
                jdbcTemplate.execute("INSERT IGNORE INTO scientific_sessions (id, affiliation, conference_id, description, name, speaker_name, time_range, type) " +
                                     "SELECT id, affiliation, conference_id, description, name, speaker_name, time_range, type FROM sessions");
                jdbcTemplate.execute("DROP TABLE sessions");
                System.out.println(">>> Migrated sessions to scientific_sessions successfully! <<<");
            }
        } catch (Exception e) {
            System.out.println(">>> Sessions migration skipped: " + e.getMessage() + " <<<");
        }

        try {
            Integer trackCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'conference_details_scientific_sessions'", Integer.class);
            if (trackCount != null && trackCount > 0) {
                jdbcTemplate.execute("INSERT IGNORE INTO scientific_tracks (conference_id, name, display_order, is_enabled) " +
                                     "SELECT conference_details_id, scientific_sessions, 0, true FROM conference_details_scientific_sessions");
                jdbcTemplate.execute("DROP TABLE conference_details_scientific_sessions");
                System.out.println(">>> Migrated track strings to scientific_tracks successfully! <<<");
            }
        } catch (Exception e) {
            System.out.println(">>> Track string migration skipped: " + e.getMessage() + " <<<");
        }

        seedUsers();
        seedSeries();
        seedConferences();
        seedSpeakers();
        seedAdvisoryBoard();
        seedCommittee();
        seedAgenda();
        seedSponsors();
        seedTracks();
        migrateWebinarRegistrationUrls();

        try {
            jdbcTemplate.execute("UPDATE conference_photos p JOIN conference_details d ON d.photo_id = p.id SET p.conference_id = d.id WHERE p.conference_id IS NULL");
            System.out.println(">>> Migrated 'photo_id' from conference_details to conference_id in conference_photos <<<");
        } catch (Exception e) {
            System.out.println(">>> Conference photo relationship migration skipped: " + e.getMessage() + " <<<");
        }
        try {
            jdbcTemplate.execute("UPDATE conference_photos SET is_primary = true WHERE is_primary IS NULL");
            System.out.println(">>> Set existing photos as primary <<<");
        } catch (Exception e) {
            System.out.println(">>> Conference photo is_primary migration skipped: " + e.getMessage() + " <<<");
        }
    }

    private void seedUsers() {
        // Bootstrap SUPER_ADMIN 'pavan'
        if (userRepo.findByUsername("pavan") == null) {
            Users pavan = new Users();
            pavan.setUsername("pavan");
            pavan.setPassword(passwordEncoder.encode("pavan"));
            pavan.setRole(com.endeavor.entity.Role.SUPER_ADMIN);
            userRepo.save(pavan);
            System.out.println(">>> Database Seeded Successfully with default SUPER_ADMIN pavan! <<<");
        }

        // Bootstrap default ADMIN 'admin'
        if (userRepo.findByUsername("admin") == null) {
            Users admin = new Users();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole(com.endeavor.entity.Role.ADMIN);
            userRepo.save(admin);
            System.out.println(">>> Database Seeded Successfully with default admin User! <<<");
        } else {
            Users existingAdmin = userRepo.findByUsername("admin");
            if (existingAdmin.getRole() != com.endeavor.entity.Role.ADMIN) {
                existingAdmin.setRole(com.endeavor.entity.Role.ADMIN);
                userRepo.save(existingAdmin);
            }
        }

        // Encode raw passwords if any exist
        for (Users u : userRepo.findAll()) {
            String pw = u.getPassword();
            if (pw != null && !pw.startsWith("$2a$") && !pw.startsWith("$2b$") && !pw.startsWith("$2y$")) {
                u.setPassword(passwordEncoder.encode(pw));
                userRepo.save(u);
            }
        }
    }

    private void seedSeries() {
        if (seriesRepo.count() == 0) {
            com.endeavor.entity.ConferenceSeries foodScience = new com.endeavor.entity.ConferenceSeries();
            foodScience.setName("Global Congress on Food Science and Nutrition");
            foodScience.setCode("FOODSCIENCE");
            foodScience.setDescription("Series of annual conferences focused on food technology, nutrition, safety, and science.");
            seriesRepo.save(foodScience);

            com.endeavor.entity.ConferenceSeries healthScience = new com.endeavor.entity.ConferenceSeries();
            healthScience.setName("Global Summit on Medical and Health Sciences");
            healthScience.setCode("MEDICAL");
            healthScience.setDescription("Global summit on clinical medicine, healthcare advancements, and nursing science.");
            seriesRepo.save(healthScience);

            com.endeavor.entity.ConferenceSeries appliedScience = new com.endeavor.entity.ConferenceSeries();
            appliedScience.setName("International Conference on Engineering and Applied Sciences");
            appliedScience.setCode("ENGINEERING");
            appliedScience.setDescription("International platform for advanced materials, chemical engineering, and applied sciences.");
            seriesRepo.save(appliedScience);

            System.out.println(">>> Database Seeded Successfully with default Conference Series! <<<");
        }
    }

    private void seedConferences() {
        if (repo.count() == 0) {
            // Seed Food Science Conference
            ConferenceDetails foodScience = new ConferenceDetails();
            foodScience.setTitle("3rd Edition of Global Congress on Food Science and Nutrition");
            foodScience.setSlug("3rd-edition-of-global-congress-on-food-science-and-nutrition");
            foodScience.setYear(2026);
            foodScience.setSeries(seriesRepo.findByCode("FOODSCIENCE").orElse(null));
            foodScience.setDescription("Join us for the leading global conference on food science.");
            foodScience.setStartDate("2026-07-08");
            foodScience.setEndDate("2026-07-10");
            foodScience.setVenue("Valencia, Spain");
            foodScience.setContactEmail("foodscience@intelevoresearch.org");
            foodScience.setContactPhone("+1 (209) 299-5348");
            foodScience.setAboutImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80");

            ConferencePhoto p1 = new ConferencePhoto();
            p1.setFileName("foodscience_hero.webp");
            p1.setFileType("image/webp");
            p1.setFilePath("https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80"); // Conference audience
            p1.setConferenceDetails(foodScience);
            foodScience.setPhoto(p1);
            seedDefaultImportantDates(foodScience);
            repo.save(foodScience);

            // Seed Medical Conference
            ConferenceDetails medical = new ConferenceDetails();
            medical.setTitle("Global Summit on Medical and Health Sciences");
            medical.setSlug("global-summit-on-medical-and-health-sciences");
            medical.setYear(2026);
            medical.setSeries(seriesRepo.findByCode("MEDICAL").orElse(null));
            medical.setDescription("A premier gathering for health and medical professionals.");
            medical.setStartDate("2026-09-12");
            medical.setEndDate("2026-09-14");
            medical.setVenue("London, UK");
            medical.setContactEmail("medical@intelevoresearch.org");
            medical.setContactPhone("+1 (209) 299-5348");
            medical.setAboutImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80");

            ConferencePhoto p2 = new ConferencePhoto();
            p2.setFileName("medical_hero.webp");
            p2.setFileType("image/webp");
            p2.setFilePath("https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80"); // Speaker presentation
            p2.setConferenceDetails(medical);
            medical.setPhoto(p2);
            seedDefaultImportantDates(medical);
            repo.save(medical);

            // Seed Engineering Conference
            ConferenceDetails engineering = new ConferenceDetails();
            engineering.setTitle("International Conference on Engineering and Applied Sciences");
            engineering.setSlug("international-conference-on-engineering-and-applied-sciences");
            engineering.setYear(2026);
            engineering.setSeries(seriesRepo.findByCode("ENGINEERING").orElse(null));
            engineering.setDescription("Exploring the latest advancements in engineering and applied sciences.");
            engineering.setStartDate("2026-10-22");
            engineering.setEndDate("2026-10-24");
            engineering.setVenue("Dubai, UAE");
            engineering.setContactEmail("engineering@intelevoresearch.org");
            engineering.setContactPhone("+1 (209) 299-5348");
            engineering.setAboutImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80");

            ConferencePhoto p3 = new ConferencePhoto();
            p3.setFileName("engineering_hero.webp");
            p3.setFileType("image/webp");
            p3.setFilePath("https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80"); // Networking event
            p3.setConferenceDetails(engineering);
            engineering.setPhoto(p3);
            seedDefaultImportantDates(engineering);
            repo.save(engineering);

            // Seed 4th Conference (Advanced Materials and Nanotechnology)
            ConferenceDetails materials = new ConferenceDetails();
            materials.setTitle("International Conference on Advanced Materials and Nanotechnology");
            materials.setSlug("international-conference-on-advanced-materials-and-nanotechnology");
            materials.setYear(2026);
            materials.setDescription("Dive into advanced materials and groundbreaking nanotechnology research.");
            materials.setStartDate("2026-11-15");
            materials.setEndDate("2026-11-17");
            materials.setVenue("Singapore");
            materials.setContactEmail("materials@intelevoresearch.org");
            materials.setContactPhone("+1 (209) 299-5348");

            ConferencePhoto p4 = new ConferencePhoto();
            p4.setFileName("materials_hero.webp");
            p4.setFileType("image/webp");
            p4.setFilePath("https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80"); // Panel discussion
            p4.setConferenceDetails(materials);
            materials.setPhoto(p4);
            seedDefaultImportantDates(materials);
            repo.save(materials);
            
            System.out.println(">>> Database Seeded Successfully with default Conferences! <<<");
        } else {
            com.endeavor.entity.ConferenceSeries foodScienceSeries = seriesRepo.findByCode("FOODSCIENCE").orElse(null);
            com.endeavor.entity.ConferenceSeries medicalSeries = seriesRepo.findByCode("MEDICAL").orElse(null);
            com.endeavor.entity.ConferenceSeries engineeringSeries = seriesRepo.findByCode("ENGINEERING").orElse(null);

            for (ConferenceDetails cd : repo.findAll()) {
                boolean changed = false;

                // Associate series & year based on title if missing
                if (cd.getSeries() == null || cd.getYear() == null) {
                    String cleanTitle = cd.getTitle() != null ? cd.getTitle() : cd.getTittle();
                    if (cleanTitle != null) {
                        if (cleanTitle.toLowerCase().contains("food")) {
                            cd.setSeries(foodScienceSeries);
                            cd.setYear(2026);
                            changed = true;
                        } else if (cleanTitle.toLowerCase().contains("medical") || cleanTitle.toLowerCase().contains("health")) {
                            cd.setSeries(medicalSeries);
                            cd.setYear(2026);
                            changed = true;
                        } else if (cleanTitle.toLowerCase().contains("engineering") || cleanTitle.toLowerCase().contains("applied")) {
                            cd.setSeries(engineeringSeries);
                            cd.setYear(2026);
                            changed = true;
                        } else {
                            cd.setYear(2026);
                            changed = true;
                        }
                    }
                }

                if (cd.getSlug() == null || cd.getSlug().trim().isEmpty()) {
                    String cleanTitle = cd.getTitle() != null ? cd.getTitle() : cd.getTittle();
                    if (cleanTitle != null) {
                        String generatedSlug = cleanTitle.toLowerCase()
                            .replaceAll("[^a-z0-9\\s-]", "")
                            .replaceAll("\\s+", "-");
                        cd.setSlug(generatedSlug);
                        changed = true;
                    }
                }

                if (cd.getImportantDates() == null || cd.getImportantDates().isEmpty()) {
                    seedDefaultImportantDates(cd);
                    changed = true;
                }

                if (changed) {
                    repo.save(cd);
                }
            }
        }
    }

    private void seedDefaultImportantDates(ConferenceDetails details) {
        int year = details.getYear() != null ? details.getYear() : 2026;
        saveDate(details, "Abstract Submission Opens", "Submit abstracts online.", LocalDate.of(year, 2, 1), 0, true);
        saveDate(details, "Abstract Submission Deadline", "Abstract submission closing date.", LocalDate.of(year, 5, 15), 1, true);
        saveDate(details, "Acceptance Notification", "Notification of abstract acceptance status.", LocalDate.of(year, 6, 1), 2, true);
        saveDate(details, "Early Bird Registration", "Avail early bird registration discount.", LocalDate.of(year, 6, 15), 3, true);
        
        LocalDate startDate;
        try {
            startDate = LocalDate.parse(details.getStartDate());
        } catch (Exception e) {
            startDate = LocalDate.of(year, 7, 8);
        }
        saveDate(details, "Conference Start Date", "First day of keynotes and technical sessions.", startDate, 4, true);
    }

    private void saveDate(ConferenceDetails details, String title, String desc, LocalDate date, int order, boolean isHighlighted) {
        ConferenceImportantDate cid = new ConferenceImportantDate();
        cid.setConferenceDetails(details);
        cid.setEventTitle(title);
        cid.setEventDescription(desc);
        cid.setEventDate(date);
        cid.setDisplayOrder(order);
        cid.setIsActive(true);
        cid.setIsHighlighted(isHighlighted);
        details.getImportantDates().add(cid);
    }

    private void seedSpeakers() {
        for (ConferenceDetails cd : repo.findAll()) {
            if (speakerRepo.findByConferenceId(cd.getId()).isEmpty()) {
                saveSpeakerEntity(cd.getId(), "Prof. Sarah Higgins", "Prof.", "Keynote Speaker", "University of Oxford", "UK", "KEYNOTE_SPEAKER", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80", "Food Policy, Nutrition, Dairy Science", "https://sarahhiggins.org", "https://linkedin.com/in/sarahhiggins", "0000-0002-1825-0097", true, 0);
                saveSpeakerEntity(cd.getId(), "Dr. Kenji Sato", "Dr.", "Plenary Speaker", "Tokyo Institute of Technology", "Japan", "KEYNOTE_SPEAKER", "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80", "Enzyme Technology, Bioactive Peptides", "https://kenjisato.jp", "https://linkedin.com/in/kenjisato", "0000-0002-1825-0098", true, 1);
                saveSpeakerEntity(cd.getId(), "Dr. Andrea Miller", "Dr.", "Invited Speaker", "University of Valencia", "Spain", "INVITED_SPEAKER", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80", "Food Safety, Molecular Nutrition", "", "", "", false, 2);
                saveSpeakerEntity(cd.getId(), "Prof. Alan Vance", "Prof.", "Invited Speaker", "CERN Particle Accelerator", "Switzerland", "INVITED_SPEAKER", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80", "Spectrometry, Diagnostic Tech", "", "", "", false, 3);
            }
        }
    }

    private void saveSpeakerEntity(Long conferenceId, String name, String academicTitle, String role, String institution, String country, String type, String photoUrl, String researchAreas, String website, String linkedin, String orcid, boolean isFeatured, int displayOrder) {
        Speaker speaker = new Speaker();
        speaker.setConferenceId(conferenceId);
        speaker.setName(name);
        speaker.setAcademicTitle(academicTitle);
        speaker.setDesignation(role);
        speaker.setAffiliation(institution);
        speaker.setCountry(country);
        speaker.setType(type);
        speaker.setBio("Distinguished scientist working on advanced international research project tracks.");
        speaker.setResearchAreas(researchAreas);
        speaker.setWebsite(website);
        speaker.setLinkedin(linkedin);
        speaker.setOrcid(orcid);
        speaker.setIsFeatured(isFeatured);
        speaker.setIsActive(true);
        speaker.setDisplayOrder(displayOrder);

        SpeakerPhoto photo = new SpeakerPhoto();
        photo.setFileName(name.replace(" ", "_").toLowerCase() + "_" + conferenceId + ".webp");
        photo.setFileType("image/webp");
        photo.setFilePath(photoUrl);
        photo.setSpeaker(speaker);
        speaker.setPhoto(photo);

        speakerRepo.save(speaker);
    }

    private void seedAdvisoryBoard() {
        for (ConferenceDetails cd : repo.findAll()) {
            if (advisoryBoardMemberRepo.findByConferenceId(cd.getId()).isEmpty()) {
                saveAdvisoryBoardEntity(cd.getId(), "Prof. Hans-Dieter Belitz", "Chair of Advisory Committee", "Technical University of Munich", "Germany", "Renowned expert in food chemistry and food systems.", "Food Chemistry, Lipids, Proteins", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80", 0);
                saveAdvisoryBoardEntity(cd.getId(), "Dr. Maria Y. Garcia", "Strategic Advisor", "University of Bologna", "Italy", "Distinguished associate professor working on Mediterranean diet health benefits.", "Polyphenols, Food Processing", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80", 1);
            }
        }
    }

    private void saveAdvisoryBoardEntity(Long conferenceId, String name, String designation, String org, String country, String bio, String expertise, String imagePath, int displayOrder) {
        com.endeavor.entity.AdvisoryBoardMember m = new com.endeavor.entity.AdvisoryBoardMember();
        m.setConferenceId(conferenceId);
        m.setName(name);
        m.setDesignation(designation);
        m.setOrganization(org);
        m.setCountry(country);
        m.setBio(bio);
        m.setResearchExpertise(expertise);
        m.setImagePath(imagePath);
        m.setDisplayOrder(displayOrder);
        m.setIsActive(true);
        advisoryBoardMemberRepo.save(m);
    }

    private void seedCommittee() {
        for (ConferenceDetails cd : repo.findAll()) {
            if (committeeMemberRepo.findByConferenceId(cd.getId()).isEmpty()) {
                saveCommitteeMember(cd.getId(), "Prof. Richard J. Roberts", "Chair", "Director of Research", "New England Biolabs", "USA", "Nobel Laureate in Physiology or Medicine (1993) for the discovery of split genes.", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80", 0);
                saveCommitteeMember(cd.getId(), "Dr. Elena Rostova", "Co-Chair", "Head of Biotechnology", "State University of St. Petersburg", "Russia", "Elena has spent 15 years developing microbial fermentation systems for food synthesis.", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80", 1);
                saveCommitteeMember(cd.getId(), "Dr. Marcus Vance", "Conference Secretary", "Associate Professor", "University of Sydney", "Australia", "Marcus coordinates academic events and chairs public communication panels.", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80", 2);
                saveCommitteeMember(cd.getId(), "Prof. Sarah Higgins", "Scientific Committee", "Professor of Nutrition", "University of Leipzig", "Germany", "Sarah is a professor of Nutrition and has published over 150 papers in major international journals.", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80", 3);
            }
        }
    }

    private void saveCommitteeMember(Long conferenceId, String name, String role, String designation, String institution, String country, String bio, String photoUrl, int order) {
        com.endeavor.entity.CommitteeMember cm = new com.endeavor.entity.CommitteeMember();
        cm.setConferenceId(conferenceId);
        cm.setName(name);
        cm.setRole(role);
        cm.setDesignation(designation);
        cm.setInstitution(institution);
        cm.setCountry(country);
        cm.setBiography(bio);
        cm.setPhotoUrl(photoUrl);
        cm.setDisplayOrder(order);
        cm.setIsActive(true);
        committeeMemberRepo.save(cm);
    }

    private void seedAgenda() {
        for (ConferenceDetails cd : repo.findAll()) {
            if (agendaDayRepo.findByConferenceId(cd.getId()).isEmpty()) {
                // Day 1
                com.endeavor.entity.AgendaDay d1 = new com.endeavor.entity.AgendaDay();
                d1.setConferenceId(cd.getId());
                d1.setDayNumber(1);
                d1.setDayTitle("Day 1 - Plenary & Opening Remarks");
                d1.setDisplayOrder(0);
                com.endeavor.entity.AgendaDay sd1 = agendaDayRepo.save(d1);

                saveAgendaSession(sd1, "08:30 - 09:00", "08:30", "09:00", "Registration & Coffee Check-in", "Local Organizing Committee", "Main Lobby", "Collect program bags, name badges, and conference directories.", 0, "Registration", "", "", "", "", "Welcome reception for arriving delegates.", "General");
                saveAgendaSession(sd1, "09:00 - 09:30", "09:00", "09:30", "Opening Ceremony & Remarks", "Dr. Richard J. Roberts", "Main Hall", "Official welcome address, introduction of theme tracks, and safety brief.", 1, "Opening Ceremony", "Prof. Hans-Dieter Belitz", "TUM Munich", "Germany", "Distinguished Nobel laureate and coordinator of global research initiative.", "Opening statements and overview of scientific achievements.", "General");
                saveAgendaSession(sd1, "09:30 - 10:30", "09:30", "10:30", "Keynote Address: Emerging Frontiers in Science", "Prof. John Smith", "Main Hall", "Plenary speech examining interdisciplinary breakthroughs and global safety policies.", 2, "Keynote", "Dr. Sarah Higgins", "Oxford University", "United Kingdom", "Distinguished Professor of Molecular Chemistry at Oxford.", "This keynote explores molecular synthesis paradigms and the intersection of policy and research.", "General");
                saveAgendaSession(sd1, "10:30 - 10:45", "10:30", "10:45", "Tea Break & Poster Exhibition", "", "Exhibition Hall", "Ad-hoc networking and poster viewing.", 3, "Break", "", "", "", "", "", "General");

                // Day 2
                com.endeavor.entity.AgendaDay d2 = new com.endeavor.entity.AgendaDay();
                d2.setConferenceId(cd.getId());
                d2.setDayNumber(2);
                d2.setDayTitle("Day 2 - Technical Program & Breakouts");
                d2.setDisplayOrder(1);
                com.endeavor.entity.AgendaDay sd2 = agendaDayRepo.save(d2);

                saveAgendaSession(sd2, "09:00 - 10:30", "09:00", "10:30", "Technical Session I: Advanced Biotechnology", "Dr. Kenji Sato", "Seminar Room B", "Enzymatic processes, cellular engineering breakthroughs, and biomanufacturing scale-up.", 0, "Technical Session", "Dr. Alan Turing", "UT Tokyo", "Japan", "Lead researcher of the Bio-Chemical Systems division.", "A detailed overview of modern industrial enzyme kinetics and genetic optimizations.", "Track 1: Bio-materials");
                saveAgendaSession(sd2, "10:30 - 10:45", "10:30", "10:45", "Coffee Break", "", "Exhibition Hall", "Refreshments and peer networking.", 1, "Break", "", "", "", "", "", "Track 1: Bio-materials");
                saveAgendaSession(sd2, "10:45 - 12:15", "10:45", "12:15", "Workshop: AI Applications in Science", "Dr. Andrea Miller", "Workshop Lab 1", "Hands-on tutorial building predictive neural networks for molecular research.", 2, "Workshop", "Prof. Grace Hopper", "Harvard University", "United States", "Chair of Advanced Computing at Harvard.", "Practical exercises utilizing deep learning architectures to compute molecular structural stability.", "Track 2: AI & Computing");
                saveAgendaSession(sd2, "12:15 - 13:15", "12:15", "13:15", "Networking Lunch Break", "", "Dining Room", "Buffet catering provided for all registered presenters.", 3, "Lunch", "", "", "", "", "", "General");
            }
        }
    }

    private void saveAgendaSession(com.endeavor.entity.AgendaDay day, String timeRange, String start, String end, String title, String speaker, String hall, String desc, int order, String type, String chair, String org, String country, String bio, String abs, String track) {
        com.endeavor.entity.AgendaSession session = new com.endeavor.entity.AgendaSession();
        session.setAgendaDay(day);
        session.setTimeRange(timeRange);
        session.setStartTime(start);
        session.setEndTime(end);
        session.setSessionTitle(title);
        session.setSpeakerName(speaker);
        session.setHall(hall);
        session.setDescription(desc);
        session.setDisplayOrder(order);
        session.setSessionType(type);
        session.setChairperson(chair);
        session.setOrganization(org);
        session.setCountry(country);
        session.setBiography(bio);
        session.setAbstractText(abs);
        session.setTrack(track);
        session.setStatus("ACTIVE");
        agendaSessionRepo.save(session);
    }

    private void seedSponsors() {
        if (sponsorRepo.count() == 0) {
            saveSponsorEntity("IEEE", "Institute of Electrical and Electronics Engineers");
            saveSponsorEntity("Springer Nature", "Global academic publishing group");
            saveSponsorEntity("Elsevier", "Information analytics company");
            saveSponsorEntity("Google Scholar", "Free academic search engine");
            saveSponsorEntity("CrossRef", "Official digital object identifier agency");
            saveSponsorEntity("Scopus", "Elsevier abstract and citation database");
            saveSponsorEntity("Web of Science", "Clarivate research indexing platform");

            System.out.println(">>> Database Seeded Successfully with default Sponsors! <<<");
        }
    }

    private void saveSponsorEntity(String name, String desc) {
        Sponsor sponsor = new Sponsor();
        sponsor.setSponsorName(name);
        sponsor.setDescription(desc);

        SponsorImage image = new SponsorImage();
        image.setFileName(name.replace(" ", "_").toLowerCase() + "_logo.webp");
        image.setFileType("image/webp");
        image.setFilePath(""); // Will resolve as fallback named dynamic SVG
        image.setSponsor(sponsor);
        sponsor.setImage(image);

        sponsorRepo.save(sponsor);
    }

    private void migrateWebinarRegistrationUrls() {
        try {
            jdbcTemplate.execute("UPDATE webinars SET registration_url = CONCAT('/register/', slug) WHERE registration_required = true OR registration_required = 1");
            System.out.println(">>> Updated webinar registration URLs to match dynamic SPA route pattern successfully! <<<");
        } catch (Exception e) {
            System.err.println(">>> Webinar registration URL update failed: " + e.getMessage() + " <<<");
        }
    }

    private void seedTracks() {
        for (ConferenceDetails cd : repo.findAll()) {
            if (trackRepo.countByConferenceId(cd.getId()) == 0) {
                String title = cd.getTitle() != null ? cd.getTitle() : cd.getTittle();
                if (title != null) {
                    if (title.toLowerCase().contains("food")) {
                        saveTrackEntity(cd.getId(), "Food Chemistry and Biochemistry", 0);
                        saveTrackEntity(cd.getId(), "Nutrition and Human Health", 1);
                        saveTrackEntity(cd.getId(), "Food Safety, Quality, and Control", 2);
                        saveTrackEntity(cd.getId(), "Food Biotechnology and Fermentation", 3);
                        saveTrackEntity(cd.getId(), "Innovations in Food Processing", 4);
                        saveTrackEntity(cd.getId(), "Sustainable Food Systems", 5);
                    } else if (title.toLowerCase().contains("medical") || title.toLowerCase().contains("health")) {
                        saveTrackEntity(cd.getId(), "Clinical Medicine and Diagnostics", 0);
                        saveTrackEntity(cd.getId(), "Public Health and Healthcare Management", 1);
                        saveTrackEntity(cd.getId(), "Nursing and Patient Care", 2);
                        saveTrackEntity(cd.getId(), "Biomedical Engineering and Research", 3);
                        saveTrackEntity(cd.getId(), "Pharmacology and Therapeutics", 4);
                        saveTrackEntity(cd.getId(), "Pediatrics and Maternal Health", 5);
                    } else if (title.toLowerCase().contains("engineering") || title.toLowerCase().contains("applied")) {
                        saveTrackEntity(cd.getId(), "Advanced Materials and Metallurgy", 0);
                        saveTrackEntity(cd.getId(), "Mechanical and Manufacturing Engineering", 1);
                        saveTrackEntity(cd.getId(), "Civil and Structural Engineering", 2);
                        saveTrackEntity(cd.getId(), "Electrical and Electronic Systems", 3);
                        saveTrackEntity(cd.getId(), "Chemical and Process Engineering", 4);
                        saveTrackEntity(cd.getId(), "Environmental Technologies", 5);
                    } else if (title.toLowerCase().contains("materials") || title.toLowerCase().contains("nano")) {
                        saveTrackEntity(cd.getId(), "Synthesis of Nanomaterials", 0);
                        saveTrackEntity(cd.getId(), "Biomaterials and Tissue Engineering", 1);
                        saveTrackEntity(cd.getId(), "Polymers and Soft Materials", 2);
                        saveTrackEntity(cd.getId(), "Electronic and Optical Materials", 3);
                        saveTrackEntity(cd.getId(), "Energy Conversion and Storage Materials", 4);
                        saveTrackEntity(cd.getId(), "Computational Materials Science", 5);
                    } else if (title.toLowerCase().contains("geology") || title.toLowerCase().contains("earth") || title.toLowerCase().contains("geo")) {
                        saveTrackEntity(cd.getId(), "Mineralogy and Geochemistry", 0);
                        saveTrackEntity(cd.getId(), "Petrology and Volcanology", 1);
                        saveTrackEntity(cd.getId(), "Structural Geology and Tectonics", 2);
                        saveTrackEntity(cd.getId(), "Paleontology and Stratigraphy", 3);
                        saveTrackEntity(cd.getId(), "Geophysics and Seismology", 4);
                        saveTrackEntity(cd.getId(), "Hydrology and Hydrogeology", 5);
                        saveTrackEntity(cd.getId(), "Environmental Geology and Climate Change", 6);
                        saveTrackEntity(cd.getId(), "Natural Hazards and Risk Assessment", 7);
                    } else {
                        saveTrackEntity(cd.getId(), "General Session Track 1", 0);
                        saveTrackEntity(cd.getId(), "General Session Track 2", 1);
                        saveTrackEntity(cd.getId(), "General Session Track 3", 2);
                    }
                }
            }
        }
        System.out.println(">>> Database Seeded Successfully with default tracks! <<<");
    }

    private void saveTrackEntity(Long conferenceId, String name, int order) {
        com.endeavor.entity.ScientificTrack track = new com.endeavor.entity.ScientificTrack();
        track.setConferenceId(conferenceId);
        track.setName(name);
        track.setDisplayOrder(order);
        track.setIsEnabled(true);
        track.setIsFeatured(order < 2);
        track.setShortDescription("Scientific session track focused on " + name + " and related disciplines.");
        track.setKeywords(name.replace(" and ", ", ").replace(" ", ", "));
        trackRepo.save(track);
    }
}
