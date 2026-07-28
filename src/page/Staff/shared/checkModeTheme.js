/** Check-in / check-out mode theming — one color per vehicle type. */
export const CHECK_MODES = {
  DRIVER_RESERVATION: "DRIVER_RESERVATION",
  DRIVER_WALK_IN: "DRIVER_WALK_IN",
  GUEST: "GUEST",
};

export const resolveEntryCheckMode = ({ driverReservation, isDriverWalkIn }) => {
  if (driverReservation) return CHECK_MODES.DRIVER_RESERVATION;
  if (isDriverWalkIn) return CHECK_MODES.DRIVER_WALK_IN;
  return CHECK_MODES.GUEST;
};

export const resolveExitCheckMode = ({ isDriverWalkIn, isDriver, isGuest }) => {
  if (isDriverWalkIn) return CHECK_MODES.DRIVER_WALK_IN;
  if (isDriver) return CHECK_MODES.DRIVER_RESERVATION;
  if (isGuest) return CHECK_MODES.GUEST;
  return null;
};

export const CHECK_MODE_THEME = {
  [CHECK_MODES.DRIVER_RESERVATION]: {
    key: CHECK_MODES.DRIVER_RESERVATION,
    entryTitle: "Driver Check-in",
    entryBadge: "RESERVATION FOUND",
    exitBadge: "DRIVER SESSION",
    summaryLabel: "DRIVER (RESERVED)",
    summaryShort: "DRIVER",
    tagColor: "blue",
    iconBg: "bg-indigo-50 text-indigo-500",
    accentText: "text-indigo-600",
    accentTextDark: "text-indigo-700",
    panelBg: "bg-indigo-50 border-indigo-100",
    panelLabel: "text-indigo-400",
    panelValue: "text-indigo-800",
    badgeBg: "bg-indigo-500",
    buttonGradient: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
    buttonShadow: "0 8px 24px rgba(79,70,229,0.35)",
    cardBorder: "border-indigo-100",
  },
  [CHECK_MODES.DRIVER_WALK_IN]: {
    key: CHECK_MODES.DRIVER_WALK_IN,
    entryTitle: "Driver Walk-in",
    entryBadge: "REGISTERED DRIVER",
    exitBadge: "DRIVER WALK-IN",
    summaryLabel: "DRIVER WALK-IN",
    summaryShort: "DRIVER WALK-IN",
    tagColor: "purple",
    iconBg: "bg-violet-50 text-violet-500",
    accentText: "text-violet-600",
    accentTextDark: "text-violet-700",
    panelBg: "bg-violet-50 border-violet-100",
    panelLabel: "text-violet-400",
    panelValue: "text-violet-800",
    badgeBg: "bg-violet-500",
    buttonGradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
    buttonShadow: "0 8px 24px rgba(124,58,237,0.35)",
    cardBorder: "border-violet-100",
  },
  [CHECK_MODES.GUEST]: {
    key: CHECK_MODES.GUEST,
    entryTitle: "Guest Walk-in",
    entryBadge: "NO RESERVATION",
    exitBadge: "GUEST SESSION",
    summaryLabel: "GUEST WALK-IN",
    summaryShort: "GUEST",
    tagColor: "orange",
    iconBg: "bg-orange-50 text-orange-500",
    accentText: "text-orange-600",
    accentTextDark: "text-orange-700",
    panelBg: "bg-orange-50 border-orange-100",
    panelLabel: "text-orange-400",
    panelValue: "text-orange-800",
    badgeBg: "bg-orange-500",
    buttonGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    buttonShadow: "0 8px 24px rgba(249,115,22,0.35)",
    cardBorder: "border-orange-100",
  },
};

export const getCheckModeTheme = (mode) =>
  CHECK_MODE_THEME[mode] || CHECK_MODE_THEME[CHECK_MODES.GUEST];
