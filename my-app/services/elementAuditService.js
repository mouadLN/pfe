import api from "@/lib/axios"

export const elementAuditService = {
  // Get filtered list with pagination
  getFiltered: (params) =>
    api.get("/api/audit-elements/filtered", { params }),

  // Get all elements (without pagination)
  getAll: () =>
    api.get("/api/audit-elements"),

  // Get active elements only
  getActive: () =>
    api.get("/api/audit-elements/active"),

  // Get element by ID
  getById: (id) =>
    api.get(`/api/audit-elements/${id}`),

  // Create new element
  create: (data) =>
    api.post("/api/audit-elements", data),

  // Full update element
  update: (id, data) =>
    api.put(`/api/audit-elements/${id}`, data),

  // Delete element
  delete: (id) =>
    api.delete(`/api/audit-elements/${id}`),

  // Get stats (active/inactive counts)
  getStats: () =>
    api.get("/api/audit-elements/stats/actif-status"),
}