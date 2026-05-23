package com.PFE.electroplanetaudit.repository;

import com.PFE.electroplanetaudit.entity.MediaEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MediaEvidenceRepository extends JpaRepository<MediaEvidence, Long> {

    List<MediaEvidence> findByElementScoreId(Long elementScoreId);

    @Query("SELECT m FROM MediaEvidence m WHERE m.elementScore.auditSession.id = :sessionId")
    List<MediaEvidence> findByAuditSessionId(Long sessionId);

    long countByElementScoreId(Long elementScoreId);
}