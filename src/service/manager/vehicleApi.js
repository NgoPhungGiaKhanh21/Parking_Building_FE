import api from "../api";

export const getVehicleManageApi = (userId) => {
  return api.get(`/manager/drivers/${userId}/vehicles`);
};

export const getAllDriverApi = (data) => {
  return api.get("/manager/drivers", data);
};

export const getAllVehicleApi = (data) => {
  return api.get("/manager/vehicles", { params: data });
};

export const changeStatusVehicleApi = (data) => {
  return api.patch(`/manager/vehicles/${data.vehicleId}/status`, {
    status: data.status,
  });
};

export const createVehicleTypeApi = (data) => {
  return api.post("/vehicles/types", data);
};

export const updateVehicleTypeApi = (data) => {
  return api.put(`/vehicles/types/${data.vehicleTypeId}`, data);
};

export const deleteVehicleTypeApi = (data) => {
  return api.delete(`/vehicles/types/${data.vehicleTypeId}`, data);
};
