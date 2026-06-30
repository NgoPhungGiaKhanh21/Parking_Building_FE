import api from "../api";

export const getAdminDashboardStatsApi = (filters = {}) => {
  const params = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  return api.get("/admin/dashboard/stats", { params });
};

