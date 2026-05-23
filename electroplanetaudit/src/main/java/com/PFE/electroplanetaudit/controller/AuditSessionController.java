package com.PFE.electroplanetaudit.controller;

import com.PFE.electroplanetaudit.dto.GradeRequest;
import com.PFE.electroplanetaudit.entity.*;
import com.PFE.electroplanetaudit.repository.AuditMissionRepository;
import com.PFE.electroplanetaudit.repository.AuditSessionRepository;
import com.PFE.electroplanetaudit.repository.ElementScoreRepository;
import com.PFE.electroplanetaudit.service.AuditSessionService;
import com.PFE.electroplanetaudit.service.MediaEvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-sessions")
@RequiredArgsConstructor
public class AuditSessionController {

    private final AuditSessionService auditSessionService;
    private final AuditMissionRepository auditMissionRepository;
    private final AuditSessionRepository auditSessionRepository;
    private final ElementScoreRepository elementScoreRepository;
    private final MediaEvidenceService mediaEvidenceService;

    // ===== CREATE - Start audit from mission (AUDITEUR ONLY) =====
    @PostMapping("/start-from-mission")
    @PreAuthorize("hasRole('AUDITEUR')")
    public ResponseEntity<AuditSession> startFromMission( @RequestParam Long missionId,      // ← ADD @RequestParam
                                          @RequestParam Long auditeurId) {

        // 1. Get the mission
        AuditMission mission = auditMissionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission not found"));

        // 2. Verify mission belongs to this auditor
        if (!mission.getAuditeur().getId().equals(auditeurId)) {
            throw new RuntimeException("This mission is not assigned to you");
        }

        // 3. Verify mission status is PLANIFIEE
        if (mission.getStatut() != MissionStatus.PLANIFIEE) {
            throw new RuntimeException("Mission is already started or completed");
        }

        // 4. Verify mission doesn't already have a session
        if (auditSessionRepository.existsByMissionId(missionId)) {
            throw new RuntimeException("Mission already has an audit session");
        }

        // 5. VALIDATION: Check if current date is before or equal to mission dateDebut
        LocalDate today = LocalDate.now();
        if (today.isBefore(mission.getDateDebut())) {
            throw new RuntimeException("Cannot start audit before scheduled date: " + mission.getDateDebut());
        }

        // 6. VALIDATION: Check if deadline is passed (if dateFin exists)
        if (mission.getDateFin() != null && today.isAfter(mission.getDateFin())) {
            throw new RuntimeException("Cannot start audit: Deadline was " + mission.getDateFin());
        }

        // 7. Create AuditSession - ✅ Add dateCreation
        AuditSession session = AuditSession.builder()
                .mission(mission)
                .store(mission.getStore())
                .auditeur(mission.getAuditeur())
                .dateDebut(LocalDateTime.now())
                .dateCreation(LocalDateTime.now())
                .lastSaved(LocalDateTime.now())
                .completedElements(0)
                .progressPercentage(0)
                .statut(SessionStatus.EN_COURS)
                .build();

        session = auditSessionRepository.save(session);

        // 8. Copy all AuditElements from Mission to Session (create empty ElementScores)
        for (AuditElement element : mission.getAuditElements()) {
            ElementScore elementScore = ElementScore.builder()
                    .auditSession(session)
                    .auditElement(element)
                    .score(null)  // Not graded yet
                    .build();
            elementScoreRepository.save(elementScore);
        }

        // 9. Update mission status
        mission.setStatut(MissionStatus.EN_COURS);
        auditMissionRepository.save(mission);

        return ResponseEntity.ok(session);
    }

    // ===== READ (All) - ADMIN ONLY =====
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditSession>> getAll() {
        return ResponseEntity.ok(auditSessionService.findAll());
    }

    // ===== READ (By ID) - ADMIN ONLY =====
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditSession> getById(@PathVariable Long id) {
        AuditSession session = auditSessionService.findById(id);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(session);
    }

    // ===== READ (By store) - ADMIN ONLY =====
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditSession>> getByStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(auditSessionService.findByStore(storeId));
    }

    // ===== READ (By auditor) - ADMIN ONLY =====
    @GetMapping("/auditeur/{auditeurId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditSession>> getByAuditeur(@PathVariable Long auditeurId) {
        return ResponseEntity.ok(auditSessionService.findByAuditeur(auditeurId));
    }

    // ===== READ (My sessions) - AUDITEUR ONLY =====
    @GetMapping("/me/{auditeurId}")
    @PreAuthorize("hasRole('AUDITEUR')")
    public ResponseEntity<Page<AuditSession>> getMySessions(
            @PathVariable Long auditeurId,
            @RequestParam(required = false) String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateDebut") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        SessionStatus sessionStatus = null;
        if (statut != null && !statut.isEmpty()) {
            sessionStatus = SessionStatus.valueOf(statut.toUpperCase());
        }

        return ResponseEntity.ok(auditSessionService.getMySessions(auditeurId, sessionStatus, pageable));
    }

    // ===== READ (Filtered) - ADMIN ONLY =====
    @GetMapping("/filtered")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditSession>> getFiltered(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long auditeurId,
            @RequestParam(required = false) String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateDebut") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        SessionStatus sessionStatus = null;
        if (statut != null && !statut.isEmpty()) {
            sessionStatus = SessionStatus.valueOf(statut.toUpperCase());
        }

        return ResponseEntity.ok(auditSessionService.getSessionsWithFilters(storeId, auditeurId, sessionStatus, pageable));
    }

    // ===== READ (Scores by session) - Both =====
    @GetMapping("/{sessionId}/scores")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ElementScore>> getScoresBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(auditSessionService.getScoresBySession(sessionId));
    }

    // ===== READ (Check if mission can be started) - AUDITEUR ONLY =====
    @GetMapping("/can-start/{missionId}/{auditeurId}")
    @PreAuthorize("hasRole('AUDITEUR')")
    public ResponseEntity<?> canStartMission(@PathVariable Long missionId, @PathVariable Long auditeurId) {
        boolean canStart = auditSessionService.canStartMission(missionId, auditeurId);
        return ResponseEntity.ok().body("{\"canStart\": " + canStart + "}");
    }

    // ===== READ (Get session by mission) - AUDITEUR ONLY =====
    @GetMapping("/mission/{missionId}")
    @PreAuthorize("hasRole('AUDITEUR')")
    public ResponseEntity<?> getSessionByMission(@PathVariable Long missionId,
                                                 @RequestParam Long auditeurId) {
        // Verify mission belongs to auditeur
        AuditMission mission = auditMissionRepository.findById(missionId).orElse(null);
        if (mission == null || !mission.getAuditeur().getId().equals(auditeurId)) {
            return ResponseEntity.badRequest().body("{\"message\": \"Mission not found or not assigned to you\"}");
        }

        List<AuditSession> sessions = auditSessionService.findByMissionId(missionId);
        if (sessions.isEmpty()) {
            return ResponseEntity.ok().body("{\"exists\": false}");
        }

        AuditSession session = sessions.get(0);
        List<ElementScore> scores = auditSessionService.getScoresBySession(session.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("exists", true);
        response.put("session", session);
        response.put("scores", scores);

        return ResponseEntity.ok(response);
    }


    // ===== UPDATE - Grade one element (AUDITEUR ONLY) =====
    @PutMapping("/{sessionId}/grade")
    @PreAuthorize("hasRole('AUDITEUR')")
    public ResponseEntity<ElementScore> gradeElement(@PathVariable Long sessionId,
                                                     @RequestParam Long elementId,
                                                     @RequestParam Integer score,
                                                     @RequestParam(required = false) String commentaire) {
        ElementScore graded = auditSessionService.gradeElement(sessionId, elementId, score, commentaire);
        return ResponseEntity.ok(graded);
    }

    // ===== UPDATE - Upload images for element (AUDITEUR ONLY) =====
    @PostMapping("/{sessionId}/upload-images")
    @PreAuthorize("hasRole('AUDITEUR')")
    public ResponseEntity<?> uploadImages(@PathVariable Long sessionId,
                                          @RequestParam Long elementId,
                                          @RequestParam("files") List<MultipartFile> files) {
        try {
            List<String> imageUrls = files.stream()
                    .map(file -> mediaEvidenceService.uploadPhoto(sessionId, elementId, file).getImageUrl())
                    .toList();
            return ResponseEntity.ok(Map.of("images", imageUrls));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ===== UPDATE - Grade multiple elements (AUDITEUR ONLY) =====
    @PutMapping("/{sessionId}/grade-batch")
    @PreAuthorize("hasRole('AUDITEUR')")
    public ResponseEntity<?> gradeElements(@PathVariable Long sessionId,
                                           @RequestBody List<GradeRequest> grades) {
        auditSessionService.gradeElements(sessionId, grades);
        return ResponseEntity.ok().body("{\"message\": \"Scores saved successfully\"}");
    }

    // ===== UPDATE - Submit audit (AUDITEUR ONLY) =====
    @PatchMapping("/{sessionId}/submit")
    @PreAuthorize("hasRole('AUDITEUR')")
    public ResponseEntity<AuditSession> submitAudit(@PathVariable Long sessionId) {
        AuditSession session = auditSessionService.submitAudit(sessionId);
        return ResponseEntity.ok(session);
    }

    // ===== DELETE - ADMIN ONLY =====
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = auditSessionService.delete(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body("{\"message\": \"Audit session deleted successfully\"}");
    }

    // ===== STATISTICS FOR BI - ADMIN ONLY =====
    @GetMapping("/stats/average-by-store")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getAverageScoreByStore() {
        return ResponseEntity.ok(auditSessionService.getAverageScoreByStore());
    }

    @GetMapping("/stats/average-by-auditeur")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getAverageScoreByAuditeur() {
        return ResponseEntity.ok(auditSessionService.getAverageScoreByAuditeur());
    }

    @GetMapping("/stats/average-by-region")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getAverageScoreByRegion() {
        return ResponseEntity.ok(auditSessionService.getAverageScoreByRegion());
    }

    @GetMapping("/stats/monthly-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getMonthlyAuditCount() {
        return ResponseEntity.ok(auditSessionService.getMonthlyAuditCount());
    }

    @GetMapping("/stats/element-performance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getElementPerformanceSummary() {
        return ResponseEntity.ok(auditSessionService.getElementPerformanceSummary());
    }

}