import { Tag } from "antd";
import { Hash, MapPin, Car, User, Palette, Clock } from "lucide-react";
import dayjs from "dayjs";
import { formatParkingDurationLabel } from "../../../../utils/reservationSessionUtils";
import { getCheckModeTheme } from "../../shared/checkModeTheme";

const formatCurrency = (value) =>
  value != null ? `${Number(value).toLocaleString("vi-VN")}đ` : "—";

const formatDateTime = (value) =>
  value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";

const ExitSessionInfoCard = ({
  checkMode,
  normalizedSession,
  isDriver,
  isGuest,
  isPaid,
  isCashCheckout,
  amount,
}) => {
  const theme = getCheckModeTheme(checkMode);

  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm relative overflow-hidden ${theme.cardBorder}`}>
      <div className={`absolute top-0 right-0 rounded-bl-2xl px-4 py-1 text-xs font-bold text-white shadow-sm ${theme.badgeBg}`}>
        {theme.exitBadge}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 mt-2">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Ticket Code</p>
          <p className="font-mono text-lg font-black text-emerald-700">
            {normalizedSession.ticketCode}
          </p>
        </div>
        <div className="flex gap-2 mr-32">
          <Tag color="blue">{normalizedSession.vehicleTypeName || "Vehicle"}</Tag>
          <Tag color={isPaid ? "green" : isCashCheckout ? "cyan" : "gold"}>
            {isPaid ? "Paid" : isCashCheckout ? "Cash Selected" : "Unpaid"}
          </Tag>
        </div>
      </div>

      <div className="rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 p-4 text-white mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Estimated Fee</p>
            <p className="text-2xl font-black">{formatCurrency(amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Check-in</p>
            <p className="text-sm font-semibold">{formatDateTime(normalizedSession.checkinTime)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {[
          { icon: Hash, label: "Plate", value: normalizedSession.vehiclePlate },
          { icon: MapPin, label: "Slot", value: normalizedSession.slotName },
          {
            icon: MapPin,
            label: "Location",
            value: [normalizedSession.zoneName, normalizedSession.floorName].filter(Boolean).join(" · "),
          },
          { icon: Car, label: "Building", value: normalizedSession.buildingName },
        ].map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
            <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-0.5">
              <item.icon size={10} />
              {item.label}
            </p>
            <p className="text-xs font-bold text-slate-700 truncate">{item.value || "—"}</p>
          </div>
        ))}
      </div>

      {isDriver && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            {
              icon: User,
              label: "Driver Name",
              value:
                normalizedSession.driverFullName ||
                normalizedSession.username ||
                normalizedSession.driverUsername ||
                "—",
            },
            {
              icon: Car,
              label: "Brand/Model",
              value: `${normalizedSession.vehicleBrand || ""} ${normalizedSession.vehicleModel || ""}`.trim() || "—",
            },
            { icon: Palette, label: "Color", value: normalizedSession.vehicleColor || "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className={`rounded-lg border p-2.5 ${theme.panelBg}`}>
              <p className={`text-[9px] font-bold uppercase flex items-center gap-1 mb-0.5 ${theme.panelLabel}`}>
                <Icon size={10} /> {label}
              </p>
              <p className={`text-xs font-bold truncate ${theme.panelValue}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {isGuest && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="rounded-lg border border-orange-100 bg-orange-50 p-2.5">
            <p className="text-[9px] font-bold uppercase text-orange-400 flex items-center gap-1 mb-0.5">
              <Clock size={10} /> Parking Duration
            </p>
            <p className="text-xs font-bold text-orange-700 truncate">
              {formatParkingDurationLabel(normalizedSession)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExitSessionInfoCard;
