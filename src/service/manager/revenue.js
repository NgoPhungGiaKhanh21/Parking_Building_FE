import api from "../api";

export const getRevenueApi = (data) => {
    return api.get("/manager/dashboard/revenue", data);
}