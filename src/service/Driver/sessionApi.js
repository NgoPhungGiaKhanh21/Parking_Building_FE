import api from "../api";

export const getCurrentSessionApi = () => {
    return api.get("/users/me/sessions/current");
}