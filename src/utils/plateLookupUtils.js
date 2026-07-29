import { normalizeReservation } from "./reservationSessionUtils";
import { mapGuestSessionFields } from "./walkInSessionUtils";

export const PLATE_LOOKUP_TYPES = {
  RESERVATION: "RESERVATION",
  DRIVER_SESSION: "DRIVER_SESSION",
  WALK_IN_DRIVER: "WALK_IN_DRIVER",
  NOT_FOUND: "NOT_FOUND",
  GUEST_SESSION: "GUEST_SESSION",
  ALREADY_CHECKED_IN: "ALREADY_CHECKED_IN",
};

/** Map BE lookup `vehicle` field to FE registered-driver shape. */
export const mapApiVehicleToRegistered = (vehicle) => {
  if (!vehicle) return null;
  return {
    vehicleId: vehicle.vehicleId,
    userId: vehicle.userId,
    username: vehicle.username,
    driverUsername: vehicle.username,
    driverFullName: vehicle.driverFullName,
    ownerFullName: vehicle.driverFullName,
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
    driverPhone: vehicle.driverPhone,
    driverEmail: vehicle.driverEmail,
  };
};

export const normalizePlateLookupResponse = (raw) => {
  const data = raw?.data ?? raw;
  if (!data || typeof data !== "object") {
    return {
      lookupType: PLATE_LOOKUP_TYPES.NOT_FOUND,
      reservation: null,
      vehicle: null,
      guestSession: null,
      duplicateActiveSession: null,
    };
  }

  let lookupType = data.lookupType || PLATE_LOOKUP_TYPES.NOT_FOUND;
  if (data.guestSession && lookupType === PLATE_LOOKUP_TYPES.NOT_FOUND) {
    lookupType = PLATE_LOOKUP_TYPES.GUEST_SESSION;
  }

  const reservation = data.reservation
    ? normalizeReservation(data.reservation)
    : null;
  const vehicle = mapApiVehicleToRegistered(data.vehicle ?? data.walkInDriver);
  const guestSession = data.guestSession
    ? mapGuestSessionFields(data.guestSession)
    : null;
  const duplicateActiveSession = data.duplicateActiveSession
    ? mapGuestSessionFields(data.duplicateActiveSession)
    : null;

  return {
    lookupType,
    reservation,
    vehicle,
    guestSession,
    duplicateActiveSession,
    isWalkInDriver: Boolean(data.isWalkInDriver),
    isGuest: Boolean(data.isGuest),
  };
};

export const isWalkInDriverLookup = (lookup) =>
  lookup?.lookupType === PLATE_LOOKUP_TYPES.WALK_IN_DRIVER;

export const isGuestSessionLookup = (lookup) =>
  lookup?.lookupType === PLATE_LOOKUP_TYPES.GUEST_SESSION;

export const isAlreadyCheckedInLookup = (lookup) =>
  lookup?.lookupType === PLATE_LOOKUP_TYPES.ALREADY_CHECKED_IN;

export const isDriverSessionLookup = (lookup) =>
  lookup?.lookupType === PLATE_LOOKUP_TYPES.DRIVER_SESSION;

export const isReservationLookup = (lookup) =>
  lookup?.lookupType === PLATE_LOOKUP_TYPES.RESERVATION;

export const isPendingReservationLookup = (lookup) => {
  if (!isReservationLookup(lookup) || !lookup.reservation) return false;
  const status = lookup.reservation.reservationStatus;
  return status === "PENDING" || status === "APPROVED";
};

export const isActiveGuestSessionLookup = (lookup) =>
  isGuestSessionLookup(lookup) || Boolean(lookup?.guestSession);

export const isCheckedInReservationLookup = (lookup) => {
  const status = lookup?.reservation?.reservationStatus;
  return status === "CHECKED_IN" || status === "ACTIVE";
};

/** Block staff entry when vehicle already has an active session. */
export const isBlockedEntryLookup = (lookup) => {
  if (!lookup) return false;
  if (isAlreadyCheckedInLookup(lookup)) return true;
  if (isActiveGuestSessionLookup(lookup)) return true;
  if (isDriverSessionLookup(lookup)) return true;
  if (isCheckedInReservationLookup(lookup)) return true;
  return false;
};

export const resolveBlockedEntryPlate = (lookup, plateInput) =>
  lookup?.guestSession?.vehiclePlate ||
  lookup?.duplicateActiveSession?.vehiclePlate ||
  lookup?.reservation?.vehiclePlate ||
  plateInput ||
  "";

export const resolveBlockedEntryTicket = (lookup) =>
  lookup?.duplicateActiveSession?.ticketCode ||
  lookup?.guestSession?.ticketCode ||
  lookup?.reservation?.ticketCode ||
  null;

/** Session payload for staff checkout (guest). */
export const enrichCheckoutSession = (lookup) => {
  if (!lookup?.guestSession) return null;
  return normalizeReservation(lookup.guestSession);
};

export const mapWalkInDriverToCheckoutSession = (walkInDriver) => {
  if (!walkInDriver) return null;
  return normalizeReservation(
    mapGuestSessionFields({
      ...walkInDriver,
      vehiclePlate: walkInDriver.plateNumber ?? walkInDriver.vehiclePlate,
      vehicleBrand: walkInDriver.brand ?? walkInDriver.vehicleBrand,
      vehicleModel: walkInDriver.model ?? walkInDriver.vehicleModel,
      vehicleColor: walkInDriver.vehicleColor ?? walkInDriver.color,
      vehicleTypeName: walkInDriver.vehicleTypeName ?? walkInDriver.typeName,
      floorVehicleTypeId: walkInDriver.vehicleTypeId ?? walkInDriver.floorVehicleTypeId,
      driverFullName: walkInDriver.driverFullName,
      driverUsername: walkInDriver.username ?? walkInDriver.driverUsername,
    }),
  );
};

/** Ticket lookup response for driver walk-in checkout. */
export const normalizeTicketLookupResponse = (raw) => {
  const data = raw?.data ?? raw;
  if (!data || typeof data !== "object") {
    return {
      lookupType: PLATE_LOOKUP_TYPES.NOT_FOUND,
      reservation: null,
      vehicle: null,
      guestSession: null,
      walkInDriver: null,
      duplicateActiveSession: null,
      isWalkInDriver: false,
      isGuest: false,
    };
  }

  const lookupType = data.lookupType || PLATE_LOOKUP_TYPES.NOT_FOUND;
  const walkInDriver = data.walkInDriver
    ? mapWalkInDriverToCheckoutSession(data.walkInDriver)
    : null;

  return {
    lookupType,
    reservation: data.reservation ? normalizeReservation(data.reservation) : null,
    vehicle: mapApiVehicleToRegistered(data.vehicle ?? data.walkInDriver),
    guestSession: data.guestSession ? mapGuestSessionFields(data.guestSession) : null,
    walkInDriver,
    duplicateActiveSession: data.duplicateActiveSession
      ? mapGuestSessionFields(data.duplicateActiveSession)
      : null,
    isWalkInDriver: Boolean(data.isWalkInDriver),
    isGuest: Boolean(data.isGuest),
  };
};

export const enrichWalkInDriverCheckoutSession = (lookup) => {
  if (lookup?.walkInDriver) return lookup.walkInDriver;
  if (isWalkInDriverLookup(lookup) && lookup?.vehicle) {
    return mapWalkInDriverToCheckoutSession(lookup.vehicle);
  }
  return null;
};

export const hasTicketCheckoutSession = (lookup) =>
  (isGuestSessionLookup(lookup) && Boolean(lookup?.guestSession)) ||
  (isWalkInDriverLookup(lookup) && Boolean(enrichWalkInDriverCheckoutSession(lookup)));

/** Guest or driver walk-in session from ticket lookup. */
export const resolveTicketCheckoutSession = (lookup) =>
  enrichCheckoutSession(lookup) || enrichWalkInDriverCheckoutSession(lookup);
