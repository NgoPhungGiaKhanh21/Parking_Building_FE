import dayjs from "dayjs";

export const BUILDING_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80";

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
