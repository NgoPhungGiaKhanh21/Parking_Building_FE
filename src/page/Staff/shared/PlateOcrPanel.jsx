import { Spin, Input } from "antd";
import { CheckCircle2, AlertCircle, ScanLine } from "lucide-react";

const PlateOcrPanel = ({
  ocrLoading,
  plateInput,
  plateImageUrl,
  onPlateChange,
  showManualFallback = true,
}) => {
  if (ocrLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-xl border border-dashed border-blue-200 bg-blue-50">
        <Spin size="default" />
        <p className="mt-3 text-sm font-medium text-blue-600 animate-pulse">
          <ScanLine size={16} className="inline mr-1" /> Reading plate...
        </p>
      </div>
    );
  }

  if (plateInput) {
    return (
      <div className="p-5 md:p-6 rounded-xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-white">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-[10px] md:text-xs font-bold uppercase text-emerald-600 tracking-wide">
            Recognized Plate
          </span>
        </div>
        <div className="bg-white rounded-xl border-2 border-emerald-300 overflow-hidden text-center flex justify-center focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
          <Input
            value={plateInput}
            onChange={(e) => onPlateChange(e.target.value.toUpperCase())}
            variant="borderless"
            className="text-2xl md:text-3xl font-black font-mono tracking-[0.15em] text-slate-800 py-3 text-center w-full"
            placeholder="ENTER PLATE"
          />
        </div>
        <p className="mt-2 text-[10px] md:text-[11px] text-slate-400 text-center">
          Edit plate if incorrect to auto-search
        </p>
      </div>
    );
  }

  if (showManualFallback && plateImageUrl) {
    return (
      <div className="p-5 md:p-6 rounded-xl border border-dashed border-amber-200 bg-amber-50 text-center">
        <AlertCircle size={20} className="mx-auto text-amber-400 mb-2" />
        <p className="text-sm text-amber-600 font-medium">
          Could not read plate. Type it manually.
        </p>
        <Input
          value={plateInput}
          onChange={(e) => onPlateChange(e.target.value.toUpperCase())}
          className="mt-3 font-mono text-center font-bold"
          placeholder="Type plate here"
        />
      </div>
    );
  }

  return (
    <div className="p-5 md:p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <ScanLine size={28} className="mx-auto text-slate-300 mb-2" />
      <p className="text-sm text-slate-400 font-medium">Upload plate image to start</p>
    </div>
  );
};

export default PlateOcrPanel;
