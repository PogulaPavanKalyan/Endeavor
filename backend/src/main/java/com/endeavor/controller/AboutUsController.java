package com.endeavor.controller;

import com.endeavor.entity.*;
import com.endeavor.repo.*;
import com.endeavor.service.AboutUsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://51.21.159.47:8000"
})
public class AboutUsController {

    @Autowired
    private AboutUsService aboutUsService;

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

    // --- Public API ---
    @GetMapping("/about")
    public ResponseEntity<Map<String, Object>> getAboutData() {
        return ResponseEntity.ok(aboutUsService.getConsolidatedAboutData());
    }

    // --- Admin: Section Settings ---
    @PutMapping("/admin/about/section")
    public ResponseEntity<AboutUsSection> updateSection(@RequestBody AboutUsSection section) {
        return ResponseEntity.ok(aboutUsService.saveAboutUsSection(section));
    }

    // --- Admin: Image Upload ---
    @PostMapping(value = "/admin/about/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        try {
            String uploadsDir = System.getProperty("user.dir") + "/uploads/about/";
            File dir = new File(uploadsDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String uniqueName = UUID.randomUUID().toString() + extension;
            Files.write(Paths.get(uploadsDir + uniqueName), file.getBytes());

            Map<String, String> response = new HashMap<>();
            response.put("fileName", uniqueName);
            response.put("url", "/uploads/about/" + uniqueName);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // --- Admin: Overview Features ---
    @GetMapping("/admin/about/features")
    public ResponseEntity<List<AboutOverviewFeature>> getFeatures() {
        return ResponseEntity.ok(overviewFeatureRepo.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/admin/about/features")
    public ResponseEntity<AboutOverviewFeature> createFeature(@RequestBody AboutOverviewFeature feature) {
        return ResponseEntity.status(HttpStatus.CREATED).body(overviewFeatureRepo.save(feature));
    }

    @PutMapping("/admin/about/features/{id}")
    public ResponseEntity<AboutOverviewFeature> updateFeature(@PathVariable Long id, @RequestBody AboutOverviewFeature featureDetails) {
        return overviewFeatureRepo.findById(id).map(feature -> {
            feature.setTitle(featureDetails.getTitle());
            feature.setDescription(featureDetails.getDescription());
            feature.setDisplayOrder(featureDetails.getDisplayOrder());
            return ResponseEntity.ok(overviewFeatureRepo.save(feature));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/about/features/{id}")
    public ResponseEntity<Void> deleteFeature(@PathVariable Long id) {
        if (overviewFeatureRepo.existsById(id)) {
            overviewFeatureRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Admin: Services ---
    @GetMapping("/admin/about/services")
    public ResponseEntity<List<AboutServiceItem>> getServices() {
        return ResponseEntity.ok(serviceItemRepo.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/admin/about/services")
    public ResponseEntity<AboutServiceItem> createService(@RequestBody AboutServiceItem service) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceItemRepo.save(service));
    }

    @PutMapping("/admin/about/services/{id}")
    public ResponseEntity<AboutServiceItem> updateService(@PathVariable Long id, @RequestBody AboutServiceItem serviceDetails) {
        return serviceItemRepo.findById(id).map(service -> {
            service.setTitle(serviceDetails.getTitle());
            service.setDescription(serviceDetails.getDescription());
            service.setIcon(serviceDetails.getIcon());
            service.setTag(serviceDetails.getTag());
            service.setDisplayOrder(serviceDetails.getDisplayOrder());
            return ResponseEntity.ok(serviceItemRepo.save(service));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/about/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        if (serviceItemRepo.existsById(id)) {
            serviceItemRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Admin: Why Choose Us ---
    @GetMapping("/admin/about/why-choose")
    public ResponseEntity<List<AboutWhyChooseItem>> getWhyChoose() {
        return ResponseEntity.ok(whyChooseItemRepo.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/admin/about/why-choose")
    public ResponseEntity<AboutWhyChooseItem> createWhyChoose(@RequestBody AboutWhyChooseItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(whyChooseItemRepo.save(item));
    }

    @PutMapping("/admin/about/why-choose/{id}")
    public ResponseEntity<AboutWhyChooseItem> updateWhyChoose(@PathVariable Long id, @RequestBody AboutWhyChooseItem itemDetails) {
        return whyChooseItemRepo.findById(id).map(item -> {
            item.setTitle(itemDetails.getTitle());
            item.setDescription(itemDetails.getDescription());
            item.setIcon(itemDetails.getIcon());
            item.setDisplayOrder(itemDetails.getDisplayOrder());
            return ResponseEntity.ok(whyChooseItemRepo.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/about/why-choose/{id}")
    public ResponseEntity<Void> deleteWhyChoose(@PathVariable Long id) {
        if (whyChooseItemRepo.existsById(id)) {
            whyChooseItemRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Admin: Partners ---
    @GetMapping("/admin/about/partners")
    public ResponseEntity<List<AboutPartnerNetwork>> getPartners() {
        return ResponseEntity.ok(partnerNetworkRepo.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/admin/about/partners")
    public ResponseEntity<AboutPartnerNetwork> createPartner(@RequestBody AboutPartnerNetwork partner) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partnerNetworkRepo.save(partner));
    }

    @PutMapping("/admin/about/partners/{id}")
    public ResponseEntity<AboutPartnerNetwork> updatePartner(@PathVariable Long id, @RequestBody AboutPartnerNetwork partnerDetails) {
        return partnerNetworkRepo.findById(id).map(partner -> {
            partner.setName(partnerDetails.getName());
            partner.setLogoFileName(partnerDetails.getLogoFileName());
            partner.setDisplayOrder(partnerDetails.getDisplayOrder());
            return ResponseEntity.ok(partnerNetworkRepo.save(partner));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/about/partners/{id}")
    public ResponseEntity<Void> deletePartner(@PathVariable Long id) {
        if (partnerNetworkRepo.existsById(id)) {
            partnerNetworkRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Admin: Timeline ---
    @GetMapping("/admin/about/timeline")
    public ResponseEntity<List<AboutTimelineMilestone>> getTimeline() {
        return ResponseEntity.ok(timelineMilestoneRepo.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/admin/about/timeline")
    public ResponseEntity<AboutTimelineMilestone> createTimeline(@RequestBody AboutTimelineMilestone milestone) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timelineMilestoneRepo.save(milestone));
    }

    @PutMapping("/admin/about/timeline/{id}")
    public ResponseEntity<AboutTimelineMilestone> updateTimeline(@PathVariable Long id, @RequestBody AboutTimelineMilestone details) {
        return timelineMilestoneRepo.findById(id).map(milestone -> {
            milestone.setYear(details.getYear());
            milestone.setTitle(details.getTitle());
            milestone.setDescription(details.getDescription());
            milestone.setSide(details.getSide());
            milestone.setDisplayOrder(details.getDisplayOrder());
            return ResponseEntity.ok(timelineMilestoneRepo.save(milestone));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/about/timeline/{id}")
    public ResponseEntity<Void> deleteTimeline(@PathVariable Long id) {
        if (timelineMilestoneRepo.existsById(id)) {
            timelineMilestoneRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Admin: Leaders ---
    @GetMapping("/admin/about/leaders")
    public ResponseEntity<List<AboutAdvisoryLeader>> getLeaders() {
        return ResponseEntity.ok(advisoryLeaderRepo.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/admin/about/leaders")
    public ResponseEntity<AboutAdvisoryLeader> createLeader(@RequestBody AboutAdvisoryLeader leader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(advisoryLeaderRepo.save(leader));
    }

    @PutMapping("/admin/about/leaders/{id}")
    public ResponseEntity<AboutAdvisoryLeader> updateLeader(@PathVariable Long id, @RequestBody AboutAdvisoryLeader details) {
        return advisoryLeaderRepo.findById(id).map(leader -> {
            leader.setName(details.getName());
            leader.setRole(details.getRole());
            leader.setInstitution(details.getInstitution());
            leader.setCountry(details.getCountry());
            leader.setPhotoFileName(details.getPhotoFileName());
            leader.setEmoji(details.getEmoji());
            leader.setDisplayOrder(details.getDisplayOrder());
            return ResponseEntity.ok(advisoryLeaderRepo.save(leader));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/about/leaders/{id}")
    public ResponseEntity<Void> deleteLeader(@PathVariable Long id) {
        if (advisoryLeaderRepo.existsById(id)) {
            advisoryLeaderRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Admin: Locations ---
    @GetMapping("/admin/about/locations")
    public ResponseEntity<List<AboutMapLocation>> getLocations() {
        return ResponseEntity.ok(mapLocationRepo.findAll());
    }

    @PostMapping("/admin/about/locations")
    public ResponseEntity<AboutMapLocation> createLocation(@RequestBody AboutMapLocation location) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mapLocationRepo.save(location));
    }

    @PutMapping("/admin/about/locations/{id}")
    public ResponseEntity<AboutMapLocation> updateLocation(@PathVariable Long id, @RequestBody AboutMapLocation details) {
        return mapLocationRepo.findById(id).map(location -> {
            location.setName(details.getName());
            location.setX(details.getX());
            location.setY(details.getY());
            location.setIsOffice(details.getIsOffice());
            location.setOfficeTitle(details.getOfficeTitle());
            location.setOfficeAddress(details.getOfficeAddress());
            return ResponseEntity.ok(mapLocationRepo.save(location));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/about/locations/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        if (mapLocationRepo.existsById(id)) {
            mapLocationRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Admin: Connections ---
    @GetMapping("/admin/about/connections")
    public ResponseEntity<List<AboutMapConnection>> getConnections() {
        return ResponseEntity.ok(mapConnectionRepo.findAll());
    }

    @PostMapping("/admin/about/connections")
    public ResponseEntity<AboutMapConnection> createConnection(@RequestBody AboutMapConnection connection) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mapConnectionRepo.save(connection));
    }

    @PutMapping("/admin/about/connections/{id}")
    public ResponseEntity<AboutMapConnection> updateConnection(@PathVariable Long id, @RequestBody AboutMapConnection details) {
        return mapConnectionRepo.findById(id).map(connection -> {
            connection.setStartX(details.getStartX());
            connection.setStartY(details.getStartY());
            connection.setControlX(details.getControlX());
            connection.setControlY(details.getControlY());
            connection.setEndX(details.getEndX());
            connection.setEndY(details.getEndY());
            connection.setOpacity(details.getOpacity());
            connection.setDashArray(details.getDashArray());
            return ResponseEntity.ok(mapConnectionRepo.save(connection));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/about/connections/{id}")
    public ResponseEntity<Void> deleteConnection(@PathVariable Long id) {
        if (mapConnectionRepo.existsById(id)) {
            mapConnectionRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Reorder Helper ---
    @PutMapping("/admin/about/{listType}/reorder")
    public ResponseEntity<?> reorderList(@PathVariable String listType, @RequestBody List<Long> orderedIds) {
        if (orderedIds == null || orderedIds.isEmpty()) {
            return ResponseEntity.badRequest().body("Ordered IDs list is empty");
        }

        switch (listType.toLowerCase()) {
            case "features":
                for (int i = 0; i < orderedIds.size(); i++) {
                    int finalI = i;
                    overviewFeatureRepo.findById(orderedIds.get(i)).ifPresent(item -> {
                        item.setDisplayOrder(finalI + 1);
                        overviewFeatureRepo.save(item);
                    });
                }
                break;
            case "services":
                for (int i = 0; i < orderedIds.size(); i++) {
                    int finalI = i;
                    serviceItemRepo.findById(orderedIds.get(i)).ifPresent(item -> {
                        item.setDisplayOrder(finalI + 1);
                        serviceItemRepo.save(item);
                    });
                }
                break;
            case "why-choose":
                for (int i = 0; i < orderedIds.size(); i++) {
                    int finalI = i;
                    whyChooseItemRepo.findById(orderedIds.get(i)).ifPresent(item -> {
                        item.setDisplayOrder(finalI + 1);
                        whyChooseItemRepo.save(item);
                    });
                }
                break;
            case "partners":
                for (int i = 0; i < orderedIds.size(); i++) {
                    int finalI = i;
                    partnerNetworkRepo.findById(orderedIds.get(i)).ifPresent(item -> {
                        item.setDisplayOrder(finalI + 1);
                        partnerNetworkRepo.save(item);
                    });
                }
                break;
            case "timeline":
                for (int i = 0; i < orderedIds.size(); i++) {
                    int finalI = i;
                    timelineMilestoneRepo.findById(orderedIds.get(i)).ifPresent(item -> {
                        item.setDisplayOrder(finalI + 1);
                        timelineMilestoneRepo.save(item);
                    });
                }
                break;
            case "leaders":
                for (int i = 0; i < orderedIds.size(); i++) {
                    int finalI = i;
                    advisoryLeaderRepo.findById(orderedIds.get(i)).ifPresent(item -> {
                        item.setDisplayOrder(finalI + 1);
                        advisoryLeaderRepo.save(item);
                    });
                }
                break;
            default:
                return ResponseEntity.badRequest().body("Invalid list type: " + listType);
        }

        return ResponseEntity.ok().build();
    }
}
