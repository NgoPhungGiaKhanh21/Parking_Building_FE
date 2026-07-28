import { normalizePlate, platesMatch } from "./plateUtils";

const WALKIN_DRIVER_CACHE_PREFIX = "walkInDriver:";
const WALKIN_DRIVER_TICKET_PREFIX = "walkInDriverTicket:";

const pick = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

export const saveWalkInDriverCache = (plateNumber, info = {}) => {
  const plate = normalizePlate(plateNumber);
  if (!plate) return;

  const payload = {
    driverUsername: pick(info.driverUsername, info.username),
    driverFullName: pick(
      info.driverFullName,
      info.ownerFullName,
      info.fullName,
      info.driverUsername,
      info.username,
    ),
    driverUserId: pick(info.driverUserId, info.userId),
    ticketCode: info.ticketCode,
  };

  if (!payload.driverUsername && !payload.driverFullName) return;

  sessionStorage.setItem(
    `${WALKIN_DRIVER_CACHE_PREFIX}${plate}`,
    JSON.stringify(payload),
  );

  if (payload.ticketCode) {
    sessionStorage.setItem(
      `${WALKIN_DRIVER_TICKET_PREFIX}${payload.ticketCode}`,
      JSON.stringify(payload),
    );
  }
};

export const readWalkInDriverCache = (plateNumber, ticketCode) => {
  const readKey = (key) => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const plate = normalizePlate(plateNumber);
  if (plate) {
    const byPlate = readKey(`${WALKIN_DRIVER_CACHE_PREFIX}${plate}`);
    if (byPlate) return byPlate;
  }

  if (ticketCode) {
    return readKey(`${WALKIN_DRIVER_TICKET_PREFIX}${ticketCode}`);
  }

  return null;
};

export const mergeDriverInfo = (session, driverInfo) => {
  if (!session || !driverInfo) return session;
  return {
    ...session,
    checkinType: session.checkinType || "DRIVER_WALK_IN",
    driverUsername: pick(
      session.driverUsername,
      driverInfo.driverUsername,
      driverInfo.username,
    ),
    driverFullName: pick(
      session.driverFullName,
      driverInfo.driverFullName,
      driverInfo.ownerFullName,
      driverInfo.fullName,
      driverInfo.driverUsername,
      driverInfo.username,
    ),
    driverUserId: pick(session.driverUserId, driverInfo.driverUserId, driverInfo.userId),
  };
};

/** GuestCheckinResponse uses brand/model; other DTOs use vehicleBrand/vehicleModel. */
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

/**
 * Driver walk-in vs guest walk-in (FE-only, no BE change):
 * - BE returns both as GUEST_SESSION / G- ticket via guest session API.
 * - Driver walk-in uses registered Vehicle (brand + model in DB).
 * - Guest walk-in creates a minimal Vehicle (usually no brand/model).
 */
export const isDriverWalkInSession = (session, lookupPayload = null) => {
  if (!session) return false;

  const normalized = mapGuestSessionFields(session);

  if (normalized.checkinType === "DRIVER_WALK_IN") return true;
  if (normalized.driverUsername || normalized.driverUserId) return true;

  const rv = lookupPayload?.registeredVehicle;
  if (rv?.userId || rv?.username) return true;
  if (lookupPayload?.lookupType === "DRIVER_WALK_IN") return true;

  const brand = normalized.vehicleBrand;
  const model = normalized.vehicleModel;
  const hasRegisteredVehicleProfile = Boolean(brand && model);
  const noGuestContact = !normalized.guestName && !normalized.guestPhone;

  return hasRegisteredVehicleProfile && noGuestContact;
};

export const enrichSessionFromPlateLookup = (lookupPayload) => {
  if (!lookupPayload?.guestSession) return null;

  const session = mapGuestSessionFields(lookupPayload.guestSession);
  const rv = lookupPayload.registeredVehicle;

  if (!isDriverWalkInSession(session, lookupPayload)) {
    return session;
  }

  const cached = readWalkInDriverCache(
    session.vehiclePlate,
    session.ticketCode,
  );

  return mergeDriverInfo(
    {
      ...session,
      vehicleBrand: pick(session.vehicleBrand, rv?.brand, rv?.vehicleBrand),
      vehicleModel: pick(session.vehicleModel, rv?.model, rv?.vehicleModel),
      vehicleColor: pick(session.vehicleColor, rv?.vehicleColor, rv?.color),
    },
    {
      driverUsername: pick(rv?.username, rv?.driverUsername, cached?.driverUsername),
      driverFullName: pick(
        rv?.ownerFullName,
        rv?.driverFullName,
        cached?.driverFullName,
      ),
      driverUserId: pick(rv?.userId, cached?.driverUserId),
    },
  );
};

export const buildDriverPlateIndex = (reservations) => {
  const index = new Map();
  if (!Array.isArray(reservations)) return index;

  reservations.forEach((r) => {
    if (!r?.vehiclePlate || !r?.username) return;
    index.set(normalizePlate(r.vehiclePlate), {
      username: r.username,
      fullName: pick(r.driverFullName, r.fullName, r.username),
    });
  });

  return index;
};

export const getDriverInfoFromPlateIndex = (plate, driverPlateIndex) => {
  if (!plate || !driverPlateIndex?.size) return null;
  return driverPlateIndex.get(normalizePlate(plate)) ?? null;
};

export const isKnownDriverPlate = (plate, driverPlateIndex) =>
  Boolean(getDriverInfoFromPlateIndex(plate, driverPlateIndex));

export const platesMatchReservation = (plate, reservationPlate) =>
  platesMatch(plate, reservationPlate);

export const mapManagerVehicleToRegistered = (vehicle) => {
  if (!vehicle) return null;
  return {
    vehicleId: vehicle.vehicleId,
    userId: vehicle.userId,
    username: vehicle.username,
    driverUsername: vehicle.username,
    ownerFullName: pick(vehicle.ownerFullName, vehicle.username),
    driverFullName: pick(vehicle.ownerFullName, vehicle.username),
    plateNumber: vehicle.plateNumber,
    vehiclePlate: vehicle.plateNumber,
    brand: vehicle.brand,
    model: vehicle.model,
    vehicleBrand: vehicle.brand,
    vehicleModel: vehicle.model,
    vehicleColor: vehicle.vehicleColor,
    color: vehicle.vehicleColor,
    vehicleTypeId: vehicle.vehicleTypeId,
    vehicleTypeName: vehicle.vehicleTypeName,
    typeName: vehicle.vehicleTypeName,
    floorVehicleTypeId: vehicle.vehicleTypeId,
  };
};

export const mapReservationToRegisteredVehicle = (reservation) => {
  if (!reservation?.vehiclePlate || !reservation?.username) return null;
  return {
    plateNumber: reservation.vehiclePlate,
    vehiclePlate: reservation.vehiclePlate,
    username: reservation.username,
    driverUsername: reservation.username,
    ownerFullName: reservation.username,
    driverFullName: reservation.username,
    brand: reservation.vehicleBrand,
    model: reservation.vehicleModel,
    vehicleBrand: reservation.vehicleBrand,
    vehicleModel: reservation.vehicleModel,
    vehicleColor: reservation.vehicleColor,
    color: reservation.vehicleColor,
    vehicleTypeId: reservation.floorVehicleTypeId,
    vehicleTypeName: pick(
      reservation.floorVehicleTypeName,
      reservation.vehicleTypeName,
    ),
    typeName: pick(reservation.floorVehicleTypeName, reservation.vehicleTypeName),
    floorVehicleTypeId: reservation.floorVehicleTypeId,
  };
};

export const resolveRegisteredVehicleFromReservations = (
  plateNumber,
  reservations,
) => {
  const plate = normalizePlate(plateNumber);
  if (!plate) return null;

  const match = (Array.isArray(reservations) ? reservations : []).find(
    (item) =>
      normalizePlate(item?.vehiclePlate) === plate && item?.username,
  );

  return mapReservationToRegisteredVehicle(match);
};
