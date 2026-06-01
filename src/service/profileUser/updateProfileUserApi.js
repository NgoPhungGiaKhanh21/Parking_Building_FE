import api from "../api";

export const updateProfileUserApi = (formData) => {
  return api.put("/users/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
