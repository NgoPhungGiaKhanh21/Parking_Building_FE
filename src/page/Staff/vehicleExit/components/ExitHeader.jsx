import { LogOut } from "lucide-react";
import CommonBreadcrumb from "../../../../components/Commandbreadcrumb/Commandbreadcrumb";

const ExitHeader = () => (
  <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
    <div className="mb-4">
      <CommonBreadcrumb role="Staff" page="exit" />
    </div>
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
        <LogOut size={28} strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
          Unified Vehicle Check-out
        </h1>
        <p className="mt-1 font-medium text-slate-500">
          OCR scanning auto-detects Drivers vs Guests. Find session → Payment → Check out.
        </p>
      </div>
    </div>
  </div>
);

export default ExitHeader;
