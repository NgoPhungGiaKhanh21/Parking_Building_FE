import api from "./api";

export const createDriverIncidentApi = (data) =>
  api.post("/incidents/driver", data);

export const getMyDriverIncidentsApi = () =>
  api.get("/incidents/driver/me");

export const getAllDriverIncidentsApi = () =>
  api.get("/incidents/driver/all");

export const getIncidentsBySessionApi = (sessionId) =>
  api.get(`/incidents/by-session/${encodeURIComponent(sessionId)}`);

export const updateIncidentStatusApi = ({
  incidentId,
  status,
  data = {},
}) =>
  api.put(
    `/incidents/${encodeURIComponent(incidentId)}/status`,
    data,
    { params: { status } },
  );

export const checkoutDriverAfterIncidentApi = ({
  sessionId,
  ticketCode,
  checkoutImage,
}) => {
  const formData = new FormData();
  if (checkoutImage) formData.append("checkoutImage", checkoutImage);

  return api.post("/sessions/driver/checkout", formData, {
    params: {
      ...(sessionId ? { sessionId } : {}),
      ...(ticketCode ? { ticketCode } : {}),
    },
    headers: { "Content-Type": "multipart/form-data" },
  });
};
