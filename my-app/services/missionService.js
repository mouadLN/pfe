import api from "@/lib/axios"

export const missionService = {
  // Get filtered list with pagination
  getFiltered: (params) =>
    api.get("/api/audit-missions/filtered", { params }),

  // Get all missions
  getAll: () =>
    api.get("/api/audit-missions"),

  // Get mission by ID
  getById: (id) =>
    api.get(`/api/audit-missions/${id}`),

  // Get missions by auditor
  getByAuditeur: (userCode) =>
    api.get(`/api/audit-missions/auditeur/me/${userCode}`),

  // Get missions by store
  getByStore: (storeId) =>
    api.get(`/api/audit-missions/store/${storeId}`),

  // Get missions by status
  getByStatus: (status) =>
    api.get(`/api/audit-missions/status/${status}`),

  // Search missions
  search: (keyword) =>
    api.get(`/api/audit-missions/search?keyword=${keyword}`),

  // Create new mission with elements
  create: (data, elementIds) =>
    api.post(`/api/audit-missions?elementIds=${elementIds.join(',')}`, data),

  // Update mission with elements
  update: (id, data, elementIds) =>
    api.put(`/api/audit-missions/${id}?elementIds=${elementIds.join(',')}`, data),

  // Delete mission
  delete: (id) =>
    api.delete(`/api/audit-missions/${id}`),

  // Get statistics
  getStatsByStatus: () =>
    api.get("/api/audit-missions/stats/status"),

  getStatsByStore: () =>
    api.get("/api/audit-missions/stats/store"),

  getStatsByAuditeur: () =>
    api.get("/api/audit-missions/stats/auditeur"),

  // Get upcoming missions
  getUpcoming: () =>
    api.get("/api/audit-missions/upcoming"),
}