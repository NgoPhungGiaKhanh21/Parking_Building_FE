import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Upload, message, Select } from "antd";
import {
  Car,
  Building2,
  LogIn,
  Hash,
  Upload as UploadIcon,
  UserRound,
  ImageIcon,
  ScanLine,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getVehicleTypeListRequest } from "../../../redux/manager/Building/getVehicleTypeList/getVehicleTypeListSlice";
import {
  checkInGuestRequest,
  checkInGuestReset,
} from "../../../redux/staff/guest_parking/checkin_guest/checkInGuestSlice";
import {
  ocrPlateRequest,
  ocrPlateReset,
} from "../../../redux/staff/ocrPlate/ocrPlateSlice";
import {
  getStaffBuildingRequest,
} from "../../../redux/staff/guest_parking/getStaffBuilding/getStaffBuildingSlice";

const VehicleEntryGuest = () => {
  const dispatch = useDispatch();
  const plateImageFileRef = useRef(null); // Keep file ref outside Redux (non-serializable)

  // ── Form state
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState(null);
  const [plateImageUrl, setPlateImageUrl] = useState(""); // Preview URL
  const [isUploading, setIsUploading] = useState(false);

  // ── Redux selectors
  const { vehicleTypes, loading: vtLoading } = useSelector((s) => s.getVehicleTypeList);
  const { loading: checkinLoading, checkInGuest } = useSelector((s) => s.checkInGuest);
  const { ocrPlate, loading: ocrLoading } = useSelector((s) => s.ocrPlate);
  const { getStaffBuilding: staffBuilding, loading: staffBuildingLoading } = useSelector((s) => s.getStaffBuilding);

  // ── Derived values
  const recognizedPlate = useMemo(() => {
    if (!ocrPlate) return null;
    // The OCR response may have different structures, try common fields
    return ocrPlate?.data?.plateNumber || ocrPlate?.plateNumber || ocrPlate?.data || null;
  }, [ocrPlate]);

  const buildingName = useMemo(() => {
    if (!staffBuilding) return null;
    // staffBuilding could be an object or array depending on API
    if (Array.isArray(staffBuilding) && staffBuilding.length > 0) {
      return staffBuilding[0]?.name || staffBuilding[0]?.buildingName || null;
    }
    return staffBuilding?.name || staffBuilding?.buildingName || null;
  }, [staffBuilding]);

  const buildingId = useMemo(() => {
    if (!staffBuilding) return null;
    if (Array.isArray(staffBuilding) && staffBuilding.length > 0) {
      return staffBuilding[0]?.buildingId || staffBuilding[0]?.id || null;
    }
    return staffBuilding?.buildingId || staffBuilding?.id || null;
  }, [staffBuilding]);

  // ── Load initial data
  useEffect(() => {
    dispatch(getVehicleTypeListRequest());
    dispatch(getStaffBuildingRequest());
  }, [dispatch]);

  // ── Reset form on successful check-in
  useEffect(() => {
    if (checkInGuest) {
      resetForm();
      dispatch(checkInGuestReset());
    }
  }, [checkInGuest, dispatch]);

  // ── Handlers
  const resetForm = () => {
    setSelectedVehicleTypeId(null);
    setPlateImageUrl("");
    plateImageFileRef.current = null;
    dispatch(ocrPlateReset());
  };

  const handleImageUpload = useCallback(async (options) => {
    const { file, onSuccess, onError } = options;
    setIsUploading(true);
    try {
      // 1. Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPlateImageUrl(e.target.result);
        setIsUploading(false);
        onSuccess("Ok");
      };
      reader.readAsDataURL(file);

      // 2. Store file ref for later use in quick-checkin
      plateImageFileRef.current = file;

      // 3. Send to OCR API
      const formData = new FormData();
      formData.append("file", file);
      dispatch(ocrPlateRequest(formData));
    } catch (err) {
      setIsUploading(false);
      onError(err);
      message.error("Failed to upload image");
    }
  }, [dispatch]);

  const handleRemoveImage = useCallback(() => {
    setPlateImageUrl("");
    plateImageFileRef.current = null;
    dispatch(ocrPlateReset());
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    if (!plateImageFileRef.current) {
      message.error("Please upload a plate image");
      return;
    }
    if (!buildingId) {
      message.error("Building not found. Please contact your manager.");
      return;
    }
    if (!selectedVehicleTypeId) {
      message.error("Please select vehicle type");
      return;
    }

    dispatch(
      checkInGuestRequest({
        plateImage: plateImageFileRef.current,
        buildingId: String(buildingId),
        vehicleTypeId: String(selectedVehicleTypeId),
        mode: "GUEST",
      })
    );
  }, [buildingId, selectedVehicleTypeId, dispatch]);

  const isFormValid = plateImageFileRef.current && buildingId && selectedVehicleTypeId && recognizedPlate;

  // ── Render
  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Staff" page="guest-entry" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600">
            <UserRound size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Guest Quick Check-in
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              Upload plate image → OCR auto-reads plate → Check in guest instantly.
            </p>
          </div>
        </div>
      </div>

      {vtLoading || staffBuildingLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-sm border border-slate-100">
          <Spin size="large" />
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Image Upload + OCR Result */}
          <div className="lg:col-span-2 space-y-5">
            {/* Plate Image Upload Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                Upload Plate Image
                <span className="text-red-500">*</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload area */}
                <div>
                  <Upload
                    name="file"
                    listType="picture-card"
                    className="checkin-uploader"
                    showUploadList={false}
                    customRequest={handleImageUpload}
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) message.error("You can only upload image files!");
                      return isImage;
                    }}
                  >
                    {plateImageUrl ? (
                      <img
                        src={plateImageUrl}
                        alt="Plate"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        {isUploading ? (
                          <Spin size="small" />
                        ) : (
                          <UploadIcon size={24} />
                        )}
                        <div className="text-xs font-medium">Click to Upload Plate Image</div>
                      </div>
                    )}
                  </Upload>
                  {plateImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {/* OCR Result */}
                <div className="flex flex-col justify-center">
                  {ocrLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-blue-200 bg-blue-50">
                      <Spin size="default" />
                      <p className="mt-3 text-sm font-medium text-blue-600 animate-pulse">
                        <ScanLine size={16} className="inline mr-1" />
                        Reading plate number...
                      </p>
                    </div>
                  ) : recognizedPlate ? (
                    <div className="p-6 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-xs font-bold uppercase text-emerald-600 tracking-wide">
                          Recognized Plate Number
                        </span>
                      </div>
                      <div className="bg-white rounded-xl border-2 border-emerald-300 p-4 text-center">
                        <span className="text-2xl md:text-3xl font-black font-mono tracking-[0.15em] text-slate-800">
                          {recognizedPlate}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400 text-center">
                        This plate number was auto-detected via OCR
                      </p>
                    </div>
                  ) : plateImageUrl ? (
                    <div className="p-6 rounded-xl border border-dashed border-amber-200 bg-amber-50 text-center">
                      <AlertCircle size={24} className="mx-auto text-amber-400 mb-2" />
                      <p className="text-sm text-amber-600 font-medium">
                        Could not recognize plate number. You can still proceed with check-in.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                      <ScanLine size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400 font-medium">
                        Upload a plate image to auto-detect the plate number
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Check-in Info Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Hash size={16} />
                </div>
                Check-in Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Building — auto-filled from staff building API */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Building2 size={12} /> Building
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    {buildingName || (
                      <span className="text-slate-400 italic">No building assigned</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Auto-assigned based on your staff building
                  </p>
                </div>

                {/* Vehicle Type — dropdown */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Car size={12} /> Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedVehicleTypeId}
                    onChange={(val) => setSelectedVehicleTypeId(val)}
                    placeholder="Select vehicle type"
                    className="w-full !h-[46px]"
                    options={vehicleTypes?.map((vt) => ({
                      value: vt.vehicleTypeId,
                      label: vt.typeName,
                    }))}
                    allowClear
                  />
                </div>
              </div>

              {/* Mode indicator */}
              <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-100">
                <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-xs font-semibold text-orange-700">
                  Mode: GUEST — Auto-assign slot, no reservation needed
                </span>
              </div>
            </div>
          </div>

          {/* Right: Summary + Submit */}
          <div className="space-y-5">
            {/* Summary card */}
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <LogIn size={16} /> Check-in Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Plate Number:</span>
                  <span className="font-bold font-mono text-slate-800 text-sm">
                    {recognizedPlate || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Building:</span>
                  <span className="font-semibold text-slate-800">
                    {buildingName || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Vehicle Type:</span>
                  <span className="font-semibold text-slate-800">
                    {vehicleTypes?.find((v) => String(v.vehicleTypeId) === String(selectedVehicleTypeId))?.typeName || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Mode:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px]">
                    GUEST
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500">Plate Image:</span>
                  <span className={`font-semibold ${plateImageUrl ? "text-emerald-600" : "text-slate-400"}`}>
                    {plateImageUrl ? "✓ Uploaded" : "Not uploaded"}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation checklist */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wide">
                Readiness Check
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Plate image uploaded", ok: !!plateImageUrl },
                  { label: "Plate recognized (OCR)", ok: !!recognizedPlate },
                  { label: "Building assigned", ok: !!buildingId },
                  { label: "Vehicle type selected", ok: !!selectedVehicleTypeId },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center ${item.ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      {item.ok ? <CheckCircle2 size={10} /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                    </div>
                    <span className={item.ok ? "text-slate-700 font-medium" : "text-slate-400"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!plateImageUrl || !buildingId || !selectedVehicleTypeId || checkinLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: (plateImageUrl && buildingId && selectedVehicleTypeId)
                  ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                  : "#94a3b8",
                boxShadow: (plateImageUrl && buildingId && selectedVehicleTypeId)
                  ? "0 8px 24px rgba(249,115,22,0.35)"
                  : "none",
              }}
            >
              {checkinLoading && <Spin size="small" />}
              <LogIn size={22} />
              Quick Check-in Guest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleEntryGuest;
