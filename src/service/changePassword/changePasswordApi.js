import api from "../api";

export const changePasswordApi = (data) => {
  return api.put(`/users/me/password`, {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  });
};
