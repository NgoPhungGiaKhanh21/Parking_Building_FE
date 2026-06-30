import api from "../api";

export const getAdminDashboardStatsApi = (filters = {}) => {
  const params = {};
  if (filters.fromDay) params.fromDay = filters.fromDay;
  if (filters.toDay) params.toDay = filters.toDay;
  return api.get("/admin/dashboard/stats", { params });
};

