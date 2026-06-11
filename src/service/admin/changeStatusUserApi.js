import api from "../api";

export const changeStatusUserApi = (data) => {
  return api.patch(`/admin/users/${data.userId}/status?status=${data.status}`);
};
