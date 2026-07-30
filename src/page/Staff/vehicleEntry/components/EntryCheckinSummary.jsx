import { Spin } from "antd";
import { LogIn } from "lucide-react";
import { getCheckModeTheme } from "../../shared/checkModeTheme";

const EntryCheckinSummary = ({
  checkMode,
  plateInput,
  driverReservation,
  isDriverWalkIn,
  walkInVehicle,
  vehicleTypes,
  walkInVehicleTypeId,
  selectedVehicleTypeId,
  plateImageUrl,
  checkinImageUrl,
  lookupLoading,
  isAlreadyParked,
  buildingId,
  checkinLoading,
  onSubmit,
}) => {
  const theme = checkMode ? getCheckModeTheme(checkMode) : null;
  const vehicleTypeId = isDriverWalkIn ? walkInVehicleTypeId : selectedVehicleTypeId;
  const vehicleTypeName =
    vehicleTypes?.find((v) => String(v.vehicleTypeId) === String(vehicleTypeId))?.typeName || "—";

  const canSubmit =
    plateImageUrl &&
    plateInput &&
    checkinImageUrl &&
    !lookupLoading &&
    !isAlreadyParked &&
    (driverReservation || (buildingId && vehicleTypeId)) &&
    !checkinLoading;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-linear-to-br from-slate-50 to-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <LogIn size={16} /> Check-in Summary
        </h3>
        <div className="space-y-3 text-xs">
          <SummaryRow label="Plate Number" value={plateInput || "—"} mono />
          <SummaryRow
            label="Mode"
            value={theme?.summaryLabel ?? "—"}
            valueClass={theme ? `font-bold ${theme.accentText}` : "text-slate-400"}
          />
          {!driverReservation && (
            <SummaryRow label="Vehicle Type" value={vehicleTypeName} />
          )}
          {isDriverWalkIn && walkInVehicle && (
            <SummaryRow
              label="Driver Name"
              value={walkInVehicle.driverFullName || walkInVehicle.username || "—"}
            />
          )}
          {driverReservation && (
            <SummaryRow label="Driver Name" value={driverReservation.username} />
          )}
          <SummaryRow
            label="Plate Image"
            value={plateImageUrl ? "✓ Uploaded" : "Not uploaded"}
            valueClass={plateImageUrl ? "text-emerald-600" : "text-slate-400"}
          />
          <SummaryRow
            label="Check-in Image"
            value={checkinImageUrl ? "✓ Uploaded" : "Not uploaded"}
            valueClass={checkinImageUrl ? "text-emerald-600" : "text-slate-400"}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        style={
          theme
            ? { background: theme.buttonGradient, boxShadow: theme.buttonShadow }
            : { background: "#94a3b8", boxShadow: "none" }
        }
      >
        {checkinLoading && <Spin size="small" />}
        <LogIn size={22} />
        Confirm Check-in
      </button>
    </div>
  );
};

const SummaryRow = ({ label, value, mono, valueClass = "font-semibold text-slate-800" }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
    <span className="text-slate-500">{label}:</span>
    <span className={`${valueClass} ${mono ? "font-bold font-mono text-sm" : ""}`}>{value}</span>
  </div>
);

export default EntryCheckinSummary;
