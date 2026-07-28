import { normalizeReservation } from "./reservationSessionUtils";
import {
  enrichSessionFromPlateLookup,
  mapGuestSessionFields,
  mergeDriverInfo,
} from "./walkInSessionUtils";

export const PLATE_LOOKUP_TYPES = {
  RESERVATION: "RESERVATION",
  WALK_IN_DRIVER: "WALK_IN_DRIVER",
  NOT_FOUND: "NOT_FOUND",
  GUEST_SESSION: "GUEST_SESSION",
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
      registeredVehicle: null,
    };
  }

  let lookupType = data.lookupType || PLATE_LOOKUP_TYPES.NOT_FOUND;
  if (data.guestSession && lookupType === PLATE_LOOKUP_TYPES.NOT_FOUND) {
    lookupType = PLATE_LOOKUP_TYPES.GUEST_SESSION;
  }

  const reservation = data.reservation ? normalizeReservation(data.reservation) : null;
  const vehicle = mapApiVehicleToRegistered(data.vehicle);
  const guestSession = data.guestSession
    ? mapGuestSessionFields(data.guestSession)
    : null;

  return {
    lookupType,
    reservation,
    vehicle,
    guestSession,
    registeredVehicle: vehicle,
  };
};

export const isWalkInDriverLookup = (lookup) =>
  lookup?.lookupType === PLATE_LOOKUP_TYPES.WALK_IN_DRIVER;

export const isReservationLookup = (lookup) =>
  lookup?.lookupType === PLATE_LOOKUP_TYPES.RESERVATION;

export const isPendingReservationLookup = (lookup) => {
  if (!isReservationLookup(lookup) || !lookup.reservation) return false;
  const status = lookup.reservation.reservationStatus;
  return status === "PENDING" || status === "APPROVED";
};

export const isCheckedInReservationLookup = (lookup) => {
  if (!isReservationLookup(lookup) || !lookup.reservation) return false;
  const { reservation } = lookup;
  const status = reservation.reservationStatus;
  return (
    status === "CHECKED_IN" ||
    status === "ACTIVE" ||
    Boolean(reservation.checkinTime) ||
    reservation.sessionStatus === "ACTIVE"
  );
};

export const isActiveGuestSessionLookup = (lookup) =>
  lookup?.lookupType === PLATE_LOOKUP_TYPES.GUEST_SESSION || Boolean(lookup?.guestSession);

/** Session payload for staff checkout (reservation checked-in or active guest session). */
export const resolveCheckoutSessionFromLookup = (lookup) => {
  if (!lookup) return null;
  if (lookup.guestSession) return lookup.guestSession;
  if (isCheckedInReservationLookup(lookup)) return lookup.reservation;
  return null;
};

export const enrichCheckoutSession = (lookup) => {
  if (!lookup) return null;

  if (lookup.guestSession) {
    return (
      enrichSessionFromPlateLookup({
        lookupType: lookup.lookupType,
        guestSession: lookup.guestSession,
        registeredVehicle: lookup.vehicle,
        vehicle: lookup.vehicle,
      }) || normalizeReservation(lookup.guestSession)
    );
  }

  const session = resolveCheckoutSessionFromLookup(lookup);
  if (!session) return null;

  const normalized = normalizeReservation(session);
  if (!lookup.vehicle) return normalized;

  return mergeDriverInfo(normalized, {
    driverFullName: lookup.vehicle.driverFullName,
    driverUsername: lookup.vehicle.username || lookup.vehicle.driverUsername,
    driverUserId: lookup.vehicle.userId,
    checkinType: "DRIVER_WALK_IN",
  });
};
