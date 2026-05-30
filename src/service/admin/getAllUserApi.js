import api from "../api";

export const getAllUserApi = (data) => {
  return api.get("/admin/users", { params: data });
};
