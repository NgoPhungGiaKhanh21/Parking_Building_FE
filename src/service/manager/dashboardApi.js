import api from "../api";

const buildDashboardParams = (filters = {}) => {
  const params = {};
  if (filters.fromDay) params.fromDay = filters.fromDay;
  if (filters.toDay) params.toDay = filters.toDay;
  if (filters.buildingId) params.buildingId = filters.buildingId;
  return params;
};

export const getManagerDashboardStatsApi = (filters = {}) =>
  api.get("/manager/dashboard/stats", { params: buildDashboardParams(filters) });

export const getManagerPeakHoursApi = (filters = {}) =>
  api.get("/manager/dashboard/peak-hours", { params: buildDashboardParams(filters) });
