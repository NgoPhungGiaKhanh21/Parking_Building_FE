import dayjs from "dayjs";

export const getPolicyId = (policy) => policy?.policyId || policy?.id;
export const getVehicleTypeName = (policy) => policy?.typeName || policy?.vehicleTypeName || "—";

export const formatCurrency = (value) =>
  value != null ? `${Number(value).toLocaleString("vi-VN")} đ` : "—";

export const formatDateTime = (value) =>
  value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";

export const toApiDateTime = (value) =>
  value ? dayjs(value).toISOString() : null;

export const toDayjs = (value) => (value ? dayjs(value) : null);

const toNumber = (value, fallback = 0) =>
  value === undefined || value === null || value === "" ? fallback : Number(value);

export const buildPolicyPayload = (values) => ({
  vehicleTypeId: values.vehicleTypeId,
  policyName: values.policyName?.trim(),
  basePrice: toNumber(values.basePrice),
  hourlyRate: toNumber(values.hourlyRate),
  maxHours: toNumber(values.maxHours),
  effectiveFrom: toApiDateTime(values.effectiveFrom),
  effectiveTo: toApiDateTime(values.effectiveTo),
  status: values.status,
});

export const mapPolicyToForm = (policy) => ({
  vehicleTypeId: policy?.vehicleTypeId,
  policyName: policy?.policyName || "",
  basePrice: policy?.basePrice,
  hourlyRate: policy?.hourlyRate,
  maxHours: policy?.maxHours,
  effectiveFrom: toDayjs(policy?.effectiveFrom),
  effectiveTo: toDayjs(policy?.effectiveTo),
  status: policy?.status || "ACTIVE",
});
