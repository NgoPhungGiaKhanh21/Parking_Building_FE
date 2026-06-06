import api from "../api";

export const getAllStaffApi = () => {
  return api.get("/manager/staff");
};

export const getStaffBuildingsApi = (userId) => {
  return api.get(`/manager/staff/${userId}/buildings`);
};

export const getBuildingStaffApi = (buildingId) => {
  return api.get(`/manager/buildings/${buildingId}/staff`);
};

export const postStaffToBuildingApi = ({ buildingId, userId }) => {
  return api.post(`/manager/buildings/${buildingId}/staff`, { userId });
};

export const removeStaffFromBuildingApi = ({ buildingId, userId }) => {
  return api.delete(`/manager/buildings/${buildingId}/staff/${userId}`);
};
