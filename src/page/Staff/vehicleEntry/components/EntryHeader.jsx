import { LogIn, ClipboardList } from "lucide-react";
import CommonBreadcrumb from "../../../../components/Commandbreadcrumb/Commandbreadcrumb";

const EntryHeader = ({ onOpenManageModal }) => (
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
      type="button"
      onClick={onOpenManageModal}
      className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-colors shadow-sm self-start"
    >
      <ClipboardList size={18} />
      Manage Reservations
    </button>
  </div>
);

export default EntryHeader;
