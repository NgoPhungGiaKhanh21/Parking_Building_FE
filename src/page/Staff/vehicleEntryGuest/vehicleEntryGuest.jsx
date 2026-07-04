import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Empty, Upload, message, Select } from "antd";
import {
  Car,
  Building2,
  LogIn,
  Hash,
  Layers,
  ParkingCircle,
  Upload as UploadIcon,
  UserRound,
  Phone,
  StickyNote,
  Palette,
  MapPin,
  ImageIcon,
  Lock,
  Wrench,
} from "lucide-react";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getAvailableBuildingsRequest } from "../../../redux/driver/reservationManagement/getAvailableBuildings/getAvailableBuildingsSlice";
import { getBuildingFloorsRequest, getBuildingFloorsReset } from "../../../redux/driver/reservationManagement/getBuildingFloors/getBuildingFloorsSlice";
import { getZoneSlotsRequest, getZoneSlotsReset } from "../../../redux/driver/reservationManagement/getZoneSlots/getZoneSlotsSlice";
import { getVehicleTypeListRequest } from "../../../redux/manager/Building/getVehicleTypeList/getVehicleTypeListSlice";
import {
  checkInGuestRequest,
  checkInGuestReset,
} from "../../../redux/staff/guest_parking/checkin_guest/checkInGuestSlice";

const VehicleEntryGuest = () => {
  const dispatch = useDispatch();

  // ── Form state
  const [plateNumber, setPlateNumber] = useState("");
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [vehicleColor, setVehicleColor] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [note, setNote] = useState("");
  const [checkinImageFile, setCheckinImageFile] = useState(null);
  const [checkinImageUrl, setCheckinImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // ── Redux
  const { buildings: rawBuildings, loading: buildingsLoading } = useSelector((s) => s.getAvailableBuildings);
  const { floors: rawFloors, loading: floorsLoading } = useSelector((s) => s.getBuildingFloorsDriver);
  const { slots: rawZoneSlots, loading: slotsLoading } = useSelector((s) => s.getZoneSlots);
  const { vehicleTypes, loading: vtLoading } = useSelector((s) => s.getVehicleTypeList);
  const { loading: checkinLoading, checkInGuest } = useSelector((s) => s.checkInGuest);

  useEffect(() => {
    dispatch(getAvailableBuildingsRequest());
    dispatch(getVehicleTypeListRequest());
  }, [dispatch]);

  // Reset form on success
  useEffect(() => {
    if (checkInGuest) {
      resetForm();
      dispatch(checkInGuestReset());
      dispatch(getAvailableBuildingsRequest());
    }
  }, [checkInGuest, dispatch]);

  // Get vehicle type name by id
  const selectedVehicleTypeName = useMemo(() => {
    if (!selectedVehicleTypeId || !vehicleTypes) return null;
    const vt = vehicleTypes.find((v) => String(v.vehicleTypeId) === String(selectedVehicleTypeId));
    return vt?.typeName || null;
  }, [selectedVehicleTypeId, vehicleTypes]);

  // Buildings from API
  const buildings = useMemo(
    () => (rawBuildings || []).map((b) => ({ id: b.buildingId, name: b.name })),
    [rawBuildings]
  );

  // Floors from API filtered by vehicleType
  const floors = useMemo(() => {
    if (!rawFloors || !selectedVehicleTypeId) return [];
    return rawFloors
      .filter((f) => String(f.vehicleTypeId) === String(selectedVehicleTypeId))
      .map((f) => ({ id: f.floorId, name: f.floorName, level: f.floorLevel, zones: f.zones || [] }));
  }, [rawFloors, selectedVehicleTypeId]);

  // Zones for selected floor (with availableSlots > 0)
  const zonesForFloor = useMemo(() => {
    if (!selectedFloorId) return [];
    const floor = floors.find((f) => f.id === selectedFloorId);
    return (floor?.zones || []).filter((z) => z.availableSlots > 0);
  }, [floors, selectedFloorId]);

  // Slot grid from getZoneSlots
  const allSlotsForZone = useMemo(() => {
    if (!rawZoneSlots || !Array.isArray(rawZoneSlots)) return [];
    return [...rawZoneSlots].sort((a, b) =>
      (a.slotName || "").localeCompare(b.slotName || "", undefined, { numeric: true, sensitivity: "base" })
    );
  }, [rawZoneSlots]);

  // Check if selected type is motorbike
  const isMotorbike = useMemo(() => {
    if (!selectedVehicleTypeName) return false;
    const name = selectedVehicleTypeName.toLowerCase();
    return name.includes("motor") || name.includes("bike");
  }, [selectedVehicleTypeName]);

  // Auto-format plate number with dash
  const formatPlateNumber = (raw) => {
    const cleaned = raw.replace(/[^A-Z0-9]/g, "").toUpperCase();
    if (isMotorbike) {
      // Motorbike: 59A1 - 02092 (4 prefix chars + up to 5 digits)
      if (cleaned.length <= 4) return cleaned;
      return cleaned.slice(0, 4) + " - " + cleaned.slice(4, 9);
    } else {
      // Car: 51A - 12345 (3 prefix chars + up to 5 digits)
      if (cleaned.length <= 3) return cleaned;
      return cleaned.slice(0, 3) + " - " + cleaned.slice(3, 8);
    }
  };


  // Split slots into 2 rows for visual parking layout
  const [topRow, bottomRow] = useMemo(() => {
    if (allSlotsForZone.length === 0) return [[], []];
    const mid = Math.ceil(allSlotsForZone.length / 2);
    return [allSlotsForZone.slice(0, mid), allSlotsForZone.slice(mid)];
  }, [allSlotsForZone]);

  // Lane label
  const selectedZoneName = useMemo(() => {
    const zone = zonesForFloor.find((z) => String(z.zoneId) === String(selectedZoneId));
    return zone?.zoneName || "";
  }, [zonesForFloor, selectedZoneId]);
  const laneLabel = selectedZoneName ? `LANE ${selectedZoneName}` : "LANE";

  // ── Handlers
  const resetForm = () => {
    setPlateNumber("");
    setSelectedVehicleTypeId(null);
    setSelectedBuildingId(null);
    setSelectedFloorId(null);
    setSelectedZoneId(null);
    setSelectedSlotId(null);
    setVehicleColor("");
    setBrand("");
    setModel("");
    setGuestName("");
    setGuestPhone("");
    setNote("");
    setCheckinImageFile(null);
    setCheckinImageUrl("");
  };

  const handleVehicleTypeChange = (val) => {
    setSelectedVehicleTypeId(val);
    setPlateNumber("");
    setSelectedBuildingId(null);
    setSelectedFloorId(null);
    setSelectedZoneId(null);
    setSelectedSlotId(null);
    dispatch(getBuildingFloorsReset());
    dispatch(getZoneSlotsReset());
  };

  const handleBuildingChange = (val) => {
    setSelectedBuildingId(val);
    setSelectedFloorId(null);
    setSelectedZoneId(null);
    setSelectedSlotId(null);
    dispatch(getZoneSlotsReset());
    if (val && selectedVehicleTypeId) {
      dispatch(getBuildingFloorsRequest({ buildingId: val, vehicleTypeId: selectedVehicleTypeId }));
    } else {
      dispatch(getBuildingFloorsReset());
    }
  };

  const handleFloorChange = (val) => {
    setSelectedFloorId(val);
    setSelectedZoneId(null);
    setSelectedSlotId(null);
    dispatch(getZoneSlotsReset());
  };

  const handleZoneChange = (val) => {
    setSelectedZoneId(val);
    setSelectedSlotId(null);
    if (val) {
      dispatch(getZoneSlotsRequest(val));
    } else {
      dispatch(getZoneSlotsReset());
    }
  };

  const handleSubmit = useCallback(() => {
    if (!plateNumber.trim()) {
      message.error("Please enter plate number");
      return;
    }
    if (!selectedVehicleTypeId) {
      message.error("Please select vehicle type");
      return;
    }
    if (!selectedSlotId) {
      message.error("Please select a parking slot");
      return;
    }

    dispatch(
      checkInGuestRequest({
        plateNumber: plateNumber.trim(),
        vehicleTypeId: String(selectedVehicleTypeId),
        slotId: String(selectedSlotId),
        vehicleColor: vehicleColor.trim() || undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        guestName: guestName.trim() || undefined,
        guestPhone: guestPhone.trim() || undefined,
        note: note.trim() || undefined,
        checkinImage: checkinImageFile || undefined,
      })
    );
  }, [
    plateNumber, selectedVehicleTypeId, selectedSlotId,
    vehicleColor, brand, model, guestName, guestPhone, note,
    checkinImageFile, dispatch,
  ]);

  const isFormValid = plateNumber.trim() && selectedVehicleTypeId && selectedSlotId;

  // ── Render
  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Staff" page="guest-entry" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600">
            <UserRound size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Guest Vehicle Check-in
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              Check in walk-in guests who don't have a system account.
            </p>
          </div>
        </div>
      </div>

      {slotsLoading || vtLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-sm border border-slate-100">
          <Spin size="large" />
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Required fields card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <Hash size={16} />
                </div>
                Required Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Type — must be selected first */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Car size={12} /> Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedVehicleTypeId}
                    onChange={handleVehicleTypeChange}
                    placeholder="Select vehicle type"
                    className="w-full !h-[46px]"
                    options={vehicleTypes?.map((vt) => ({
                      value: vt.vehicleTypeId,
                      label: vt.typeName,
                    }))}
                    allowClear
                  />
                </div>

                {/* Plate Number — enabled only after vehicle type is selected */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Hash size={12} /> Plate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={plateNumber}
                    disabled={!selectedVehicleTypeId}
                    onChange={(e) => setPlateNumber(formatPlateNumber(e.target.value))}
                    placeholder={
                      !selectedVehicleTypeId
                        ? "Select vehicle type first"
                        : isMotorbike
                          ? "e.g. 59A1 - 12345"
                          : "e.g. 51A - 12345"
                    }
                    className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-mono tracking-wider ${!selectedVehicleTypeId ? "bg-slate-50 cursor-not-allowed text-slate-400" : ""}`}
                  />
                  {selectedVehicleTypeId && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {isMotorbike ? "Format: 59A1 - 12345" : "Format: 51A - 12345"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Slot Selection card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <ParkingCircle size={16} />
                </div>
                Select Parking Slot <span className="text-red-500">*</span>
              </h2>

              {!selectedVehicleTypeId ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Car size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">
                    Please select a vehicle type first to see available slots.
                  </p>
                </div>
              ) : buildings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-8 text-center">
                  <ParkingCircle size={32} className="mx-auto text-amber-400 mb-2" />
                  <p className="text-sm text-amber-600 font-medium">
                    No available parking buildings.
                  </p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Building */}
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                      <Building2 size={12} /> Building
                    </label>
                    <Select
                      value={selectedBuildingId}
                      onChange={handleBuildingChange}
                      placeholder="Select building"
                      className="w-full !h-[46px]"
                      options={buildings.map((b) => ({
                        value: b.id,
                        label: b.name,
                      }))}
                      allowClear
                    />
                  </div>

                  {/* Floor */}
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                      <Layers size={12} /> Floor
                    </label>
                    <Select
                      value={selectedFloorId}
                      onChange={handleFloorChange}
                      placeholder="Select floor"
                      className="w-full !h-[46px]"
                      disabled={!selectedBuildingId}
                      options={floors.map((f) => ({ value: f.id, label: `${f.name} (Level ${f.level})` }))}
                      allowClear
                    />
                  </div>

                  {/* Zone */}
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                      <MapPin size={12} /> Zone
                    </label>
                    <Select
                      value={selectedZoneId}
                      onChange={handleZoneChange}
                      placeholder="Select zone"
                      className="w-full !h-[46px]"
                      disabled={!selectedFloorId}
                      options={zonesForFloor.map((z) => ({
                        value: z.zoneId,
                        label: `${z.zoneName} (${z.availableSlots} available)`,
                      }))}
                      allowClear
                    />
                  </div>

                </div>

                {/* Visual slot grid — appears after zone is selected */}
                {selectedZoneId && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    {allSlotsForZone.length === 0 ? (
                      <div className="flex min-h-[160px] items-center justify-center text-sm text-slate-500">
                        No slots in this zone.
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Context breadcrumb */}
                        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        {buildings.find((b) => String(b.id) === String(selectedBuildingId))?.name} · {floors.find((f) => String(f.id) === String(selectedFloorId))?.name} · Zone {selectedZoneName}
                        </p>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                          {[
                            { key: "AVAILABLE", label: "Available", cls: "border-2 border-dashed border-emerald-400 bg-emerald-50" },
                            { key: "OCCUPIED", label: "Occupied", cls: "bg-red-500" },
                            { key: "RESERVED", label: "Reserved", cls: "bg-violet-600" },
                            { key: "MAINTENANCE", label: "Maintenance", cls: "bg-slate-500" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center gap-2 text-xs text-slate-600">
                              <span className={`h-4 w-8 rounded-md ${item.cls}`} />
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Top row */}
                        <div className="flex flex-wrap justify-center gap-3">
                          {topRow.map((slot) => {
                            const status = (slot.slotStatus || "AVAILABLE").toUpperCase();
                            const canSelect = status === "AVAILABLE";
                            const isSelected = String(selectedSlotId) === String(slot.slotId);

                            let cardClass = "relative flex h-24 w-full min-w-[72px] max-w-[90px] flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all select-none ";
                            if (status === "OCCUPIED") cardClass += "bg-red-500 text-white border-2 border-red-600 cursor-not-allowed opacity-80";
                            else if (status === "RESERVED") cardClass += "bg-violet-600 text-white border-2 border-violet-700 cursor-not-allowed opacity-80";
                            else if (status === "MAINTENANCE") cardClass += "bg-slate-500 text-white border-2 border-slate-600 cursor-not-allowed opacity-80";
                            else cardClass += "bg-emerald-50 border-2 border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer";
                            if (isSelected) cardClass += " ring-4 ring-orange-500 ring-offset-2 scale-105";
                            else if (canSelect) cardClass += " hover:scale-105 hover:shadow-md";

                            return (
                              <button
                                key={slot.slotId}
                                type="button"
                                onClick={() => canSelect && setSelectedSlotId(slot.slotId)}
                                className={cardClass}
                              >
                                {status === "AVAILABLE" && <span className="text-sm font-semibold">{slot.slotName}</span>}
                                {status === "OCCUPIED" && (
                                  <>
                                    <Car size={22} strokeWidth={1.75} className="mb-1" />
                                    <span className="text-[10px]">{slot.slotName}</span>
                                  </>
                                )}
                                {status === "RESERVED" && (
                                  <>
                                    <Lock size={18} className="mb-1" />
                                    <span className="text-[10px]">{slot.slotName}</span>
                                  </>
                                )}
                                {status === "MAINTENANCE" && (
                                  <>
                                    <Wrench size={20} strokeWidth={1.75} className="mb-1" />
                                    <span className="text-[10px]">{slot.slotName}</span>
                                  </>
                                )}
                                {isSelected && (
                                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Lane divider */}
                        <div className="relative flex items-center justify-center py-2">
                          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-orange-200" />
                          <span className="relative bg-white px-4 text-xs font-bold tracking-[0.2em] text-orange-400">
                            {"<< "}{laneLabel}{" <<"}
                          </span>
                        </div>

                        {/* Bottom row */}
                        <div className="flex flex-wrap justify-center gap-3">
                          {bottomRow.map((slot) => {
                            const status = (slot.slotStatus || "AVAILABLE").toUpperCase();
                            const canSelect = status === "AVAILABLE";
                            const isSelected = String(selectedSlotId) === String(slot.slotId);

                            let cardClass = "relative flex h-24 w-full min-w-[72px] max-w-[90px] flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all select-none ";
                            if (status === "OCCUPIED") cardClass += "bg-red-500 text-white border-2 border-red-600 cursor-not-allowed opacity-80";
                            else if (status === "RESERVED") cardClass += "bg-violet-600 text-white border-2 border-violet-700 cursor-not-allowed opacity-80";
                            else if (status === "MAINTENANCE") cardClass += "bg-slate-500 text-white border-2 border-slate-600 cursor-not-allowed opacity-80";
                            else cardClass += "bg-emerald-50 border-2 border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer";
                            if (isSelected) cardClass += " ring-4 ring-orange-500 ring-offset-2 scale-105";
                            else if (canSelect) cardClass += " hover:scale-105 hover:shadow-md";

                            return (
                              <button
                                key={slot.slotId}
                                type="button"
                                onClick={() => canSelect && setSelectedSlotId(slot.slotId)}
                                className={cardClass}
                              >
                                {status === "AVAILABLE" && <span className="text-sm font-semibold">{slot.slotName}</span>}
                                {status === "OCCUPIED" && (
                                  <>
                                    <Car size={22} strokeWidth={1.75} className="mb-1" />
                                    <span className="text-[10px]">{slot.slotName}</span>
                                  </>
                                )}
                                {status === "RESERVED" && (
                                  <>
                                    <Lock size={18} className="mb-1" />
                                    <span className="text-[10px]">{slot.slotName}</span>
                                  </>
                                )}
                                {status === "MAINTENANCE" && (
                                  <>
                                    <Wrench size={20} strokeWidth={1.75} className="mb-1" />
                                    <span className="text-[10px]">{slot.slotName}</span>
                                  </>
                                )}
                                {isSelected && (
                                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-center text-xs text-slate-400">
                          Click on a{" "}
                          <span className="font-semibold text-emerald-600">green dashed</span>{" "}
                          slot to select it.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                </>
              )}
            </div>

            {/* Optional fields card */}
            {/* <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
                  <StickyNote size={16} />
                </div>
                Additional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Palette size={12} /> Color
                  </label>
                  <input
                    type="text"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    placeholder="e.g. White"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Car size={12} /> Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Toyota"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Car size={12} /> Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Camry"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <UserRound size={12} /> Guest Name
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Nguyen Van A"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Phone size={12} /> Guest Phone
                  </label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. 0901234567"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                  <StickyNote size={12} /> Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                />
              </div>
            </div> */}
          </div>

          {/* Right: Image Upload + Submit */}
          <div className="space-y-5">
            {/* Image upload card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                Check-in Image
              </h2>
              <Upload
                name="file"
                listType="picture-card"
                className="checkin-uploader"
                showUploadList={false}
                customRequest={async (options) => {
                  const { file, onSuccess, onError } = options;
                  setIsUploading(true);
                  try {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setCheckinImageUrl(e.target.result);
                      setCheckinImageFile(file);
                      setIsUploading(false);
                      onSuccess("Ok");
                      message.success("Image added successfully");
                    };
                    reader.readAsDataURL(file);
                  } catch (err) {
                    setIsUploading(false);
                    onError(err);
                    message.error("Failed to add image");
                  }
                }}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) message.error("You can only upload image files!");
                  return isImage;
                }}
              >
                {checkinImageUrl ? (
                  <img
                    src={checkinImageUrl}
                    alt="Vehicle Check-in"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    {isUploading ? (
                      <Spin size="small" />
                    ) : (
                      <UploadIcon size={24} />
                    )}
                    <div className="text-xs font-medium">Click to Upload</div>
                  </div>
                )}
              </Upload>
              {checkinImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCheckinImageFile(null);
                    setCheckinImageUrl("");
                  }}
                  className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Summary card */}
            {selectedSlotId && (
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <ParkingCircle size={16} /> Selected Slot Summary
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plate:</span>
                    <span className="font-bold font-mono text-slate-800">{plateNumber || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle Type:</span>
                    <span className="font-semibold text-slate-800">{selectedVehicleTypeName || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Building:</span>
                    <span className="font-semibold text-slate-800">
                      {buildings.find((b) => String(b.id) === String(selectedBuildingId))?.name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Floor:</span>
                    <span className="font-semibold text-slate-800">{floors.find((f) => f.id === selectedFloorId)?.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Slot:</span>
                    <span className="font-bold text-emerald-700">
                      {allSlotsForZone.find((s) => String(s.slotId) === String(selectedSlotId))?.slotName || "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || checkinLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: isFormValid
                  ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                  : "#94a3b8",
                boxShadow: isFormValid
                  ? "0 8px 24px rgba(249,115,22,0.35)"
                  : "none",
              }}
            >
              {checkinLoading && <Spin size="small" />}
              <LogIn size={22} />
              Check In Guest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleEntryGuest;
