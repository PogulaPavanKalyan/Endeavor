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
        seedSponsors();
    }

    private void seedUsers() {
        if (userRepo.count() == 0) {
            Users admin = new Users();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            userRepo.save(admin);
            System.out.println(">>> Database Seeded Successfully with default admin User! <<<");
        } else {
            for (Users u : userRepo.findAll()) {
                String pw = u.getPassword();
                if (pw != null && !pw.startsWith("$2a$") && !pw.startsWith("$2b$") && !pw.startsWith("$2y$")) {
                    u.setPassword(passwordEncoder.encode(pw));
                    userRepo.save(u);
                }
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
            foodScience.setContactEmail("foodscience@endeavorresearchgroup.net");
            foodScience.setContactPhone("+1 (209) 299-5348");

            ConferencePhoto p1 = new ConferencePhoto();
            p1.setFileName("foodscience_hero.webp");
            p1.setFileType("image/webp");
            p1.setFilePath("https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80"); // Conference audience
            p1.setConferenceDetails(foodScience);
            foodScience.setPhoto(p1);
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
            medical.setContactEmail("medical@endeavorresearchgroup.net");
            medical.setContactPhone("+1 (209) 299-5348");

            ConferencePhoto p2 = new ConferencePhoto();
            p2.setFileName("medical_hero.webp");
            p2.setFileType("image/webp");
            p2.setFilePath("https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80"); // Speaker presentation
            p2.setConferenceDetails(medical);
            medical.setPhoto(p2);
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
            engineering.setContactEmail("engineering@endeavorresearchgroup.net");
            engineering.setContactPhone("+1 (209) 299-5348");

            ConferencePhoto p3 = new ConferencePhoto();
            p3.setFileName("engineering_hero.webp");
            p3.setFileType("image/webp");
            p3.setFilePath("https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80"); // Networking event
            p3.setConferenceDetails(engineering);
            engineering.setPhoto(p3);
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
            materials.setContactEmail("materials@endeavorresearchgroup.net");
            materials.setContactPhone("+1 (209) 299-5348");

            ConferencePhoto p4 = new ConferencePhoto();
            p4.setFileName("materials_hero.webp");
            p4.setFileType("image/webp");
            p4.setFilePath("https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80"); // Panel discussion
            p4.setConferenceDetails(materials);
            materials.setPhoto(p4);
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

                if (changed) {
                    repo.save(cd);
                }
            }
        }
    }

    private void seedSpeakers() {
        if (speakerRepo.count() == 0) {
            // Seed Featured Plenary Speakers
            saveSpeakerEntity("Prof. Sarah Higgins", "Keynote Speaker", "University of Oxford", "UK", "KEYNOTE", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80");
            saveSpeakerEntity("Dr. Kenji Sato", "Plenary Speaker", "Tokyo Institute of Technology", "Japan", "KEYNOTE", "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80");
            saveSpeakerEntity("Dr. Andrea Miller", "Invited Speaker", "University of Valencia", "Spain", "KEYNOTE", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80");
            saveSpeakerEntity("Prof. Alan Vance", "Technical Lead", "CERN Particle Accelerator", "Switzerland", "KEYNOTE", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80");
            
            System.out.println(">>> Database Seeded Successfully with default Speakers! <<<");
        }
    }

    private void saveSpeakerEntity(String name, String role, String institution, String country, String type, String photoUrl) {
        Speaker speaker = new Speaker();
        speaker.setName(name);
        speaker.setDesignation(role);
        speaker.setAffiliation(institution);
        speaker.setCountry(country);
        speaker.setType(type);
        speaker.setBio("Distinguished scientist working on advanced international research project tracks.");

        SpeakerPhoto photo = new SpeakerPhoto();
        photo.setFileName(name.replace(" ", "_").toLowerCase() + ".webp");
        photo.setFileType("image/webp");
        photo.setFilePath(photoUrl);
        photo.setSpeaker(speaker);
        speaker.setPhoto(photo);

        speakerRepo.save(speaker);
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
}
