export const SLOT_STATUS_LEGEND = [
  {
    key: "AVAILABLE",
    label: "Available",
    swatchClass: "border-2 border-dashed border-violet-300 bg-violet-50",
  },
  {
    key: "OCCUPIED",
    label: "Occupied",
    swatchClass: "bg-red-500",
  },
  {
    key: "RESERVED",
    label: "Reserved",
    swatchClass: "bg-violet-600",
  },
  {
    key: "PENDING_EXIT",
    label: "Pending Exit",
    swatchClass: "bg-sky-500",
  },
  {
    key: "MAINTENANCE",
    label: "Maintenance",
    swatchClass: "bg-orange-500",
  },
];

export const getSlotCardClass = (status, isSelected) => {
  const base =
    "relative flex h-24 w-full min-w-[72px] max-w-[88px] flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-all";

  const ring = isSelected ? " ring-4 ring-blue-500 ring-offset-2" : "";

  switch (status) {
    case "OCCUPIED":
      return `${base}${ring} bg-red-500 text-white shadow-sm`;
    case "RESERVED":
      return `${base}${ring} bg-violet-600 text-white shadow-sm`;
    case "PENDING_EXIT":
      return `${base}${ring} bg-sky-500 text-white shadow-sm`;
    case "MAINTENANCE":
      return `${base}${ring} bg-orange-500 text-white shadow-sm`;
    default:
      return `${base}${ring} border-2 border-dashed border-violet-300 bg-violet-50/80 text-slate-700`;
  }
};
