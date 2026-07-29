export const normalizePlate = (plate) =>
  String(plate || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

export const platesMatch = (a, b) => normalizePlate(a) === normalizePlate(b);
