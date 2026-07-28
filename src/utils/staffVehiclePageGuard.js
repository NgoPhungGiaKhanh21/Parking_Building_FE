/** Tracks whether Staff Entry/Exit pages are mounted (suppress stale toasts). */
let entryMounted = false;
let exitMounted = false;

export const setStaffEntryMounted = (mounted) => {
  entryMounted = mounted;
};

export const setStaffExitMounted = (mounted) => {
  exitMounted = mounted;
};

export const isStaffVehiclePageMounted = () => entryMounted || exitMounted;
