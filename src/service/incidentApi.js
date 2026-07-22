import api from "./api";

export const createDriverIncidentApi = (data) =>
  api.post("/incidents/driver", data);

export const getMyDriverIncidentsApi = () =>
  api.get("/incidents/driver/me");

export const getAllDriverIncidentsApi = () =>
  api.get("/incidents/driver/all");

export const getIncidentsBySessionApi = (sessionId) =>
  api.get(`/incidents/by-session/${encodeURIComponent(sessionId)}`);

export const verifyIncidentVehicleApi = ({ incidentId, data }) =>
  api.post(
    `/incidents/${encodeURIComponent(incidentId)}/verify-vehicle`,
    data,
  );

export const validateIncidentReassignApi = ({ incidentId, newSlotId }) =>
  api.post("/incidents/validate-reassign", null, {
    params: { incidentId, newSlotId },
  });

export const getIncidentLatestReservationApi = (incidentId) =>
  api.get(
    `/incidents/${encodeURIComponent(incidentId)}/latest-reservation`,
  );

export const getIncidentAvailableSlotsApi = (incidentId) =>
  api.get(
    `/incidents/${encodeURIComponent(incidentId)}/available-slots-for-reassign`,
  );

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
  const requestBody = checkoutImage ? new FormData() : null;
  if (checkoutImage) requestBody.append("checkoutImage", checkoutImage);

  return api.post("/sessions/driver/checkout", requestBody, {
    params: {
      ...(sessionId ? { sessionId } : {}),
      ...(ticketCode ? { ticketCode } : {}),
    },
  });
};
