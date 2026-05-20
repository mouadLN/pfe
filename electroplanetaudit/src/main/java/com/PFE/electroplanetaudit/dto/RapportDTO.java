package com.PFE.electroplanetaudit.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RapportDTO {

    // Mission info
    private String missionTitle;
    private String adminNom;
    private String adminPrenom;

    // Auditeur info
    private String auditeurNom;
    private String auditeurPrenom;

    // Store info
    private String storeNom;
    private String storeCode;
    private String storeVille;
    private String storeRegion;
    private String storeAdresse;

    // Dates
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    // Score
    private Double noteGlobale;

    // Results
    private List<ElementScoreDTO> scores;

    @Data
    @Builder
    public static class ElementScoreDTO {
        private String elementNom;
        private Integer score;
        private String commentaire;
        private List<String> imageUrls; // max 3
    }
}