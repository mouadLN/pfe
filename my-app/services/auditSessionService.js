import api from "@/lib/axios";

export const auditSessionService = {
    startFromMission: (missionId, auditeurId) =>
        api.post(`/api/audit-sessions/start-from-mission?missionId=${missionId}&auditeurId=${auditeurId}`),
    
    getByMission: (missionId, auditeurId) =>
        api.get(`/api/audit-sessions/mission/${missionId}?auditeurId=${auditeurId}`),
    
    getScores: (sessionId) =>
        api.get(`/api/audit-sessions/${sessionId}/scores`),
    
    gradeElement: (sessionId, elementId, score, commentaire) =>
        api.put(`/api/audit-sessions/${sessionId}/grade?elementId=${elementId}&score=${score}&commentaire=${commentaire || ""}`),
    
    gradeBatch: (sessionId, grades) =>
        api.put(`/api/audit-sessions/${sessionId}/grade-batch`, grades),
    
    submitAudit: (sessionId) =>
        api.patch(`/api/audit-sessions/${sessionId}/submit`),
    
    uploadImages: (sessionId, elementId, formData) =>
        api.post(`/api/audit-sessions/${sessionId}/upload-images?elementId=${elementId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    
    removeImage: (sessionId, elementId, imageIndex) =>
        api.delete(`/api/audit-sessions/${sessionId}/images/${elementId}?imageIndex=${imageIndex}`),
};