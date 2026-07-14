import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Select,
    Spin,
    Form,
    Tag,
    Tabs,
} from "antd";
import {
    Car,
    Lock,
    MapPin,
    Layers,
    ChevronRight,
    ParkingCircle,
    ClipboardList,
} from "lucide-react";

import { getAllVehicleRequest } from "../../../redux/driver/vehicleManagement/getAllVehicle/getAllVehicleSlice";
import { getAvailableBuildingsRequest } from "../../../redux/driver/reservationManagement/getAvailableBuildings/getAvailableBuildingsSlice";
import { getBuildingFloorsRequest, getBuildingFloorsReset } from "../../../redux/driver/reservationManagement/getBuildingFloors/getBuildingFloorsSlice";
import { getZoneSlotsRequest, getZoneSlotsReset } from "../../../redux/driver/reservationManagement/getZoneSlots/getZoneSlotsSlice";
import { createReservationsRequest } from "../../../redux/driver/reservationManagement/createReservations/createReservationsSlice";
import { getMyReservationsRequest } from "../../../redux/driver/reservationManagement/getMyReservations/getMyReservationsSlice";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import VehicleDetailModal from "./VehicleDetailModal";
import MyReservationsTab from "./MyReservationsTab";
import BookingModal from "./BookingModal";

// ─── Slot status config ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    AVAILABLE: {
        label: "Available",
        bg: "bg-emerald-50 border-2 border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer",
        badge: "bg-emerald-100 text-emerald-700",
    },
    RESERVED: {
        label: "Reserved",
        bg: "bg-violet-600 text-white border-2 border-violet-700 cursor-not-allowed opacity-80",
        badge: "bg-violet-100 text-violet-700",
    },
    OCCUPIED: {
        label: "Occupied",
        bg: "bg-red-500 text-white border-2 border-red-600 cursor-not-allowed opacity-80",
        badge: "bg-red-100 text-red-700",
    },
    MAINTENANCE: {
        label: "Maintenance",
        bg: "bg-slate-500 text-white border-2 border-slate-600 cursor-not-allowed opacity-80",
        badge: "bg-slate-100 text-slate-700",
    },
};

const LEGEND = ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"];

// ─── Single slot cell ──────────────────────────────────────────────────────────
const SlotCell = ({ slot, isSelected, onSelect }) => {
    const status = slot.slotStatus || "AVAILABLE";
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE;
    const canSelect = status === "AVAILABLE";

    return (
        <button
            type="button"
            onClick={() => canSelect && onSelect(slot)}
            className={`relative flex h-24 w-full min-w-[72px] max-w-[90px] flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all select-none
        ${cfg.bg}
        ${isSelected ? "ring-4 ring-blue-500 ring-offset-2 scale-105" : ""}
        ${canSelect ? "hover:scale-105 hover:shadow-md" : ""}`}
        >
            {status === "AVAILABLE" && (
                <span className="text-sm font-semibold">{slot.slotName}</span>
            )}
            {status === "RESERVED" && (
                <>
                    <Lock size={18} className="mb-1" />
                    <span className="text-[10px]">{slot.slotName}</span>
                </>
            )}
            {status === "OCCUPIED" && (
                <>
                    <Car size={22} strokeWidth={1.75} className="mb-1" />
                    <span className="text-[10px]">{slot.slotName}</span>
                </>
            )}
            {status === "MAINTENANCE" && (
                <span className="text-[10px] text-center px-1">{slot.slotName}</span>
            )}
            {isSelected && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
            )}
        </button>
    );
};

// ─── Vehicle selector card ─────────────────────────────────────────────────────
const VehicleCard = ({ vehicle, isSelected, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200 w-full cursor-pointer
                ${isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                }`}
        >
            {isSelected && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs">✓</span>
            )}
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
            }`}>
                <Car size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {vehicle.brand}
                </span>
                <span className="text-sm font-extrabold text-gray-800">{vehicle.model}</span>
                <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                    isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>
                    {vehicle.plateNumber}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <span
                    className="h-3.5 w-3.5 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: vehicle.vehicleColor || "#ccc" }}
                />
                <span className="text-xs text-gray-500 capitalize">{vehicle.vehicleColor}</span>
            </div>
            <Tag color={vehicle.vehicleTypeName?.toLowerCase().includes("motor") || vehicle.vehicleTypeName?.toLowerCase().includes("bike") ? "orange" : "blue"} className="!mt-0.5 !text-[10px]">
                {vehicle.vehicleTypeName}
            </Tag>
        </button>
    );
};

// ─── Main component ────────────────────────────────────────────────────────────
const ReservationManagement = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    // ── Step state
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const [selectedFloorId, setSelectedFloorId] = useState(null);
    const [selectedZoneId, setSelectedZoneId] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── Vehicle detail modal state
    const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

    const handleOpenVehicleModal = useCallback((vehicleId) => {
        setSelectedVehicleId(vehicleId);
        setVehicleModalOpen(true);
    }, []);

    const handleCloseVehicleModal = useCallback(() => {
        setVehicleModalOpen(false);
        setSelectedVehicleId(null);
    }, []);

    // ── Redux
    const { getAllVehicles, loading: vehiclesLoading } = useSelector(
        (state) => state.getAllVehicle
    );
    const { buildings: rawBuildings, loading: buildingsLoading } = useSelector(
        (state) => state.getAvailableBuildings
    );
    const { floors: rawFloors, loading: floorsLoading } = useSelector(
        (state) => state.getBuildingFloorsDriver
    );
    const { slots: rawSlots, loading: slotsLoading } = useSelector(
        (state) => state.getZoneSlots
    );
    const {
        createReservation,
        loading: createLoading,
        error: createError,
    } = useSelector((state) => state.createReservation);

    const { myReservations, loading: reservationsLoading } = useSelector(
        (state) => state.getMyReservations
    );

    // ── Fetch on mount
    useEffect(() => {
        dispatch(getAllVehicleRequest());
        dispatch(getAvailableBuildingsRequest());
        dispatch(getMyReservationsRequest());
    }, [dispatch]);

    // ── Close modal + refresh after successful creation
    useEffect(() => {
        if (createReservation && !createLoading && !createError) {
            setIsModalOpen(false);
            setSelectedSlot(null);
            setSelectedVehicle(null);
            form.resetFields();
            dispatch(getAvailableBuildingsRequest());
            dispatch(getMyReservationsRequest());
            // Re-fetch zone slots if a zone is still selected
            if (selectedZoneId) {
                dispatch(getZoneSlotsRequest(selectedZoneId));
            }
        }
    }, [createReservation, createLoading, createError, dispatch, form, selectedZoneId]);

    // ── Derived data
    const vehicleList = useMemo(
        () => getAllVehicles?.data || [],
        [getAllVehicles]
    );

    const myReservationList = useMemo(() =>
        Array.isArray(myReservations) ? myReservations : [],
        [myReservations]
    );

    const ACTIVE_STATUSES = ["ACTIVE", "PENDING", "CONFIRMED"];

    // Buildings from API
    const buildings = useMemo(
        () => (rawBuildings || []).map((b) => ({
            id: b.buildingId,
            name: b.name,
            operatingStartTime: b.operatingStartTime || null,
            operatingEndTime: b.operatingEndTime || null,
            operatingHoursDisplay: b.operatingHoursDisplay || null,
        })),
        [rawBuildings]
    );

    // Floors from API (filtered by vehicle type already via query param)
    const floors = useMemo(() => {
        if (!rawFloors || !selectedVehicle) return [];
        return rawFloors
            .filter((f) => f.vehicleTypeId === selectedVehicle.vehicleTypeId)
            .map((f) => ({ id: f.floorId, name: f.floorName || `Floor ${f.floorNumber}`, level: f.floorLevel ?? f.floorNumber }));
    }, [rawFloors, selectedVehicle]);

    // Zones for selected floor
    const zones = useMemo(() => {
        if (!selectedFloorId || !rawFloors) return [];
        const floor = rawFloors.find((f) => f.floorId === selectedFloorId);
        return (floor?.zones || []).map((z) => ({
            id: z.zoneId,
            name: z.zoneName,
            totalSlots: z.slotSummary?.total ?? z.totalSlots,
            availableSlots: z.slotSummary?.available ?? z.availableSlots,
        }));
    }, [rawFloors, selectedFloorId]);

    // Slots for selected zone (from getZoneSlots)
    const slots = useMemo(() => {
        const raw = Array.isArray(rawSlots) ? [...rawSlots] : [];
        return raw.sort((a, b) =>
            (a.slotName || "").localeCompare(b.slotName || "", undefined, { numeric: true, sensitivity: "base" })
        );
    }, [rawSlots]);

    // Split slots into 2 rows for visual parking layout
    const [topRow, bottomRow] = useMemo(() => {
        if (slots.length === 0) return [[], []];
        const mid = Math.ceil(slots.length / 2);
        return [slots.slice(0, mid), slots.slice(mid)];
    }, [slots]);

    // Selected context labels
    const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
    const selectedFloor = floors.find((f) => f.id === selectedFloorId);
    const selectedZone = zones.find((z) => z.id === selectedZoneId);
    const laneLabel = selectedZone?.name ? `LANE ${selectedZone.name}` : "LANE";

    // ── Handlers
    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setSelectedBuildingId(null);
        setSelectedFloorId(null);
        setSelectedZoneId(null);
        setSelectedSlot(null);
        dispatch(getBuildingFloorsReset());
        dispatch(getZoneSlotsReset());
    };

    const handleBuildingChange = (value) => {
        setSelectedBuildingId(value);
        setSelectedFloorId(null);
        setSelectedZoneId(null);
        setSelectedSlot(null);
        dispatch(getZoneSlotsReset());
        if (value) {
            dispatch(getBuildingFloorsRequest({
                buildingId: value,
                vehicleTypeId: selectedVehicle?.vehicleTypeId || null,
            }));
        } else {
            dispatch(getBuildingFloorsReset());
        }
    };

    const handleFloorChange = (value) => {
        setSelectedFloorId(value);
        setSelectedZoneId(null);
        setSelectedSlot(null);
        dispatch(getZoneSlotsReset());
    };

    const handleZoneChange = (value) => {
        setSelectedZoneId(value);
        setSelectedSlot(null);
        if (value) {
            dispatch(getZoneSlotsRequest(value));
        } else {
            dispatch(getZoneSlotsReset());
        }
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const handleSubmit = (values) => {
        const payload = {
            plateNumber: selectedVehicle.plateNumber,
            vehicleColor: selectedVehicle.vehicleColor,
            brand: selectedVehicle.brand,
            model: selectedVehicle.model,
            vehicleTypeId: selectedVehicle.vehicleTypeId,
            slotId: selectedSlot.slotId,
            reservationStart: values.reservationStart.format("YYYY-MM-DDTHH:mm:ss"),
        };
        dispatch(createReservationsRequest(payload));
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedSlot(null);
        form.resetFields();
    };

    // ── Render
    const [activeTab, setActiveTab] = useState("book");
    const [reservationSubTab, setReservationSubTab] = useState("PENDING");

    return (
        <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
            {/* ── Header ── */}
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <CommonBreadcrumb role="Driver" page="reservation" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
                        <ParkingCircle size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                            Reserve a Parking Slot
                        </h1>
                        <p className="mt-1 font-medium text-slate-500">
                            Choose your vehicle, find an available slot, and book your spot.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <Tabs
                activeKey={activeTab}
                onChange={(key) => { setActiveTab(key); }}
                size="large"
                className="reservation-tabs"
                items={[
                    {
                        key: "book",
                        label: (
                            <span className="flex items-center gap-2 font-semibold">
                                <ParkingCircle size={16} /> Book a Slot
                            </span>
                        ),
                        children: (
                            <div className="space-y-6">
                                {/* ── Step 1: Choose Vehicle ── */}
                                <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                            1
                                        </span>
                                        <h2 className="text-base font-bold text-slate-700">
                                            Select Your Vehicle
                                        </h2>
                                    </div>

                                    {vehiclesLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Spin size="large" />
                                        </div>
                                    ) : vehicleList.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-400">
                                            <Car size={40} className="mx-auto mb-3 opacity-50" />
                                            <p className="font-medium">No vehicles registered.</p>
                                            <p className="text-sm">Please add a vehicle in My Vehicles first.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {vehicleList.map((v) => (
                                                <VehicleCard
                                                    key={v.vehicleId}
                                                    vehicle={v}
                                                    isSelected={selectedVehicle?.vehicleId === v.vehicleId}
                                                    onClick={() => handleVehicleSelect(v)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ── Step 2: Select Building / Floor / Zone ── */}
                                {selectedVehicle && (
                                    <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                                2
                                            </span>
                                            <h2 className="text-base font-bold text-slate-700">
                                                Select Location
                                            </h2>
                                            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                                                <Car size={13} />
                                                {selectedVehicle.vehicleTypeName} only floors will be shown
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            {/* Building */}
                                            <div>
                                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    <MapPin size={13} /> Building
                                                </label>
                                                <Select
                                                    className="w-full"
                                                    placeholder="Select building"
                                                    options={buildings.map((b) => ({ value: b.id, label: b.name }))}
                                                    value={selectedBuildingId}
                                                    onChange={handleBuildingChange}
                                                    allowClear
                                                    onClear={() => handleBuildingChange(null)}
                                                />
                                            </div>

                                            {/* Floor */}
                                            <div>
                                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    <Layers size={13} /> Floor
                                                </label>
                                                <Select
                                                    className="w-full"
                                                    placeholder="Select floor"
                                                    options={floors.map((f) => ({
                                                        value: f.id,
                                                        label: `${f.name} (Level ${f.level})`,
                                                    }))}
                                                    value={selectedFloorId}
                                                    onChange={handleFloorChange}
                                                    disabled={!selectedBuildingId}
                                                    allowClear
                                                    onClear={() => handleFloorChange(null)}
                                                />
                                                {selectedBuildingId && floors.length === 0 && (
                                                    <p className="mt-1 text-xs text-amber-500">
                                                        No floors support <strong>{selectedVehicle.vehicleTypeName}</strong> in this building.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Zone */}
                                            <div>
                                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    <ChevronRight size={13} /> Zone
                                                </label>
                                                <Select
                                                    className="w-full"
                                                    placeholder="Select zone"
                                                    options={zones.map((z) => ({
                                                        value: z.id,
                                                        label: `Zone ${z.name} (${z.availableSlots}/${z.totalSlots} available)`,
                                                    }))}
                                                    value={selectedZoneId}
                                                    onChange={handleZoneChange}
                                                    disabled={!selectedFloorId}
                                                    allowClear
                                                    onClear={() => handleZoneChange(null)}
                                                />
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
                                            {LEGEND.map((key) => {
                                                const cfg = STATUS_CONFIG[key];
                                                return (
                                                    <div key={key} className="flex items-center gap-2 text-xs text-slate-600">
                                                        <span
                                                            className={`h-4 w-8 rounded-md border-2 ${key === "AVAILABLE"
                                                                    ? "border-dashed border-emerald-400 bg-emerald-50"
                                                                    : key === "RESERVED"
                                                                        ? "border-violet-700 bg-violet-600"
                                                                        : key === "OCCUPIED"
                                                                            ? "border-red-600 bg-red-500"
                                                                            : "border-slate-600 bg-slate-500"
                                                                }`}
                                                        />
                                                        <span>{cfg.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 3: Slot Map ── */}
                                {selectedVehicle && (
                                    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                                        <div className="mb-4 flex items-center gap-2">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                                3
                                            </span>
                                            <h2 className="text-base font-bold text-slate-700">
                                                Choose a Slot
                                            </h2>
                                        </div>

                                        {!selectedZoneId ? (
                                            <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                                                <ParkingCircle size={48} className="mb-3 text-slate-300" />
                                                <p className="text-sm font-medium text-slate-500">
                                                    {!selectedBuildingId
                                                        ? "Select a building to get started."
                                                        : !selectedFloorId
                                                            ? "Now select a floor."
                                                            : "Finally, select a zone to see the parking map."}
                                                </p>
                                            </div>
                                        ) : slotsLoading ? (
                                            <div className="flex min-h-[240px] items-center justify-center">
                                                <Spin size="large" />
                                            </div>
                                        ) : slots.length === 0 ? (
                                            <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">
                                                No slots in this zone.
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Context breadcrumb */}
                                                <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                                    {selectedBuilding?.name} · {selectedFloor?.name} · Zone {selectedZone?.name}
                                                </p>

                                                {/* Top row */}
                                                <div className="flex flex-wrap justify-center gap-3">
                                                    {topRow.map((slot) => (
                                                        <SlotCell
                                                            key={slot.slotId}
                                                            slot={slot}
                                                            isSelected={selectedSlot?.slotId === slot.slotId}
                                                            onSelect={handleSlotSelect}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Lane divider */}
                                                <div className="relative flex items-center justify-center py-2">
                                                    <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-blue-200" />
                                                    <span className="relative bg-white px-4 text-xs font-bold tracking-[0.2em] text-blue-400">
                                                        {"<< "}{laneLabel}{" <<"}
                                                    </span>
                                                </div>

                                                {/* Bottom row */}
                                                <div className="flex flex-wrap justify-center gap-3">
                                                    {bottomRow.map((slot) => (
                                                        <SlotCell
                                                            key={slot.slotId}
                                                            slot={slot}
                                                            isSelected={selectedSlot?.slotId === slot.slotId}
                                                            onSelect={handleSlotSelect}
                                                        />
                                                    ))}
                                                </div>

                                                <p className="text-center text-xs text-slate-400">
                                                    Click on a{" "}
                                                    <span className="font-semibold text-emerald-600">green dashed</span>{" "}
                                                    slot to book it.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "reservations",
                        label: (
                            <span className="flex items-center gap-2 font-semibold">
                                <ClipboardList size={16} /> My Reservations
                                {myReservationList.filter(r => ACTIVE_STATUSES.includes(r.reservationStatus)).length > 0 && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                        {myReservationList.filter(r => ACTIVE_STATUSES.includes(r.reservationStatus)).length}
                                    </span>
                                )}
                            </span>
                        ),
                        children: (
                            <MyReservationsTab
                                myReservationList={myReservationList}
                                reservationsLoading={reservationsLoading}
                                reservationSubTab={reservationSubTab}
                                setReservationSubTab={setReservationSubTab}
                                onOpenVehicleModal={handleOpenVehicleModal}
                            />
                        ),
                    },
                ]}
            />

            {/* ── Booking Modal ── */}
            <BookingModal
                open={isModalOpen}
                onClose={handleModalClose}
                selectedVehicle={selectedVehicle}
                selectedSlot={selectedSlot}
                selectedBuilding={selectedBuilding}
                selectedFloor={selectedFloor}
                selectedZone={selectedZone}
                form={form}
                createLoading={createLoading}
                onSubmit={handleSubmit}
                operatingStartTime={selectedBuilding?.operatingStartTime}
                operatingEndTime={selectedBuilding?.operatingEndTime}
                operatingHoursDisplay={selectedBuilding?.operatingHoursDisplay}
            />

            {/* ── Vehicle Detail Modal ── */}
            <VehicleDetailModal
                open={vehicleModalOpen}
                onClose={handleCloseVehicleModal}
                vehicleId={selectedVehicleId}
            />
        </div>
    );
};

export default ReservationManagement;
