import api from "../api";

export const getAllPricingPolicyApi = () => {
  return api.get("/manager/pricing-policy");
};

export const getPricingPolicyByIdApi = (id) => {
  return api.get(`/manager/pricing-policy/${id}`);
};

export const createPricingPolicyApi = (data) => {
  return api.post("/manager/pricing-policy", data);
};

export const updatePricingPolicyApi = ({ id, data }) => {
  return api.put(`/manager/pricing-policy/${id}`, data);
};

export const deletePricingPolicyApi = (id) => {
  return api.delete(`/manager/pricing-policy/${id}`);
};
