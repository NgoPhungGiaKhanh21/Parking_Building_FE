import api from "../api";

export const getRevenueApi = (filters = {}) => {
  const params = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  return api.get("/manager/dashboard/revenue", { params });
};