import { Spin, Upload, message } from "antd";
import { ImageIcon, Upload as UploadIcon } from "lucide-react";
import PlateOcrPanel from "../../shared/PlateOcrPanel";

const EntryPlateUploadCard = ({
  plateImageUrl,
  isUploadingPlate,
  ocrLoading,
  plateInput,
  onPlateChange,
  onPlateUpload,
  onRemovePlateImage,
}) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
        <ImageIcon size={16} />
      </div>
      Upload Plate Image <span className="text-red-500">*</span>
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Upload
          name="file"
          listType="picture-card"
          className="checkin-uploader"
          showUploadList={false}
          customRequest={onPlateUpload}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) message.error("Only image files allowed!");
            return isImage;
          }}
        >
          {plateImageUrl ? (
            <img src={plateImageUrl} alt="Plate" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
              {isUploadingPlate ? <Spin size="small" /> : <UploadIcon size={24} />}
              <div className="text-xs font-medium">Click to Upload Plate</div>
            </div>
          )}
        </Upload>
        {plateImageUrl && (
          <button
            type="button"
            onClick={onRemovePlateImage}
            className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Remove Image
          </button>
        )}
      </div>

      <PlateOcrPanel
        ocrLoading={ocrLoading}
        plateInput={plateInput}
        plateImageUrl={plateImageUrl}
        onPlateChange={onPlateChange}
      />
    </div>
  </div>
);

export default EntryPlateUploadCard;
