import dayjs from "dayjs";

export const getPolicyId = (policy) => policy?.policyId || policy?.id;
export const getVehicleTypeName = (policy) => policy?.typeName || "—";

export const formatCurrency = (value) =>
  value != null ? `${Number(value).toLocaleString("vi-VN")} đ` : "—";

export const formatDateTime = (value) =>
  value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";

export const toApiDateTime = (value) =>
  value ? dayjs(value).format("YYYY-MM-DDTHH:mm:ss") : null;

export const toDayjs = (value) => (value ? dayjs(value) : null);

export const buildPolicyPayload = (values) => ({
  vehicleTypeId: values.vehicleTypeId,
  policyName: values.policyName?.trim(),
  pricingType: values.pricingType,
  basePrice: values.basePrice,
  hourlyRate: values.hourlyRate,
  overnightFee: values.overnightFee,
  lostTicketFee: values.lostTicketFee,
  peakHourMultiplier: values.peakHourMultiplier,
  maxDailyFee: values.maxDailyFee,
  effectiveFrom: toApiDateTime(values.effectiveFrom),
  effectiveTo: toApiDateTime(values.effectiveTo),
  status: values.status,
});

export const mapPolicyToForm = (policy) => ({
  vehicleTypeId: policy?.vehicleTypeId,
  policyName: policy?.policyName || "",
  pricingType: policy?.pricingType || undefined,
  basePrice: policy?.basePrice,
  hourlyRate: policy?.hourlyRate,
  overnightFee: policy?.overnightFee,
  lostTicketFee: policy?.lostTicketFee,
  peakHourMultiplier: policy?.peakHourMultiplier,
  maxDailyFee: policy?.maxDailyFee,
  effectiveFrom: toDayjs(policy?.effectiveFrom),
  effectiveTo: toDayjs(policy?.effectiveTo),
  status: policy?.status || "ACTIVE",
});
