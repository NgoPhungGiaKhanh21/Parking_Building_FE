import api from "../api";

export const getVehicleManageApi = (vehicleId) => {
  return api.get(`/manager/vehicles/${vehicleId}`);
};
