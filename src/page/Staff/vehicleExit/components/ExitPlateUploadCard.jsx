import { Spin, Upload, message, Input } from "antd";
import { ImageIcon, Upload as UploadIcon, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";
import { resolveImageUrl } from "../../../../utils/reservationSessionUtils";

const ExitPlateUploadCard = ({
  isPaid,
  showCheckout,
  plateImageUrl,
  isUploading,
  ocrLoading,
  plateInput,
  onPlateChange,
  onImageUpload,
  onRemoveImage,
  normalizedSession,
  sessionLoading,
  reservationsLoading,
}) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
        <ImageIcon size={16} />
      </div>
      {isPaid && showCheckout && !plateImageUrl ? "Upload Check-out Image" : "Upload Plate Image"}
      <span className="text-red-500">*</span>
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div>
        <Upload
          name="file"
          listType="picture-card"
          className="checkin-uploader"
          showUploadList={false}
          customRequest={onImageUpload}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) message.error("You can only upload image files!");
            return isImage;
          }}
        >
          {plateImageUrl ? (
            <img src={plateImageUrl} alt="Plate" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
              {isUploading ? <Spin size="small" /> : <UploadIcon size={24} />}
              <div className="text-xs font-medium">Click to Upload</div>
            </div>
          )}
        </Upload>
        {plateImageUrl && (
          <button
            type="button"
            onClick={onRemoveImage}
            className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Remove Image
          </button>
        )}
      </div>

      <div className="flex flex-col justify-center">
        {isPaid && showCheckout ? (
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50 text-center">
            <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm text-emerald-700 font-medium">Session & Payment Confirmed</p>
            <p className="text-xs text-emerald-600 mt-1">
              {plateImageUrl ? "Check-out image ready." : "Please upload the check-out image."}
            </p>
          </div>
        ) : ocrLoading ? (
          <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-blue-200 bg-blue-50">
            <Spin size="default" />
            <p className="mt-3 text-sm font-medium text-blue-600 animate-pulse">
              <ScanLine size={16} className="inline mr-1" />
              Reading plate number...
            </p>
          </div>
        ) : plateInput ? (
          <div className="p-5 rounded-xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-white">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wide">
                Recognized Plate
              </span>
            </div>
            <div className="bg-white rounded-xl border-2 border-emerald-300 overflow-hidden text-center flex justify-center focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
              <Input
                value={plateInput}
                onChange={(e) => onPlateChange(e.target.value.toUpperCase())}
                variant="borderless"
                className="text-2xl font-black font-mono tracking-[0.15em] text-slate-800 py-3 text-center w-full"
                placeholder="ENTER PLATE"
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-400 text-center font-medium">
              Auto-searches after you stop typing
            </p>
          </div>
        ) : plateImageUrl && !ocrLoading ? (
          <div className="p-5 rounded-xl border border-dashed border-amber-200 bg-amber-50 text-center">
            <AlertCircle size={20} className="mx-auto text-amber-400 mb-2" />
            <p className="text-sm text-amber-600 font-medium">Could not recognize plate.</p>
          </div>
        ) : (
          <div className="p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
            <ScanLine size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-medium">Upload plate image to start</p>
          </div>
        )}
      </div>

      {normalizedSession && !sessionLoading && !reservationsLoading && (
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
            <ImageIcon size={14} className="text-blue-500" /> Check-in Image
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 h-full flex flex-col items-center justify-center min-h-40">
            {resolveImageUrl(normalizedSession.checkinImageUrl) ? (
              <img
                src={resolveImageUrl(normalizedSession.checkinImageUrl)}
                alt="Check-in"
                className="w-full h-full max-h-40 rounded-lg border border-slate-200 bg-white object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white text-slate-400 p-2 text-center">
                <ImageIcon size={28} className="mb-2 opacity-40" />
                <p className="text-xs font-medium leading-tight">
                  No image
                  <br />
                  available
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ExitPlateUploadCard;
