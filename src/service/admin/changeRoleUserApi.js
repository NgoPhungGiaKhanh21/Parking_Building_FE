import api from "../api";

export const changeRoleUserApi = (data) => {
  return api.patch(`/admin/users/${data.userId}/role`, {
    role: data.role,
  });
};
