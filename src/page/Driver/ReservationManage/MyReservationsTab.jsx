import { useMemo, useState } from "react";
import { Tabs, Modal, Input } from "antd";
import {
    Clock,
    CheckCircle2,
    XCircle,
    ShieldCheck,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { cancelReservations } from "../../../redux/driver/reservationManagement/cancelReservations/cancelReservationsSlice";

import { renderReservationCards } from "./ReservationCard";

const MyReservationsTab = ({
    myReservationList,
    reservationsLoading,
    reservationSubTab,
    setReservationSubTab,
    onOpenVehicleModal,
}) => {
    const dispatch = useDispatch();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedCancelReservationId, setSelectedCancelReservationId] = useState(null);
    const [cancelReasonInput, setCancelReasonInput] = useState("");

    const handleCancelReservation = (reservationId) => {
        setSelectedCancelReservationId(reservationId);
        setCancelReasonInput(""); // reset input
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = () => {
        dispatch(cancelReservations({ 
            reservationCode: selectedCancelReservationId, 
            reason: cancelReasonInput.trim() || "Cancelled by driver"
        }));
        setCancelModalOpen(false);
    };

    const pendingReservations = useMemo(
        () => myReservationList.filter((r) => r.reservationStatus === "PENDING"),
        [myReservationList]
    );

    const checkedInReservations = useMemo(
        () => myReservationList.filter((r) =>
            r.reservationStatus === "CHECKED_IN" ||
            r.reservationStatus === "ACTIVE" ||
            r.reservationStatus === "CONFIRMED"
        ),
        [myReservationList]
    );

    const cancelledReservations = useMemo(
        () => myReservationList.filter((r) => r.reservationStatus === "CANCELLED"),
        [myReservationList]
    );

    const expiredReservations = useMemo(
        () => myReservationList.filter((r) => r.reservationStatus === "EXPIRED"),
        [myReservationList]
    );

    const completedReservations = useMemo(
        () => myReservationList.filter((r) => r.reservationStatus === "COMPLETED"),
        [myReservationList]
    );

    return (
        <>
        <Tabs
            activeKey={reservationSubTab}
            onChange={setReservationSubTab}
            size="small"
            items={[
                {
                    key: "PENDING",
                    label: (
                        <span className="flex items-center gap-1.5 font-medium text-sm">
                            <Clock size={14} />
                            Pending
                            {pendingReservations.length > 0 && (
                                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                                    {pendingReservations.length}
                                </span>
                            )}
                        </span>
                    ),
                    children: (
                        <div className="space-y-4">
                            {renderReservationCards(pendingReservations, reservationsLoading, onOpenVehicleModal, handleCancelReservation)}
                        </div>
                    ),
                },
                {
                    key: "CHECKED_IN",
                    label: (
                        <span className="flex items-center gap-1.5 font-medium text-sm">
                            <ShieldCheck size={14} />
                            Checked In
                            {checkedInReservations.length > 0 && (
                                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                                    {checkedInReservations.length}
                                </span>
                            )}
                        </span>
                    ),
                    children: (
                        <div className="space-y-4">
                            {renderReservationCards(checkedInReservations, reservationsLoading, onOpenVehicleModal)}
                        </div>
                    ),
                },
                {
                    key: "COMPLETED",
                    label: (
                        <span className="flex items-center gap-1.5 font-medium text-sm">
                            <CheckCircle2 size={14} />
                            Completed
                            {completedReservations.length > 0 && (
                                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-500 px-1.5 text-[10px] font-bold text-white">
                                    {completedReservations.length}
                                </span>
                            )}
                        </span>
                    ),
                    children: (
                        <div className="space-y-4">
                            {renderReservationCards(completedReservations, reservationsLoading, onOpenVehicleModal)}
                        </div>
                    ),
                },
                {
                    key: "EXPIRED",
                    label: (
                        <span className="flex items-center gap-1.5 font-medium text-sm">
                            <XCircle size={14} />
                            Expired
                            {expiredReservations.length > 0 && (
                                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-500 px-1.5 text-[10px] font-bold text-white">
                                    {expiredReservations.length}
                                </span>
                            )}
                        </span>
                    ),
                    children: (
                        <div className="space-y-4">
                            {renderReservationCards(expiredReservations, reservationsLoading, onOpenVehicleModal)}
                        </div>
                    ),
                },
                {
                    key: "CANCELLED",
                    label: (
                        <span className="flex items-center gap-1.5 font-medium text-sm">
                            <XCircle size={14} />
                            Cancelled
                            {cancelledReservations.length > 0 && (
                                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                    {cancelledReservations.length}
                                </span>
                            )}
                        </span>
                    ),
                    children: (
                        <div className="space-y-4">
                            {renderReservationCards(cancelledReservations, reservationsLoading, onOpenVehicleModal)}
                        </div>
                    ),
                },
            ]}
        />
        
        <Modal
            title="Cancel Reservation"
            open={cancelModalOpen}
            onOk={handleConfirmCancel}
            onCancel={() => setCancelModalOpen(false)}
            okText="Confirm Cancel"
            okButtonProps={{ danger: true }}
            cancelText="Close"
            centered
        >
            <p className="mb-3 text-slate-600">Are you sure you want to cancel this reservation? You can provide a reason below.</p>
            <Input.TextArea 
                placeholder="Reason for cancellation (optional)..." 
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                rows={3}
                className="rounded-lg"
            />
        </Modal>
        </>
    );
};

export default MyReservationsTab;
