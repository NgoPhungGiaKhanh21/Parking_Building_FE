import { useMemo, useState, useEffect } from "react";
import { Tabs, Modal, Input } from "antd";
import {
    Clock,
    CheckCircle2,
    XCircle,
    ShieldCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    cancelReservations,
    cancelReservationsReset,
} from "../../../redux/driver/reservationManagement/cancelReservations/cancelReservationsSlice";

import { renderReservationCards } from "./ReservationCard";

const MyReservationsTab = ({
    myReservationList,
    reservationsLoading,
    reservationSubTab,
    setReservationSubTab,
    onOpenVehicleModal,
}) => {
    const dispatch = useDispatch();
    const { loading: cancelLoading, error: cancelError, cancelReservation } =
        useSelector((state) => state.cancelReservations);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedCancelReservationId, setSelectedCancelReservationId] = useState(null);
    const [cancelReasonInput, setCancelReasonInput] = useState("");

    const handleCancelReservation = (reservationId) => {
        dispatch(cancelReservationsReset());
        setSelectedCancelReservationId(reservationId);
        setCancelReasonInput("");
        setCancelModalOpen(true);
    };

    const handleCloseCancelModal = () => {
        if (cancelLoading) return;
        setCancelModalOpen(false);
        setSelectedCancelReservationId(null);
        setCancelReasonInput("");
        dispatch(cancelReservationsReset());
    };

    const handleConfirmCancel = () => {
        if (cancelLoading || !selectedCancelReservationId) return;
        dispatch(
            cancelReservations({
                reservationCode: selectedCancelReservationId,
                reason: cancelReasonInput.trim() || "Cancelled by driver",
            }),
        );
    };

    useEffect(() => {
        if (!cancelModalOpen || cancelLoading || cancelError) return;
        if (!cancelReservation) return;

        setCancelModalOpen(false);
        setSelectedCancelReservationId(null);
        setCancelReasonInput("");
        dispatch(cancelReservationsReset());
    }, [cancelModalOpen, cancelLoading, cancelError, cancelReservation, dispatch]);

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
            onCancel={handleCloseCancelModal}
            okText="Confirm Cancel"
            okButtonProps={{ danger: true, loading: cancelLoading }}
            cancelText="Close"
            confirmLoading={cancelLoading}
            closable={!cancelLoading}
            maskClosable={!cancelLoading}
            centered
        >
            <p className="mb-3 text-slate-600">Are you sure you want to cancel this reservation? You can provide a reason below.</p>
            {cancelError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {typeof cancelError === "string" ? cancelError : cancelError?.message}
                </div>
            )}
            <Input.TextArea
                placeholder="Reason for cancellation (optional)..."
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                rows={3}
                disabled={cancelLoading}
                className="rounded-lg"
            />
        </Modal>
        </>
    );
};

export default MyReservationsTab;
