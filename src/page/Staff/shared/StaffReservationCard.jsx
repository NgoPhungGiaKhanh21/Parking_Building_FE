import { Tag } from "antd";
import {
  Car,
  Building2,
  User,
  Palette,
  Hash,
  ParkingCircle,
} from "lucide-react";
import dayjs from "dayjs";

const reservationStatusConfig = {
  PENDING: { color: "gold", label: "Pending" },
  CHECKED_IN: { color: "blue", label: "Checked In" },
  ACTIVE: { color: "green", label: "Active" },
  CONFIRMED: { color: "blue", label: "Confirmed" },
  COMPLETED: { color: "default", label: "Completed" },
  CANCELLED: { color: "red", label: "Cancelled" },
  EXPIRED: { color: "default", label: "Expired" },
};

const StaffReservationCard = ({ r }) => {
  const cfg = reservationStatusConfig[r.reservationStatus] || {
    color: "default",
    label: r.reservationStatus,
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ParkingCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Slot
            </p>
            <p className="text-xl font-extrabold text-indigo-600 leading-tight">
              {r.slotName}
            </p>
            <p className="text-xs text-slate-500">
              Zone {r.zoneName} · {r.floorName}
            </p>
          </div>
        </div>
        <Tag
          color={cfg.color}
          className="flex items-center gap-1 text-xs! font-semibold! px-3! py-1!"
        >
          {cfg.label}
        </Tag>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Building</p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Building2 size={11} />
            {r.buildingName}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Start</p>
          <p className="text-xs font-semibold text-slate-700">
            {dayjs(r.reservationStart).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Vehicle Type</p>
          <p className="text-xs font-semibold text-slate-700">{r.floorVehicleTypeName}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: User, label: "Driver", value: r.username },
          { icon: Hash, label: "Plate", value: r.vehiclePlate, mono: true },
          { icon: Car, label: "Vehicle", value: `${r.vehicleBrand} ${r.vehicleModel}` },
        ].map(({ icon: Icon, label, value, mono }) => (
          <div key={label} className="rounded-lg bg-indigo-50 p-3">
            <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
              <Icon size={10} /> {label}
            </p>
            <p className={`text-xs font-semibold text-indigo-700 ${mono ? "font-bold font-mono" : ""}`}>
              {value}
            </p>
          </div>
        ))}
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
          <span className="text-[10px] font-bold uppercase text-slate-400">Ticket:</span>
          <code className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700">
            {r.ticketCode}
          </code>
        </div>
      )}
    </div>
  );
};

export default StaffReservationCard;
