import { useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import dayjs from "dayjs";

import { getAllReservationRequest } from "../../../redux/staff/reservation/getAllReservation/getAllReservationSlice";
import {
  unifiedCheckinRequest,
  unifiedCheckinReset,
} from "../../../redux/staff/parking_session/checkin/unifiedCheckinSlice";
import {
  ocrPlateRequest,
  ocrPlateReset,
} from "../../../redux/staff/ocrPlate/ocrPlateSlice";
import { getStaffBuildingRequest } from "../../../redux/staff/guest_parking/getStaffBuilding/getStaffBuildingSlice";
import { getVehicleTypeListRequest } from "../../../redux/manager/Building/getVehicleTypeList/getVehicleTypeListSlice";
import {
  plateLookupRequest,
  plateLookupReset,
} from "../../../redux/staff/parking_session/plateLookup/plateLookupSlice";
import { normalizePlate, platesMatch } from "../../../utils/plateUtils";
import {
  isBlockedEntryLookup,
  isPendingReservationLookup,
  isWalkInDriverLookup,
  resolveBlockedEntryPlate,
  resolveBlockedEntryTicket,
} from "../../../utils/plateLookupUtils";
import { setStaffEntryMounted } from "../../../utils/staffVehiclePageGuard";
import { resolveEntryCheckMode } from "../shared/checkModeTheme";

import EntryHeader from "./components/EntryHeader";
import EntryPlateUploadCard from "./components/EntryPlateUploadCard";
import EntryCheckinFormCard from "./components/EntryCheckinFormCard";
import EntryCheckinSummary from "./components/EntryCheckinSummary";
import ManageReservationsModal from "./components/ManageReservationsModal";

const VehicleEntry = () => {
  const dispatch = useDispatch();

  const plateImageFileRef = useRef(null);
  const checkinImageFileRef = useRef(null);
  const isActiveRef = useRef(true);

  const [plateImageUrl, setPlateImageUrl] = useState("");
  const [isUploadingPlate, setIsUploadingPlate] = useState(false);
  const [plateInput, setPlateInput] = useState("");
  const [checkinImageUrl, setCheckinImageUrl] = useState("");
  const [isUploadingCheckin, setIsUploadingCheckin] = useState(false);
  const [guestVehicleTypeId, setGuestVehicleTypeId] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [reservationSubTab, setReservationSubTab] = useState("CHECKED_IN");

  const { getAllReservation, loading: reservationsLoading } = useSelector((s) => s.getAllReservation);
  const { ocrPlate, loading: ocrLoading } = useSelector((s) => s.ocrPlate);
  const { getStaffBuilding: staffBuilding } = useSelector((s) => s.getStaffBuilding);
  const { vehicleTypes } = useSelector((s) => s.getVehicleTypeList);
  const { unifiedCheckin, loading: checkinLoading, error: checkinError } = useSelector(
    (s) => s.unifiedCheckin || {},
  );
  const { result: plateLookup, loading: lookupLoading } = useSelector((s) => s.plateLookup);

  const clearEntryForm = useCallback(() => {
    setPlateImageUrl("");
    plateImageFileRef.current = null;
    setPlateInput("");
    setCheckinImageUrl("");
    checkinImageFileRef.current = null;
    setGuestVehicleTypeId(null);
    dispatch(ocrPlateReset());
    dispatch(plateLookupReset());
  }, [dispatch]);

  useLayoutEffect(() => {
    return () => {
      isActiveRef.current = false;
      setStaffEntryMounted(false);
      dispatch(ocrPlateReset());
      dispatch(unifiedCheckinReset());
      dispatch(plateLookupReset());
    };
  }, [dispatch]);

  useEffect(() => {
    isActiveRef.current = true;
    setStaffEntryMounted(true);
    dispatch(ocrPlateReset());
    dispatch(unifiedCheckinReset());
    dispatch(plateLookupReset());
    dispatch(getAllReservationRequest());
    dispatch(getStaffBuildingRequest());
    dispatch(getVehicleTypeListRequest());
    return () => {
      isActiveRef.current = false;
      setStaffEntryMounted(false);
    };
  }, [dispatch]);

  const recognizedPlate = useMemo(() => {
    if (!ocrPlate) return null;
    return ocrPlate?.data?.plateNumber || ocrPlate?.plateNumber || ocrPlate?.data || null;
  }, [ocrPlate]);

  useEffect(() => {
    if (!isActiveRef.current || !recognizedPlate || !plateImageUrl) return;
    setPlateInput(recognizedPlate);
  }, [recognizedPlate, plateImageUrl]);

  useEffect(() => {
    if (!isActiveRef.current || !unifiedCheckin) return;

    message.success("Vehicle checked in successfully");
    dispatch(unifiedCheckinReset());
    dispatch(getAllReservationRequest());
    clearEntryForm();
  }, [unifiedCheckin, dispatch, clearEntryForm]);

  useEffect(() => {
    if (!isActiveRef.current || !checkinError) return;
    const errStr =
      typeof checkinError === "string"
        ? checkinError
        : checkinError.message || checkinError.error || "Check-in failed";
    message.error(errStr);
    dispatch(unifiedCheckinReset());
  }, [checkinError, dispatch]);

  const reservationList = useMemo(
    () => (Array.isArray(getAllReservation) ? getAllReservation : []),
    [getAllReservation],
  );
  const checkedInList = useMemo(
    () => reservationList.filter((r) => r.reservationStatus === "CHECKED_IN"),
    [reservationList],
  );
  const cancelledList = useMemo(
    () => reservationList.filter((r) => r.reservationStatus === "CANCELLED"),
    [reservationList],
  );

  const buildingName = useMemo(() => {
    if (!staffBuilding) return null;
    if (Array.isArray(staffBuilding) && staffBuilding.length > 0) {
      return staffBuilding[0]?.name || staffBuilding[0]?.buildingName || null;
    }
    return staffBuilding?.name || staffBuilding?.buildingName || null;
  }, [staffBuilding]);

  const buildingId = useMemo(() => {
    if (!staffBuilding) return null;
    if (Array.isArray(staffBuilding) && staffBuilding.length > 0) {
      return staffBuilding[0]?.buildingId || staffBuilding[0]?.id || null;
    }
    return staffBuilding?.buildingId || staffBuilding?.id || null;
  }, [staffBuilding]);

  const driverReservation = useMemo(() => {
    if (!isPendingReservationLookup(plateLookup)) return null;
    return plateLookup.reservation;
  }, [plateLookup]);

  const isDriverWalkIn = isWalkInDriverLookup(plateLookup);

  const checkedInDriverByPlate = useMemo(() => {
    if (!plateInput) return null;
    return (
      checkedInList.find((r) => platesMatch(r.vehiclePlate, plateInput)) ?? null
    );
  }, [plateInput, checkedInList]);

  const isAlreadyParked =
    isBlockedEntryLookup(plateLookup) || Boolean(checkedInDriverByPlate);

  const showCheckinForm =
    Boolean(plateInput) && !lookupLoading && !isAlreadyParked;

  const walkInVehicle = plateLookup?.vehicle || null;

  const walkInVehicleTypeId = useMemo(() => {
    if (!walkInVehicle) return null;
    return (
      walkInVehicle.vehicleTypeId ??
      walkInVehicle.floorVehicleTypeId ??
      vehicleTypes?.find(
        (vt) =>
          vt.typeName?.toUpperCase() ===
          String(walkInVehicle.vehicleTypeName || walkInVehicle.typeName || "").toUpperCase(),
      )?.vehicleTypeId ??
      null
    );
  }, [walkInVehicle, vehicleTypes]);

  const checkMode = resolveEntryCheckMode({
    driverReservation,
    isDriverWalkIn,
    hasPlate: Boolean(plateInput) && !lookupLoading,
  });

  useEffect(() => {
    if (!plateInput) {
      dispatch(plateLookupReset());
      return;
    }

    const handler = setTimeout(() => {
      if (!isActiveRef.current) return;
      dispatch(getAllReservationRequest());
      dispatch(
        plateLookupRequest({
          plateNumber: normalizePlate(plateInput),
          buildingId,
        }),
      );
    }, 600);

    return () => clearTimeout(handler);
  }, [plateInput, buildingId, dispatch]);

  const effectiveVehicleTypeId = isDriverWalkIn ? walkInVehicleTypeId : guestVehicleTypeId;

  useEffect(() => {
    if (!isActiveRef.current || !isAlreadyParked || !plateInput) return;

    const parkedPlate =
      resolveBlockedEntryPlate(plateLookup, plateInput) ||
      checkedInDriverByPlate?.vehiclePlate;
    const ticketCode =
      resolveBlockedEntryTicket(plateLookup) || checkedInDriverByPlate?.ticketCode;
    const ticketHint = ticketCode ? ` (Ticket: ${ticketCode})` : "";

    message.error(`Vehicle plate ${parkedPlate} is already in the parking lot!${ticketHint}`);
    clearEntryForm();
  }, [isAlreadyParked, plateLookup, checkedInDriverByPlate, plateInput, clearEntryForm]);

  const handlePlateChange = useCallback((value) => {
    setPlateInput(value);
    setGuestVehicleTypeId(null);
  }, []);

  const handlePlateUpload = useCallback(
    async (options) => {
      const { file, onSuccess, onError } = options;
      setIsUploadingPlate(true);
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPlateImageUrl(e.target.result);
          setCheckinImageUrl(e.target.result);
          setIsUploadingPlate(false);
          onSuccess("Ok");
        };
        reader.readAsDataURL(file);
        plateImageFileRef.current = file;
        checkinImageFileRef.current = file;
        const formData = new FormData();
        formData.append("file", file);
        dispatch(ocrPlateRequest(formData));
      } catch (err) {
        setIsUploadingPlate(false);
        onError(err);
        message.error("Failed to upload plate image");
      }
    },
    [dispatch],
  );

  const handleCheckinUpload = useCallback(async (options) => {
    const { file, onSuccess, onError } = options;
    setIsUploadingCheckin(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCheckinImageUrl(e.target.result);
        setIsUploadingCheckin(false);
        onSuccess("Ok");
      };
      reader.readAsDataURL(file);
      checkinImageFileRef.current = file;
    } catch (err) {
      setIsUploadingCheckin(false);
      onError(err);
      message.error("Failed to upload check-in image");
    }
  }, []);

  const handleRemovePlateImage = useCallback(() => {
    setPlateImageUrl("");
    plateImageFileRef.current = null;
    setPlateInput("");
    dispatch(ocrPlateReset());
    dispatch(plateLookupReset());
  }, [dispatch]);

  const handleRemoveCheckinImage = useCallback(() => {
    setCheckinImageUrl("");
    checkinImageFileRef.current = null;
  }, []);

  const handleSubmit = useCallback(() => {
    if (!plateImageFileRef.current) {
      message.error("Plate image is required");
      return;
    }

    if (isAlreadyParked) {
      message.error("This vehicle is already checked in");
      return;
    }

    if (driverReservation) {
      const now = dayjs();
      const resStart = dayjs(driverReservation.reservationStart);
      if (now.isBefore(resStart)) {
        message.error(`Cannot check-in before reservation start time (${resStart.format("HH:mm")})`);
        return;
      }
      if (now.diff(resStart, "minute") > 15) {
        message.error("Reservation has expired (over 15 minutes late)");
        return;
      }
      if (!checkinImageFileRef.current) {
        message.error("Vehicle check-in image is required for drivers");
        return;
      }
      dispatch(
        unifiedCheckinRequest({
          ticketCode: driverReservation.ticketCode,
          plateNumber: driverReservation.vehiclePlate,
          vehicleColor: driverReservation.vehicleColor,
          vehicleTypeId: driverReservation.floorVehicleTypeId,
          checkinImage: checkinImageFileRef.current,
          plateImage: plateImageFileRef.current,
        }),
      );
      return;
    }

    if (!buildingId) {
      message.error("Building not found");
      return;
    }
    const vehicleTypeId = effectiveVehicleTypeId;
    if (!vehicleTypeId) {
      message.error(
        isDriverWalkIn
          ? "Could not determine vehicle type for registered driver"
          : "Please select a vehicle type for the guest",
      );
      return;
    }
    if (!checkinImageFileRef.current) {
      message.error("Vehicle check-in image is required");
      return;
    }
    dispatch(
      unifiedCheckinRequest({
        plateNumber: normalizePlate(plateInput),
        plateImage: plateImageFileRef.current,
        checkinImage: checkinImageFileRef.current,
        buildingId: String(buildingId),
        vehicleTypeId: String(vehicleTypeId),
      }),
    );
  }, [
    driverReservation,
    plateInput,
    buildingId,
    effectiveVehicleTypeId,
    isAlreadyParked,
    isDriverWalkIn,
    dispatch,
  ]);

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <EntryHeader onOpenManageModal={() => setIsManageModalOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <EntryPlateUploadCard
            plateImageUrl={plateImageUrl}
            isUploadingPlate={isUploadingPlate}
            ocrLoading={ocrLoading}
            plateInput={plateInput}
            onPlateChange={handlePlateChange}
            onPlateUpload={handlePlateUpload}
            onRemovePlateImage={handleRemovePlateImage}
          />

          {showCheckinForm && (
            <EntryCheckinFormCard
              checkMode={checkMode}
              driverReservation={driverReservation}
              isDriverWalkIn={isDriverWalkIn}
              walkInVehicle={walkInVehicle}
              buildingName={buildingName}
              vehicleTypes={vehicleTypes}
              walkInVehicleTypeId={walkInVehicleTypeId}
              selectedVehicleTypeId={effectiveVehicleTypeId}
              onVehicleTypeChange={setGuestVehicleTypeId}
              lookupLoading={lookupLoading}
              checkinImageUrl={checkinImageUrl}
              isUploadingCheckin={isUploadingCheckin}
              onCheckinUpload={handleCheckinUpload}
              onRemoveCheckinImage={handleRemoveCheckinImage}
            />
          )}
        </div>

        <EntryCheckinSummary
          checkMode={checkMode}
          plateInput={plateInput}
          driverReservation={driverReservation}
          isDriverWalkIn={isDriverWalkIn}
          walkInVehicle={walkInVehicle}
          vehicleTypes={vehicleTypes}
          walkInVehicleTypeId={walkInVehicleTypeId}
          selectedVehicleTypeId={effectiveVehicleTypeId}
          plateImageUrl={plateImageUrl}
          checkinImageUrl={checkinImageUrl}
          lookupLoading={lookupLoading}
          isAlreadyParked={isAlreadyParked}
          buildingId={buildingId}
          checkinLoading={checkinLoading}
          onSubmit={handleSubmit}
        />

      </div>

      <ManageReservationsModal
        open={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        reservationSubTab={reservationSubTab}
        onSubTabChange={setReservationSubTab}
        checkedInList={checkedInList}
        cancelledList={cancelledList}
        loading={reservationsLoading}
      />
    </div>
  );
};

export default VehicleEntry;
