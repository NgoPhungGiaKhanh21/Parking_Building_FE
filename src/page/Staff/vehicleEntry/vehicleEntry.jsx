import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Spin,
  Tabs,
  Empty,
  Tag,
  Modal,
  Badge,
  Upload,
  message,
  Image,
  Select,
  Input,
} from "antd";
import {
  Car,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Building2,
  ShieldCheck,
  LogIn,
  User,
  Palette,
  Hash,
  ParkingCircle,
  DollarSign,
  AlertCircle,
  Upload as UploadIcon,
  ImageIcon,
  ScanLine,
  UserRound,
} from "lucide-react";
import dayjs from "dayjs";

import { getAllReservationRequest } from "../../../redux/staff/reservation/getAllReservation/getAllReservationSlice";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
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
import { getSessionByPlateNumberApi } from "../../../service/staff/parking_sessionApi";

// ─── Status config ─────────────────────────────────────────────────────────────
const reservationStatusConfig = {
  PENDING: { color: "gold", label: "Pending" },
  CHECKED_IN: { color: "blue", label: "Checked In" },
  ACTIVE: { color: "green", label: "Active" },
  CONFIRMED: { color: "blue", label: "Confirmed" },
  COMPLETED: { color: "default", label: "Completed" },
  CANCELLED: { color: "red", label: "Cancelled" },
  EXPIRED: { color: "default", label: "Expired" },
};

// ─── Reservation Card ──────────────────────────────────────────────────────────
const ReservationCard = ({ r }) => {
  const cfg = reservationStatusConfig[r.reservationStatus] || {
    color: "default",
    label: r.reservationStatus,
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ParkingCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Slot
            </p>
            <p className="text-xl font-extrabold text-blue-600 leading-tight">
              {r.slotName}
            </p>
            <p className="text-xs text-slate-500">
              Zone {r.zoneName} · {r.floorName}
            </p>
          </div>
        </div>
        <Tag
          color={cfg.color}
          className="flex items-center gap-1 !text-xs !font-semibold !px-3 !py-1"
        >
          {cfg.label}
        </Tag>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
            Building
          </p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Building2 size={11} />
            {r.buildingName}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
            Start
          </p>
          <p className="text-xs font-semibold text-slate-700">
            {dayjs(r.reservationStart).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
            Vehicle Type
          </p>
          <p className="text-xs font-semibold text-slate-700">
            {r.floorVehicleTypeName}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg bg-indigo-50 p-3">
          <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
            <User size={10} /> Driver
          </p>
          <p className="text-xs font-semibold text-indigo-700">{r.username}</p>
        </div>
        <div className="rounded-lg bg-indigo-50 p-3">
          <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
            <Hash size={10} /> Plate
          </p>
          <p className="text-xs font-bold font-mono text-indigo-700">
            {r.vehiclePlate}
          </p>
        </div>
        <div className="rounded-lg bg-indigo-50 p-3">
          <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
            <Car size={10} /> Vehicle
          </p>
          <p className="text-xs font-semibold text-indigo-700">
            {r.vehicleBrand} {r.vehicleModel}
          </p>
        </div>
        <div className="rounded-lg bg-indigo-50 p-3">
          <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
            <Palette size={10} /> Color
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full border border-indigo-200 shadow-sm"
              style={{ backgroundColor: r.vehicleColor?.toLowerCase() || "#ccc" }}
            />
            <span className="text-xs font-semibold text-indigo-700 capitalize">
              {r.vehicleColor}
            </span>
          </div>
        </div>
      </div>

      {r.ticketCode && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold uppercase text-slate-400">
            Ticket:
          </span>
          <code className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700">
            {r.ticketCode}
          </code>
        </div>
      )}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const VehicleEntry = () => {
  const dispatch = useDispatch();
  
  // Refs
  const plateImageFileRef = useRef(null);
  const checkinImageFileRef = useRef(null);

  // Form states
  const [plateImageUrl, setPlateImageUrl] = useState("");
  const [isUploadingPlate, setIsUploadingPlate] = useState(false);
  const [plateInput, setPlateInput] = useState("");
  
  const [checkinImageUrl, setCheckinImageUrl] = useState("");
  const [isUploadingCheckin, setIsUploadingCheckin] = useState(false);
  
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState(null);

  // UI states
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [reservationSubTab, setReservationSubTab] = useState("CHECKED_IN");
  const [checkoutDone, setCheckoutDone] = useState(false);

  // Selectors
  const { getAllReservation, loading: reservationsLoading } = useSelector((s) => s.getAllReservation);
  const { ocrPlate, loading: ocrLoading } = useSelector((s) => s.ocrPlate);
  const { getStaffBuilding: staffBuilding, loading: staffBuildingLoading } = useSelector((s) => s.getStaffBuilding);
  const { vehicleTypes, loading: vtLoading } = useSelector((s) => s.getVehicleTypeList);
  const { unifiedCheckin, loading: checkinLoading, error: checkinError } = useSelector((s) => s.unifiedCheckin || {});

  // Fetch data
  useEffect(() => {
    dispatch(getAllReservationRequest());
    dispatch(getStaffBuildingRequest());
    dispatch(getVehicleTypeListRequest());

    return () => {
      dispatch(ocrPlateReset());
      dispatch(unifiedCheckinReset());
    };
  }, [dispatch]);

  // Derived OCR plate
  const recognizedPlate = useMemo(() => {
    if (!ocrPlate) return null;
    return ocrPlate?.data?.plateNumber || ocrPlate?.plateNumber || ocrPlate?.data || null;
  }, [ocrPlate]);

  // Set plateInput when OCR returns
  useEffect(() => {
    if (recognizedPlate) {
      setPlateInput(recognizedPlate);
    }
  }, [recognizedPlate]);

  // Handle successful checkin
  useEffect(() => {
    if (unifiedCheckin) {
      message.success("Vehicle checked in successfully");
      dispatch(unifiedCheckinReset());
      dispatch(getAllReservationRequest());
      
      // Auto-reset form for the next vehicle
      setPlateImageUrl("");
      if (plateImageFileRef?.current) plateImageFileRef.current = null;
      setPlateInput("");
      dispatch(ocrPlateReset());
      
      setCheckinImageUrl("");
      if (checkinImageFileRef?.current) checkinImageFileRef.current = null;
      setSelectedVehicleTypeId(null);
      setCheckoutDone(false);
    }
  }, [unifiedCheckin, dispatch]);

  // Handle checkin error
  useEffect(() => {
    if (checkinError) {
      const errStr = typeof checkinError === 'string' ? checkinError : (checkinError.message || checkinError.error || "Check-in failed");
      message.error(errStr);
      dispatch(unifiedCheckinReset());
    }
  }, [checkinError, dispatch]);

  // Reservation list processing
  const reservationList = useMemo(
    () => (Array.isArray(getAllReservation) ? getAllReservation : []),
    [getAllReservation]
  );
  const pendingList = useMemo(
    () => reservationList.filter((r) => r.reservationStatus === "PENDING"),
    [reservationList]
  );
  const checkedInList = useMemo(
    () => reservationList.filter((r) => r.reservationStatus === "CHECKED_IN"),
    [reservationList]
  );
  const cancelledList = useMemo(
    () => reservationList.filter((r) => r.reservationStatus === "CANCELLED"),
    [reservationList]
  );

  // Match plate to pending driver reservation
  // Normalize plates: remove hyphens/spaces and compare case-insensitively
  const normalizePlate = (p) => (p || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  
  const driverReservation = useMemo(() => {
    if (!plateInput) return null;
    const norm = normalizePlate(plateInput);
    return pendingList.find(r => normalizePlate(r.vehiclePlate) === norm);
  }, [plateInput, pendingList]);

  const alreadyCheckedInReservation = useMemo(() => {
    if (!plateInput) return null;
    const norm = normalizePlate(plateInput);
    return checkedInList.find(r => normalizePlate(r.vehiclePlate) === norm);
  }, [plateInput, checkedInList]);

  // Warning for already checked-in vehicles (DRIVER)
  useEffect(() => {
    if (alreadyCheckedInReservation) {
      message.error(`Vehicle plate ${alreadyCheckedInReservation.vehiclePlate} is already checked in!`);
      // Reset the plate inputs to prevent duplicate guest check-in
      setPlateInput("");
      setPlateImageUrl("");
      if (plateImageFileRef?.current) plateImageFileRef.current = null;
      setCheckinImageUrl("");
      if (checkinImageFileRef?.current) checkinImageFileRef.current = null;
      dispatch(ocrPlateReset());
    }
  }, [alreadyCheckedInReservation, dispatch]);

  // Warning for already checked-in vehicles (GUEST)
  useEffect(() => {
    if (!plateInput || alreadyCheckedInReservation) return;

    const checkGuestSession = async () => {
      try {
        const response = await getSessionByPlateNumberApi({ plateNumber: plateInput });
        // Axios returns response.data as the body. The body has { success, data: {...} }
        const sessionData = response?.data?.data || response?.data;
        
        if (sessionData && (sessionData.status === "PENDING_PAYMENT" || sessionData.status === "ACTIVE" || sessionData.reservationStatus === "CHECKED_IN")) {
          message.error(`Guest vehicle plate ${sessionData.vehiclePlate || plateInput} is already in the parking lot!`);
          
          // Reset the plate inputs
          setPlateInput("");
          setPlateImageUrl("");
          if (plateImageFileRef?.current) plateImageFileRef.current = null;
          setCheckinImageUrl("");
          if (checkinImageFileRef?.current) checkinImageFileRef.current = null;
          dispatch(ocrPlateReset());
        }
      } catch (err) {
        // Ignored: 404 means no active session found, which is good (vehicle can check in)
      }
    };

    const timer = setTimeout(() => {
      checkGuestSession();
    }, 600); // Debounce to prevent spamming while typing

    return () => clearTimeout(timer);
  }, [plateInput, alreadyCheckedInReservation, dispatch]);

  // Staff building
  const buildingName = useMemo(() => {
    if (!staffBuilding) return null;
    if (Array.isArray(staffBuilding) && staffBuilding.length > 0) return staffBuilding[0]?.name || staffBuilding[0]?.buildingName || null;
    return staffBuilding?.name || staffBuilding?.buildingName || null;
  }, [staffBuilding]);

  const buildingId = useMemo(() => {
    if (!staffBuilding) return null;
    if (Array.isArray(staffBuilding) && staffBuilding.length > 0) return staffBuilding[0]?.buildingId || staffBuilding[0]?.id || null;
    return staffBuilding?.buildingId || staffBuilding?.id || null;
  }, [staffBuilding]);

  // Handlers
  const handlePlateUpload = useCallback(async (options) => {
    const { file, onSuccess, onError } = options;
    setIsUploadingPlate(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPlateImageUrl(e.target.result);
        // Always auto-fill checkin image from plate image
        setCheckinImageUrl(e.target.result);
        setIsUploadingPlate(false);
        onSuccess("Ok");
      };
      reader.readAsDataURL(file);

      plateImageFileRef.current = file;
      // Always auto-fill checkin image file ref
      checkinImageFileRef.current = file;

      const formData = new FormData();
      formData.append("file", file);
      dispatch(ocrPlateRequest(formData));
    } catch (err) {
      setIsUploadingPlate(false);
      onError(err);
      message.error("Failed to upload plate image");
    }
  }, [dispatch]);

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
  }, [dispatch]);
  
  const handleRemoveCheckinImage = useCallback(() => {
    setCheckinImageUrl("");
    checkinImageFileRef.current = null;
  }, []);

  const resetAll = useCallback(() => {
    handleRemovePlateImage();
    handleRemoveCheckinImage();
    setSelectedVehicleTypeId(null);
    setCheckoutDone(false);
  }, [handleRemovePlateImage, handleRemoveCheckinImage]);

  const handleSubmit = useCallback(() => {
    if (!plateImageFileRef.current) {
      message.error("Plate image is required");
      return;
    }

    if (driverReservation) {
      const now = dayjs();
      const resStart = dayjs(driverReservation.reservationStart);

      if (now.isBefore(resStart)) {
        message.error(`Cannot check-in before reservation start time (${resStart.format("HH:mm")})`);
        return;
      }

      if (now.diff(resStart, 'minute') > 15) {
        message.error("Reservation has expired (over 15 minutes late)");
        return;
      }

      // Driver check-in
      if (!checkinImageFileRef.current) {
        message.error("Vehicle check-in image is required for drivers");
        return;
      }
      dispatch(unifiedCheckinRequest({
        ticketCode: driverReservation.ticketCode,
        plateNumber: driverReservation.vehiclePlate,
        vehicleColor: driverReservation.vehicleColor,
        vehicleTypeId: driverReservation.floorVehicleTypeId,
        checkinImage: checkinImageFileRef.current,
        plateImage: plateImageFileRef.current,
      }));
    } else {
      // Guest check-in
      if (!buildingId) {
        message.error("Building not found");
        return;
      }
      if (!selectedVehicleTypeId) {
        message.error("Please select a vehicle type for the guest");
        return;
      }
      if (!checkinImageFileRef.current) {
        message.error("Vehicle check-in image is required");
        return;
      }
      dispatch(unifiedCheckinRequest({
        plateNumber: plateInput,
        plateImage: plateImageFileRef.current,
        checkinImage: checkinImageFileRef.current,
        buildingId: String(buildingId),
        vehicleTypeId: String(selectedVehicleTypeId),
      }));
    }
  }, [driverReservation, plateInput, buildingId, selectedVehicleTypeId, dispatch]);

  const renderReservationList = (list) => {
    if (reservationsLoading) return <div className="flex justify-center py-16"><Spin size="large" /></div>;
    if (list.length === 0) return <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16"><Empty description="No reservations found" /></div>;
    return (
      <div className="space-y-4">
        {list.map((r) => <ReservationCard key={r.reservationId} r={r} />)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      {/* ── Header ── */}
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="mb-4">
            <CommonBreadcrumb role="Staff" page="entry" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
              <LogIn size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                Unified Vehicle Entry
              </h1>
              <p className="mt-1 font-medium text-slate-500">
                OCR scanning auto-detects Drivers vs Guests
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsManageModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-colors shadow-sm self-start"
        >
          <ClipboardList size={18} />
          Manage Reservations
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Flow */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Plate Upload */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                Upload Plate Image <span className="text-red-500">*</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Upload
                    name="file"
                    listType="picture-card"
                    className="checkin-uploader"
                    showUploadList={false}
                    customRequest={handlePlateUpload}
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) message.error("Only image files allowed!");
                      return isImage;
                    }}
                  >
                    {plateImageUrl ? (
                      <img src={plateImageUrl} alt="Plate" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        {isUploadingPlate ? <Spin size="small" /> : <UploadIcon size={24} />}
                        <div className="text-xs font-medium">Click to Upload Plate</div>
                      </div>
                    )}
                  </Upload>
                  {plateImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePlateImage}
                      className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  {ocrLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-blue-200 bg-blue-50">
                      <Spin size="default" />
                      <p className="mt-3 text-sm font-medium text-blue-600 animate-pulse">
                        <ScanLine size={16} className="inline mr-1" /> Reading plate...
                      </p>
                    </div>
                  ) : plateInput || recognizedPlate ? (
                    <div className="p-6 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-xs font-bold uppercase text-emerald-600 tracking-wide">
                          Recognized Plate
                        </span>
                      </div>
                      <div className="bg-white rounded-xl border-2 border-emerald-300 overflow-hidden text-center flex justify-center focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
                        <Input
                          value={plateInput}
                          onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                          variant="borderless"
                          className="text-2xl md:text-3xl font-black font-mono tracking-[0.15em] text-slate-800 py-3 text-center w-full"
                          placeholder="ENTER PLATE"
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400 text-center">
                        Edit plate if incorrect to auto-search Driver DB
                      </p>
                    </div>
                  ) : plateImageUrl ? (
                    <div className="p-6 rounded-xl border border-dashed border-amber-200 bg-amber-50 text-center">
                      <AlertCircle size={24} className="mx-auto text-amber-400 mb-2" />
                      <p className="text-sm text-amber-600 font-medium">Could not read plate. Type it manually.</p>
                      <Input
                        value={plateInput}
                        onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                        className="mt-3 font-mono text-center font-bold"
                        placeholder="Type plate here"
                      />
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                      <ScanLine size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400 font-medium">Upload plate image to start</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Driver / Guest Form */}
            {plateInput && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${driverReservation ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
                      {driverReservation ? <Car size={16} /> : <UserRound size={16} />}
                    </div>
                    {driverReservation ? "Driver Check-in" : "Guest Check-in"}
                  </h2>
                  <Tag color={driverReservation ? "blue" : "orange"} className="!font-bold">
                    {driverReservation ? "RESERVATION FOUND" : "NO RESERVATION"}
                  </Tag>
                </div>

                {driverReservation ? (
                  <div className="space-y-5">
                    <ReservationCard r={driverReservation} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                        <Building2 size={12} /> Building
                      </label>
                      <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                        {buildingName || <span className="text-slate-400 italic">No building assigned</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                        <Car size={12} /> Vehicle Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={selectedVehicleTypeId}
                        onChange={(val) => setSelectedVehicleTypeId(val)}
                        placeholder="Select vehicle type"
                        className="w-full !h-[46px]"
                        options={vehicleTypes?.map((vt) => ({
                          value: vt.vehicleTypeId,
                          label: vt.typeName,
                        }))}
                        allowClear
                      />
                    </div>
                  </div>
                )}

                <div className={`rounded-xl border border-slate-200 bg-slate-50 p-5 ${driverReservation ? 'mt-5' : ''}`}>
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                    <UploadIcon size={16} /> Upload Vehicle Check-in Image <span className="text-red-500">*</span>
                  </p>
                  <Upload
                    name="file"
                    listType="picture-card"
                    className="checkin-uploader"
                    showUploadList={false}
                    customRequest={handleCheckinUpload}
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) message.error("Only image files allowed!");
                      return isImage;
                    }}
                  >
                    {checkinImageUrl ? (
                      <img src={checkinImageUrl} alt="Check-in" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        {isUploadingCheckin ? <Spin size="small" /> : <UploadIcon size={24} />}
                        <div className="text-xs font-medium">Click to Upload</div>
                      </div>
                    )}
                  </Upload>
                  {checkinImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveCheckinImage}
                      className="mt-3 w-32 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Summary */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <LogIn size={16} /> Check-in Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Plate Number:</span>
                  <span className="font-bold font-mono text-slate-800 text-sm">{plateInput || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Mode:</span>
                  {driverReservation ? (
                    <span className="font-bold text-indigo-600">DRIVER</span>
                  ) : (
                    <span className="font-bold text-orange-600">GUEST</span>
                  )}
                </div>
                {!driverReservation && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Vehicle Type:</span>
                    <span className="font-semibold text-slate-800">
                      {vehicleTypes?.find((v) => String(v.vehicleTypeId) === String(selectedVehicleTypeId))?.typeName || "—"}
                    </span>
                  </div>
                )}
                {driverReservation && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Driver Name:</span>
                    <span className="font-semibold text-slate-800">{driverReservation.username}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Plate Image:</span>
                  <span className={`font-semibold ${plateImageUrl ? "text-emerald-600" : "text-slate-400"}`}>
                    {plateImageUrl ? "✓ Uploaded" : "Not uploaded"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500">Check-in Image:</span>
                  <span className={`font-semibold ${checkinImageUrl ? "text-emerald-600" : "text-slate-400"}`}>
                    {checkinImageUrl ? "✓ Uploaded" : "Not uploaded"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !plateImageUrl || 
                !plateInput ||
                !checkinImageUrl ||
                (!driverReservation && (!buildingId || !selectedVehicleTypeId)) ||
                checkinLoading
              }
              className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: driverReservation 
                  ? "linear-gradient(135deg, #059669 0%, #047857 100%)" // Emerald
                  : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              {checkinLoading && <Spin size="small" />}
              <LogIn size={22} />
              Confirm Check-in
            </button>
          </div>
        </div>
      {/* ── Manage Reservations Modal ── */}
      <Modal
        open={isManageModalOpen}
        onCancel={() => setIsManageModalOpen(false)}
        centered
        width={900}
        footer={null}
        destroyOnHidden
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <ClipboardList size={20} />
            Manage Reservations
          </div>
        }
      >
        <div className="mt-4">
          <Tabs
            activeKey={reservationSubTab}
            onChange={setReservationSubTab}
            size="middle"
            className="reservation-sub-tabs"
            items={[
              {
                key: "CHECKED_IN",
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck size={16} /> Checked In
                    {checkedInList.length > 0 && <Badge count={checkedInList.length} style={{ backgroundColor: "#3b82f6" }} />}
                  </span>
                ),
                children: renderReservationList(checkedInList),
              },
              {
                key: "CANCELLED",
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <XCircle size={16} /> Cancelled
                  </span>
                ),
                children: renderReservationList(cancelledList),
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VehicleEntry;
