import { Spin, Tag, Upload, message, Select } from "antd";
import { Car, Building2, User, Palette, Upload as UploadIcon, UserRound } from "lucide-react";
import StaffReservationCard from "../../shared/StaffReservationCard";
import { getCheckModeTheme } from "../../shared/checkModeTheme";

const DriverWalkInInfo = ({ walkInVehicle, buildingName, vehicleTypes, walkInVehicleTypeId, theme }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-5">
    <div className={`rounded-lg border p-3 col-span-2 ${theme.panelBg}`}>
      <p className={`text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1 ${theme.panelLabel}`}>
        <User size={10} /> Driver
      </p>
      <p className={`text-sm font-bold ${theme.panelValue}`}>
        {walkInVehicle.driverFullName || walkInVehicle.ownerName || walkInVehicle.username || "—"}
      </p>
    </div>
    <div className={`rounded-lg border p-3 ${theme.panelBg}`}>
      <p className={`text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1 ${theme.panelLabel}`}>
        <Car size={10} /> Vehicle
      </p>
      <p className={`text-xs font-bold ${theme.panelValue}`}>
        {walkInVehicle.brand || walkInVehicle.vehicleBrand}{" "}
        {walkInVehicle.model || walkInVehicle.vehicleModel}
      </p>
    </div>
    <div className={`rounded-lg border p-3 ${theme.panelBg}`}>
      <p className={`text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1 ${theme.panelLabel}`}>
        <Palette size={10} /> Color
      </p>
      <p className={`text-xs font-bold capitalize ${theme.panelValue}`}>
        {walkInVehicle.color || walkInVehicle.vehicleColor || "—"}
      </p>
    </div>
    <div className="rounded-lg bg-slate-50 p-3 col-span-2 md:col-span-1">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
        <Building2 size={10} /> Building
      </p>
      <p className="text-xs font-semibold text-slate-700">{buildingName || "—"}</p>
    </div>
    <div className="rounded-lg bg-slate-50 p-3 col-span-2 md:col-span-1">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
        <Car size={10} /> Vehicle Type
      </p>
      <p className="text-xs font-semibold text-slate-700">
        {vehicleTypes?.find((v) => String(v.vehicleTypeId) === String(walkInVehicleTypeId))?.typeName ||
          walkInVehicle.vehicleTypeName ||
          walkInVehicle.typeName ||
          "—"}
      </p>
    </div>
  </div>
);

const GuestWalkInForm = ({
  buildingName,
  vehicleTypes,
  selectedVehicleTypeId,
  onVehicleTypeChange,
  theme,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
    <div>
      <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
        <Building2 size={12} /> Building
      </label>
      <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
        {buildingName || <span className="text-slate-400 italic">No building assigned</span>}
      </div>
    </div>
    <div>
      <label className={`text-xs font-bold uppercase mb-1.5 flex items-center gap-1 ${theme.accentText}`}>
        <Car size={12} /> Vehicle Type <span className="text-red-500">*</span>
      </label>
      <Select
        value={selectedVehicleTypeId}
        onChange={onVehicleTypeChange}
        placeholder="Select vehicle type"
        className="w-full h-11.5!"
        options={vehicleTypes?.map((vt) => ({
          value: vt.vehicleTypeId,
          label: vt.typeName,
        }))}
        allowClear
      />
    </div>
  </div>
);

const EntryCheckinFormCard = ({
  checkMode,
  driverReservation,
  isDriverWalkIn,
  walkInVehicle,
  buildingName,
  vehicleTypes,
  walkInVehicleTypeId,
  selectedVehicleTypeId,
  onVehicleTypeChange,
  lookupLoading,
  checkinImageUrl,
  isUploadingCheckin,
  onCheckinUpload,
  onRemoveCheckinImage,
}) => {
  const theme = getCheckModeTheme(checkMode);
  const isDriverMode = checkMode !== "GUEST";

  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme.cardBorder}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${theme.iconBg}`}>
            {isDriverMode ? <Car size={16} /> : <UserRound size={16} />}
          </div>
          {theme.entryTitle}
        </h2>
        <div className="flex items-center gap-2">
          {lookupLoading && <Spin size="small" />}
          <Tag color={theme.tagColor} className="font-bold!">
            {theme.entryBadge}
          </Tag>
        </div>
      </div>

      {driverReservation ? (
        <div className="space-y-5">
          <StaffReservationCard r={driverReservation} />
        </div>
      ) : isDriverWalkIn && walkInVehicle ? (
        <DriverWalkInInfo
          walkInVehicle={walkInVehicle}
          buildingName={buildingName}
          vehicleTypes={vehicleTypes}
          walkInVehicleTypeId={walkInVehicleTypeId}
          theme={theme}
        />
      ) : (
        <GuestWalkInForm
          buildingName={buildingName}
          vehicleTypes={vehicleTypes}
          selectedVehicleTypeId={selectedVehicleTypeId}
          onVehicleTypeChange={onVehicleTypeChange}
          theme={theme}
        />
      )}

      <div className={`rounded-xl border border-slate-200 bg-slate-50 p-5 ${driverReservation ? "mt-5" : ""}`}>
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
          <UploadIcon size={16} /> Upload Vehicle Check-in Image <span className="text-red-500">*</span>
        </p>
        <Upload
          name="file"
          listType="picture-card"
          className="checkin-uploader"
          showUploadList={false}
          customRequest={onCheckinUpload}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) message.error("Only image files allowed!");
            return isImage;
          }}
        >
          {checkinImageUrl ? (
            <img src={checkinImageUrl} alt="Check-in" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
              {isUploadingCheckin ? <Spin size="small" /> : <UploadIcon size={24} />}
              <div className="text-xs font-medium">Click to Upload</div>
            </div>
          )}
        </Upload>
        {checkinImageUrl && (
          <button
            type="button"
            onClick={onRemoveCheckinImage}
            className="mt-3 w-32 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Remove Image
          </button>
        )}
      </div>
    </div>
  );
};

export default EntryCheckinFormCard;
