import api from "../api";

export const getAllVehiclesApi = (data) => {
  return api.get("/vehicles/me", data);
};

export const getAllVehicleTypesApi = (data) => {
  return api.get("/vehicles/types", data);
};

export const createVehicleApi = (data) => {
  // If data is FormData, headers are automatically set by axios
  return api.post("/vehicles/me", data);
};

export const getVehicleByIdApi = (data) => {
  return api.get(`/vehicles/me/${data.vehicleId}`, data);
};

export const updateVehicleApi = (formData) => {
  const vehicleId = formData.get("vehicleId");
  return api.put(`/vehicles/me/${vehicleId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteVehicleApi = (data) => {
  return api.delete(`/vehicles/me/${data.vehicleId}`, data);
};
