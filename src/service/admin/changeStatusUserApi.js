import api from "../api";

export const changeStatusUserApi = (data) => {
  // Trích xuất userId và status từ biến data
  return api.patch(`/admin/users/${data.userId}/status?status=${data.status}`);
};
