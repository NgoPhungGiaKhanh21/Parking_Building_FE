import { CheckCircle2, LogOut } from "lucide-react";
import { formatParkingDurationLabel } from "../../../../utils/reservationSessionUtils";
import { getCheckModeTheme } from "../../shared/checkModeTheme";

const formatCurrency = (value) =>
  value != null ? `${Number(value).toLocaleString("vi-VN")}đ` : "—";

const ExitCheckoutSummary = ({
  checkMode,
  plateInput,
  normalizedSession,
  amount,
  plateImageUrl,
  paymentReady,
  isPaid,
  isCashCheckout,
}) => {
  const theme = checkMode ? getCheckModeTheme(checkMode) : null;

  const rows = [
    {
      label: "Plate Number",
      value: plateInput || normalizedSession?.vehiclePlate || "—",
      mono: true,
    },
    {
      label: "Ticket Code",
      value: normalizedSession?.ticketCode || "—",
      mono: true,
    },
    {
      label: "Mode",
      value: theme?.summaryShort || "—",
      bold: true,
      color: theme?.accentText,
    },
    { label: "Fee", value: normalizedSession ? formatCurrency(amount) : "—" },
    {
      label: "Duration",
      value: normalizedSession ? formatParkingDurationLabel(normalizedSession) : "—",
    },
    {
      label: "Payment",
      value: isPaid ? "✓ Paid" : isCashCheckout ? "Cash at check-out" : "✗ Unpaid",
      ok: paymentReady,
    },
    {
      label: "Plate Image",
      value: plateImageUrl ? "✓ Uploaded" : "Not uploaded",
      ok: !!plateImageUrl,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-linear-to-br from-slate-50 to-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
        <LogOut size={16} /> Check-out Summary
      </h3>
      <div className="space-y-2 text-xs">
        {rows.map((item) => (
          <div
            key={item.label}
            className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0"
          >
            <span className="text-slate-500">{item.label}:</span>
            <span
              className={`font-semibold ${item.mono ? "font-mono" : ""} ${item.bold ? "font-bold" : ""} ${
                item.color ||
                (item.ok === true
                  ? "text-emerald-600"
                  : item.ok === false
                    ? "text-red-500"
                    : "text-slate-800")
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ExitReadinessCheck = ({ plateImageUrl, plateInput, normalizedSession, paymentReady, isCashCheckout }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wide">Readiness Check</h3>
    <div className="space-y-2">
      {[
        { label: "Plate image uploaded", ok: !!plateImageUrl },
        { label: "Plate identified", ok: !!plateInput },
        { label: "Session found", ok: !!normalizedSession },
        {
          label: isCashCheckout ? "Cash payment selected" : "Payment completed",
          ok: paymentReady,
        },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs">
          <div
            className={`h-4 w-4 rounded-full flex items-center justify-center ${
              item.ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            {item.ok ? (
              <CheckCircle2 size={10} />
            ) : (
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            )}
          </div>
          <span className={item.ok ? "text-slate-700 font-medium" : "text-slate-400"}>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ExitCheckoutSummary;
