package com.PFE.electroplanetaudit.service;

import com.PFE.electroplanetaudit.dto.RapportDTO;
import com.PFE.electroplanetaudit.entity.*;
import com.PFE.electroplanetaudit.repository.AuditSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final AuditSessionRepository auditSessionRepository;
    private final TemplateEngine templateEngine;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // Base uploads directory — absolute path
    private static final String PROJECT_BASE = System.getProperty("user.dir") + "/";

    private String getLogoBase64() {
        try {
            ClassPathResource resource = new ClassPathResource("static/images/logo.png");
            byte[] bytes = resource.getInputStream().readAllBytes();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            System.out.println("Could not load logo: " + e.getMessage());
            return "";
        }
    }

    private String loadImageAsBase64(String imageUrl) {
        try {
            // Strip http://localhost:8080/ to get: uploads/images/filename.jpg
            // Then use UPLOADS_BASE which already points to the uploads folder
            // So we only need the part AFTER "uploads/"
            String relativePath = imageUrl.replaceFirst("http://localhost:\\d+/", "");
            Path path = Paths.get(PROJECT_BASE + relativePath);

            System.out.println("Loading image from: " + path.toAbsolutePath());

            if (Files.exists(path)) {
                byte[] bytes = Files.readAllBytes(path);
                String fileName = path.getFileName().toString().toLowerCase();
                String mimeType;
                if (fileName.endsWith(".png")) mimeType = "image/png";
                else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
                else mimeType = "image/jpeg";
                return "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(bytes);
            } else {
                System.out.println("Image not found at: " + path.toAbsolutePath());
            }
        } catch (Exception e) {
            System.out.println("Could not load image: " + imageUrl + " - " + e.getMessage());
        }
        return "";
    }

    @Transactional
    public byte[] generateRapport(Long missionId) {
        AuditSession session = auditSessionRepository
                .findFirstByMissionIdWithScores(missionId)
                .orElseThrow(() -> new RuntimeException("Session not found for mission: " + missionId));

        if (session.getStatut() != SessionStatus.TERMINE) {
            throw new RuntimeException("Mission is not completed yet.");
        }

        RapportDTO rapport = buildRapportDTO(session);

        Context context = new Context();
        context.setVariable("rapport", rapport);
        context.setVariable("logoBase64", getLogoBase64());
        String html = templateEngine.process("rapport", context);

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage());
        }
    }

    private RapportDTO buildRapportDTO(AuditSession session) {
        List<Long> missionElementIds = session.getMission().getAuditElements()
                .stream()
                .map(AuditElement::getId)
                .collect(Collectors.toList());

        System.out.println("Mission elements count: " + missionElementIds.size());
        System.out.println("Session scores count: " + session.getScores().size());
        System.out.println("UPLOADS_BASE: " + PROJECT_BASE);

        List<RapportDTO.ElementScoreDTO> scoreDTOs = session.getScores().stream()
                .filter(score -> score.getScore() != null)
                .filter(score -> missionElementIds.contains(score.getAuditElement().getId()))
                .map(score -> {
                    List<String> images = score.getMediaEvidences().stream()
                            .map(media -> loadImageAsBase64(media.getImageUrl()))
                            .filter(base64 -> !base64.isEmpty())
                            .limit(3)
                            .collect(Collectors.toList());

                    return RapportDTO.ElementScoreDTO.builder()
                            .elementNom(score.getAuditElement().getNom())
                            .score(score.getScore())
                            .commentaire(score.getCommentaire())
                            .imageUrls(images)
                            .build();
                })
                .collect(Collectors.toList());

        System.out.println("Filtered scores count: " + scoreDTOs.size());

        return RapportDTO.builder()
                .missionTitle(session.getMission().getTitle())
                .adminNom(session.getMission().getAdministrateur() != null ? session.getMission().getAdministrateur().getNom() : "-")
                .adminPrenom(session.getMission().getAdministrateur() != null ? session.getMission().getAdministrateur().getPrenom() : "")
                .auditeurNom(session.getAuditeur().getNom())
                .auditeurPrenom(session.getAuditeur().getPrenom())
                .storeNom(session.getStore().getNom())
                .storeCode(session.getStore().getCode())
                .storeVille(session.getStore().getVille())
                .storeRegion(session.getStore().getRegion())
                .storeAdresse(session.getStore().getAdresse())
                .dateDebut(session.getDateDebut())
                .dateFin(session.getDateFin())
                .noteGlobale(session.getNoteGlobale())
                .scores(scoreDTOs)
                .build();
    }
}