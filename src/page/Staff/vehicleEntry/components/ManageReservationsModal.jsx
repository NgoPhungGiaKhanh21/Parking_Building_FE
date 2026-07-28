import { Tabs, Modal, Badge, Spin, Empty } from "antd";
import { ClipboardList, ShieldCheck, XCircle } from "lucide-react";
import StaffReservationCard from "../../shared/StaffReservationCard";

const ManageReservationsModal = ({
  open,
  onClose,
  reservationSubTab,
  onSubTabChange,
  checkedInList,
  cancelledList,
  loading,
}) => {
  const renderList = (list) => {
    if (loading) {
      return (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16">
          <Empty description="No reservations found" />
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {list.map((r) => (
          <StaffReservationCard key={r.reservationId} r={r} />
        ))}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={900}
      footer={null}
      destroyOnHidden
      title={
        <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <ClipboardList size={20} />
          Manage Reservations
        </div>
      }
    >
      <div className="mt-4">
        <Tabs
          activeKey={reservationSubTab}
          onChange={onSubTabChange}
          size="middle"
          className="reservation-sub-tabs"
          items={[
            {
              key: "CHECKED_IN",
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={16} /> Checked In
                  {checkedInList.length > 0 && (
                    <Badge count={checkedInList.length} style={{ backgroundColor: "#3b82f6" }} />
                  )}
                </span>
              ),
              children: renderList(checkedInList),
            },
            {
              key: "CANCELLED",
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <XCircle size={16} /> Cancelled
                </span>
              ),
              children: renderList(cancelledList),
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default ManageReservationsModal;
