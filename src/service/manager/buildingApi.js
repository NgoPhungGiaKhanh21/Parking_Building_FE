import api from "../api";

export const createBuildingApi = (data) => {
  return api.post("/manager/setup/buildings", data);
};

export const getBuildingListApi = () => {
  return api.get("/manager/setup/buildings");
};

export const getBuildingDetailApi = (buildingId) => {
  return api.get(`/manager/setup/buildings/${buildingId}`);
};

export const updateBuildingApi = (buildingId, data) => {
  return api.put(`/manager/setup/buildings/${buildingId}`, data);
};

export const getBuildingFloorsApi = (buildingId) => {
  return api.get(`/manager/setup/buildings/${buildingId}/floors`);
};

export const createBuildingFloorApi = (buildingId, data) => {
  return api.post(`/manager/setup/buildings/${buildingId}/floors`, data);
};

export const getVehicleTypesApi = () => {
  return api.get("/manager/setup/vehicle-types");
};

export const updateFloorApi = (floorId, data) => {
  return api.put(`/manager/setup/floors/${floorId}`, data);
};
