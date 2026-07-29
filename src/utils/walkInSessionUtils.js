const pick = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

/** Guest session DTOs use brand/model; reservation DTOs use vehicleBrand/vehicleModel. */
export const mapGuestSessionFields = (session) => {
  if (!session) return session;
  return {
    ...session,
    vehiclePlate: pick(session.vehiclePlate, session.plateNumber),
    vehicleBrand: pick(session.vehicleBrand, session.brand),
    vehicleModel: pick(session.vehicleModel, session.model),
    vehicleColor: pick(session.vehicleColor, session.color),
    sessionStatus: pick(session.sessionStatus, session.status),
    vehicleTypeName: pick(session.vehicleTypeName, session.floorVehicleTypeName),
  };
};
