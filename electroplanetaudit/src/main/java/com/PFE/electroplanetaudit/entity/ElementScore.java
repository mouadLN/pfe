package com.PFE.electroplanetaudit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "element_scores")
@Data
@EqualsAndHashCode(exclude = {"auditSession", "auditElement", "mediaEvidences"}) // ← ADD
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElementScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer score;

    @Column(length = 500)
    private String commentaire;

    @JsonIgnoreProperties("scores")
    @ManyToOne
    @JoinColumn(name = "audit_session_id", nullable = false)
    private AuditSession auditSession;

    @JsonIgnoreProperties({"elementScores", "auditMissions"}) // ← ADD
    @ManyToOne
    @JoinColumn(name = "audit_element_id", nullable = false)
    private AuditElement auditElement;

    @OneToMany(mappedBy = "elementScore", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"elementScore"})
    private Set<MediaEvidence> mediaEvidences = new HashSet<>();
}