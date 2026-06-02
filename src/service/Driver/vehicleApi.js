import api from "../api";

export const getAllVehiclesApi = (data) => {
  return api.get("/vehicles/me", data);
};

export const getAllVehicleTypesApi = (data) => {
  return api.get("/vehicles/types", data);
};

export const createVehicleApi = (data) => {
  return api.post("/vehicles/me", data);
};

export const getVehicleByIdApi = (data) => {
  return api.get(`/vehicles/me/${data.vehicleId}`, data);
};

export const updateVehicleApi = (data) => {
  return api.put(`/vehicles/me/${data.vehicleId}`, data);
};

export const deleteVehicleApi = (data) => {
  return api.delete(`/vehicles/me/${data.vehicleId}`, data);
};
