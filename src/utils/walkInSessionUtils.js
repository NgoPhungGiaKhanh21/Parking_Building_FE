import { normalizePlate } from "./plateUtils";

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
 * Driver walk-in vs guest walk-in at checkout.
 * Prefer lookupType WALK_IN_DRIVER from plate lookup; fallback heuristics for legacy guest sessions.
 */
export const isDriverWalkInSession = (session, lookupPayload = null) => {
  if (!session) return false;

  const normalized = mapGuestSessionFields(session);

  if (normalized.checkinType === "DRIVER_WALK_IN") return true;
  if (normalized.driverUsername || normalized.driverUserId) return true;

  const rv = lookupPayload?.registeredVehicle || lookupPayload?.vehicle;
  if (rv?.userId || rv?.username || rv?.driverFullName) return true;
  if (
    lookupPayload?.lookupType === "DRIVER_WALK_IN" ||
    lookupPayload?.lookupType === "WALK_IN_DRIVER"
  ) {
    return true;
  }

  const brand = normalized.vehicleBrand;
  const model = normalized.vehicleModel;
  const hasRegisteredVehicleProfile = Boolean(brand && model);
  const noGuestContact = !normalized.guestName && !normalized.guestPhone;

  return hasRegisteredVehicleProfile && noGuestContact;
};

export const enrichSessionFromPlateLookup = (lookupPayload) => {
  if (!lookupPayload?.guestSession) return null;

  const session = mapGuestSessionFields(lookupPayload.guestSession);
  const rv = lookupPayload.registeredVehicle || lookupPayload.vehicle;

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
