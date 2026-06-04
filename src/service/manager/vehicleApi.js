import api from "../api";

export const getVehicleManageApi = (userId) => {
  return api.get(`/manager/drivers/${userId}/vehicles`);
};

export const getAllDriverApi = (data) => {
  return api.get("/manager/drivers", data);
};

export const changeStatusVehicleApi = (data) => {
  return api.patch(`/manager/vehicles/${data.vehicleId}/status`, {
    status: data.status,
  });
};
