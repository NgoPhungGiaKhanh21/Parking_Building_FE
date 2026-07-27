export const getStaffId = (staff) =>
  staff?.userId || staff?.staffId || staff?.id;

export const getBuildingName = (building) =>
  building?.name || building?.buildingName || "";

export const getStaffBuildingLabel = (staff) => {
  if (staff?.buildingNames) return staff.buildingNames;

  const single =
    staff?.buildingName || staff?.building?.name || staff?.building?.buildingName;
  if (single) return single;

  const list = staff?.buildings || staff?.assignedBuildings;
  if (Array.isArray(list) && list.length > 0) {
    return list.map(getBuildingName).filter(Boolean).join(", ");
  }

  return "";
};
