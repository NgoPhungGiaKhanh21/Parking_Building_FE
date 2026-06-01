import api from "../api";

export const getProfileUserApi = (data) => {
  return api.get("/users/me", data);
};
