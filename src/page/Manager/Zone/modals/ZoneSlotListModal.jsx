import { Modal, Spin } from "antd";
import { splitIntoTwoColumns } from "../../Building/utils/buildingUtils";

const ZoneSlotListModal = ({ open, onCancel, zoneName, loading, slotNames }) => {
  const [leftColumn, rightColumn] = splitIntoTwoColumns(slotNames);

  return (
    <Modal
      title={
        <span>
          Slots - <span className="font-semibold">{zoneName}</span>
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
    >
      {loading ? (
        <div className="flex min-h-[120px] items-center justify-center">
          <Spin />
        </div>
      ) : slotNames.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No slots in this zone.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {[leftColumn, rightColumn].map((column, columnIndex) => (
            <ul key={columnIndex} className="space-y-2">
              {column.map((name, index) => (
                <li
                  key={`${name}-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800"
                >
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ZoneSlotListModal;
