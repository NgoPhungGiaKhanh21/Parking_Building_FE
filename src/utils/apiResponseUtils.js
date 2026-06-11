export const extractApiList = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

export const extractApiData = (response) => {
  const body = response?.data;
  if (body && typeof body === "object" && "data" in body) {
    return body.data ?? null;
  }
  return body ?? null;
};
