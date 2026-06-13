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

export const TIER_PRICING_CONFIG = [
  {
    hours: "tier1Hours",
    price: "tier1Price",
    rangeLabel: "≤ 2 giờ",
    description: "Gửi trong 2 giờ đầu",
    hoursLabel: "Mốc giờ tối đa",
    priceLabel: "Phí áp dụng",
  },
  {
    hours: "tier2Hours",
    price: "tier2Price",
    rangeLabel: "> 2h – 6h",
    description: "Trên 2 giờ, đến 6 giờ",
    hoursLabel: "Mốc giờ đến",
    priceLabel: "Phí áp dụng",
  },
  {
    hours: "tier3Hours",
    price: "tier3Price",
    rangeLabel: "> 6h – 12h",
    description: "Trên 6 giờ, đến 12 giờ",
    hoursLabel: "Mốc giờ đến",
    priceLabel: "Phí áp dụng",
  },
  {
    hours: "tier4Hours",
    price: "tier4Price",
    rangeLabel: "> 12h – 24h",
    description: "Trên 12 giờ, đến 24 giờ",
    hoursLabel: "Mốc giờ đến",
    priceLabel: "Phí áp dụng",
  },
];

export const formatTierDetail = (policy, tier) => {
  const hours = policy?.[tier.hours] ?? 0;
  const price = formatCurrency(policy?.[tier.price]);
  return `${tier.rangeLabel}: tối đa ${hours}h → ${price}`;
};

const toNumber = (value, fallback = 0) =>
  value === undefined || value === null || value === "" ? fallback : Number(value);

export const buildPolicyPayload = (values) => ({
  vehicleTypeId: values.vehicleTypeId,
  policyName: values.policyName?.trim(),
  pricingType: values.pricingType,
  basePrice: toNumber(values.basePrice),
  hourlyRate: toNumber(values.hourlyRate),
  overnightFee: toNumber(values.overnightFee),
  lostTicketFee: toNumber(values.lostTicketFee),
  peakHourMultiplier: toNumber(values.peakHourMultiplier),
  maxDailyFee: toNumber(values.maxDailyFee),
  effectiveFrom: toApiDateTime(values.effectiveFrom),
  effectiveTo: toApiDateTime(values.effectiveTo),
  status: values.status,
  tier1Hours: toNumber(values.tier1Hours),
  tier1Price: toNumber(values.tier1Price),
  tier2Hours: toNumber(values.tier2Hours),
  tier2Price: toNumber(values.tier2Price),
  tier3Hours: toNumber(values.tier3Hours),
  tier3Price: toNumber(values.tier3Price),
  tier4Hours: toNumber(values.tier4Hours),
  tier4Price: toNumber(values.tier4Price),
  perDayPrice: toNumber(values.perDayPrice),
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
  tier1Hours: policy?.tier1Hours,
  tier1Price: policy?.tier1Price,
  tier2Hours: policy?.tier2Hours,
  tier2Price: policy?.tier2Price,
  tier3Hours: policy?.tier3Hours,
  tier3Price: policy?.tier3Price,
  tier4Hours: policy?.tier4Hours,
  tier4Price: policy?.tier4Price,
  perDayPrice: policy?.perDayPrice,
});
