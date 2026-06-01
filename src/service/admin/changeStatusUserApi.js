import api from "../api";

export const changeStatusUserApi = (data) => {
  return api.put(`/admin/users/${data.userId}/status`, {
    status: data.status,
  });
};
