import api from "../api";

export const changeRoleUserApi = (data) => {
  return api.put(`/admin/users/${data.userId}/role?role=${data.role}`);
};
