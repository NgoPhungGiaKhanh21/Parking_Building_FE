import dayjs from "dayjs";

export const BUILDING_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80";

export const ZONE_FLOOR_BANNER_IMAGE =
  "https://www.drcipy.com/wp-content/uploads/2025/02/five-durable-options-for-high-traffic-car-parking-flooring-areas-banner.jpg";

export const formatTime = (timeValue) => {
  if (!timeValue) return "N/A";
  if (typeof timeValue === "string") return timeValue;
  if (typeof timeValue === "object" && timeValue.hour !== undefined) {
    const hour = String(timeValue.hour ?? 0).padStart(2, "0");
    const minute = String(timeValue.minute ?? 0).padStart(2, "0");
    const second = String(timeValue.second ?? 0).padStart(2, "0");
    return `${hour}:${minute}:${second}`;
  }
  return "N/A";
};

export const createTimeValue = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const [hour = "0", minute = "0", second = "0"] = value.split(":");
    return dayjs()
      .hour(Number(hour))
      .minute(Number(minute))
      .second(Number(second));
  }
  if (typeof value === "object" && value.hour !== undefined) {
    return dayjs()
      .hour(Number(value.hour || 0))
      .minute(Number(value.minute || 0))
      .second(Number(value.second || 0));
  }
  return null;
};

const ZONE_DISPLAY_EXCLUDED_KEYS = new Set([
  "id",
  "parentId",
  "type",
  "createdAt",
  "updatedAt",
]);

const ZONE_FIELD_LABELS = {
  name: "Name",
  level: "Level",
  maxCapacity: "Max Capacity",
  currentOccupancy: "Current Occupancy",
  slotCount: "Slot Count",
  status: "Status",
  vehicleTypeName: "Vehicle Type",
  note: "Note",
  address: "Address",
  contactNumber: "Contact Number",
};

export const isActiveStatus = (status) =>
  String(status || "").toUpperCase() === "ACTIVE";

export const floorNameToSlug = (name) => {
  if (!name || typeof name !== "string") return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
};

export const formatZoneFieldLabel = (key) =>
  ZONE_FIELD_LABELS[key] ||
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

export const pickZoneDisplayFields = (zone) => {
  if (!zone || typeof zone !== "object") return [];

  return Object.entries(zone)
    .filter(
      ([key, value]) =>
        !ZONE_DISPLAY_EXCLUDED_KEYS.has(key) &&
        value !== null &&
        value !== undefined &&
        value !== "",
    )
    .map(([key, value]) => ({
      key,
      label: formatZoneFieldLabel(key),
      value,
    }));
};

export const FLOOR_CONTEXT_STORAGE_PREFIX = "manager:floor:";

export const sumZoneCapacities = (zones) =>
  (Array.isArray(zones) ? zones : []).reduce(
    (total, zone) => total + (Number(zone?.maxCapacity) || 0),
    0
  );

export const splitIntoTwoColumns = (items) => {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return [[], []];
  const mid = Math.ceil(list.length / 2);
  return [list.slice(0, mid), list.slice(mid)];
};

const compareSlotNamesNatural = (a, b) => {
  const partsA = String(a).split(/(\d+)/);
  const partsB = String(b).split(/(\d+)/);
  const length = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < length; i += 1) {
    const partA = partsA[i] ?? "";
    const partB = partsB[i] ?? "";
    const numA = Number(partA);
    const numB = Number(partB);
    const bothNumeric = partA !== "" && partB !== "" && !Number.isNaN(numA) && !Number.isNaN(numB);

    if (bothNumeric && numA !== numB) return numA - numB;
    if (partA !== partB) return partA.localeCompare(partB, undefined, { sensitivity: "base" });
  }

  return 0;
};

export const mapSlotNames = (slots) =>
  (Array.isArray(slots) ? slots : [])
    .map((slot) => slot?.name)
    .filter(Boolean)
    .sort(compareSlotNamesNatural);

export const sortSlotsNatural = (slots) =>
  [...(Array.isArray(slots) ? slots : [])].sort((a, b) =>
    compareSlotNamesNatural(a?.name, b?.name)
  );

export const splitSlotsIntoTwoRows = (slots) => {
  const sorted = sortSlotsNatural(slots);
  if (sorted.length === 0) return [[], []];
  const mid = Math.ceil(sorted.length / 2);
  return [sorted.slice(0, mid), sorted.slice(mid)];
};

export const normalizeSlotStatus = (status) => {
  const value = String(status || "AVAILABLE").toUpperCase();
  if (value === "OCCUPIED") return "OCCUPIED";
  if (value === "RESERVED" || value === "REVERSE") return "RESERVED";
  if (value === "MAINTENANCE") return "MAINTENANCE";
  return "AVAILABLE";
};

export const getRemainingFloorCapacity = (floorMaxCapacity, zones) => {
  const capacity = Number(floorMaxCapacity);
  if (!Number.isFinite(capacity) || capacity < 0) return 0;
  return Math.max(capacity - sumZoneCapacities(zones), 0);
};

export const mapVehicleTypeOptions = (vehicleTypes) =>
  (Array.isArray(vehicleTypes) ? vehicleTypes : [])
    .map((item) => {
      const value =
        item?.vehicleTypeId ||
        item?.id ||
        item?.vehicleTypeID ||
        item?.vehicle_type_id ||
        item?.code;
      const label =
        item?.vehicleTypeName ||
        item?.name ||
        item?.typeName ||
        item?.vehicleType ||
        item?.code;

      if (!value) return null;
      return { value, label: label || value };
    })
    .filter(Boolean);
