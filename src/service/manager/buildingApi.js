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

export const updateBuildingStatusApi = (buildingId, status) => {
  return api.patch(`/manager/setup/buildings/${buildingId}/status`, { status });
};

export const getBuildingRulesApi = (buildingId) => {
  return api.get(`/manager/buildings/${buildingId}/rules`);
};

export const createBuildingRuleApi = ({ buildingId, data }) => {
  return api.post(`/manager/buildings/${buildingId}/rules`, data);
};

export const updateBuildingRuleApi = ({ buildingId, ruleId, data }) => {
  return api.put(`/manager/buildings/${buildingId}/rules/${ruleId}`, data);
};

export const deleteBuildingRuleApi = ({ buildingId, ruleId }) => {
  return api.delete(`/manager/buildings/${buildingId}/rules/${ruleId}`);
};

export const getBuildingFloorsApi = (buildingId) => {
  return api.get(`/manager/setup/buildings/${buildingId}/floors`);
};

export const createBuildingFloorApi = (buildingId, data) => {
  return api.post(`/manager/setup/buildings/${buildingId}/floors`, data);
};

export const getVehicleTypesApi = () => {
  return api.get("/vehicles/types");
};

export const updateFloorApi = (floorId, data) => {
  return api.put(`/manager/setup/floors/${floorId}`, data);
};

export const updateFloorStatusApi = (floorId, status) => {
  return api.patch(`/manager/setup/floors/${floorId}/status`, { status });
};

export const getZoneListApi = (floorId, data) => {
  return api.get(`/manager/setup/floors/${floorId}/zones`, data);
};

export const createZoneApi = (floorId, data) => {
  return api.post(`/manager/setup/floors/${floorId}/zones`, data);
};

export const updateZoneStatusApi = (zoneId, status) => {
  return api.patch(`/manager/setup/zones/${zoneId}/status`, { status });
};

export const updateZoneApi = (data) => {
  return api.put(`/manager/setup/zones/${data.zoneId}`, data);
};

export const getSlotListApi = (zoneId, data) => {
  return api.get(`/manager/setup/zones/${zoneId}/slots`, data);
};

export const getOccupiedSlotApi = (data) => {
  return api.get(`/manager/setup/slots/${data.slotId}/occupancy`, data);
}
