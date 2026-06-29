import { Modal, Tag } from 'antd';
import { Clock, Car, MapPin, Ticket, Building2 } from 'lucide-react';
import dayjs from 'dayjs';

const statusConfig = {
    PAID: { color: "green", label: "Paid" },
    CONFIRMED: { color: "blue", label: "Confirmed" },
    PARTIAL: { color: "orange", label: "Partial" },
};

// const confirmationStatusConfig = {
//     CONFIRMED: { color: "green", label: "Confirmed" },
//     PENDING: { color: "orange", label: "Pending" },
//     FAILED: { color: "red", label: "Failed" },
// };

// const findLatestPaymentForSession = (payments, sessionId) => {
//     if (!sessionId || !payments?.length) return null;
//     return (
//         [...payments]
//             .filter((p) => p.sessionId === sessionId)
//             .sort((a, b) => dayjs(b.paymentTime).valueOf() - dayjs(a.paymentTime).valueOf())[0] ?? null
//     );
// };

// eslint-disable-next-line no-unused-vars -- giữ payments để bật lại badge confirm
const PaidSessionsModal = ({ open, onCancel, sessions, payments }) => {
    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <Clock size={20} className="text-blue-500" />
                    <span className="font-bold text-slate-800 text-lg">Paid & Confirmed Sessions</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnHidden
            width={700}
            centered
        >
            <div className="max-h-[65vh] overflow-y-auto pr-2 mt-4 space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 font-medium">No paid sessions available.</div>
                ) : (
                    sessions.map((session) => {
                        const cfg = statusConfig[session.paymentStatus] || { color: "default", label: session.paymentStatus };
                        // const latestPayment = findLatestPaymentForSession(payments, session.sessionId);
                        // const confirmStatus = latestPayment?.paymentStatus;
                        // const confirmCfg = confirmStatus
                        //     ? confirmationStatusConfig[confirmStatus] || { color: "default", label: confirmStatus }
                        //     : null;

                        return (
                            <div key={session.sessionId} className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                            <Ticket size={14} className="text-slate-400" /> TICKET
                                        </div>
                                        <span className="font-mono font-black text-emerald-700 text-lg">{session.ticketCode || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag color={cfg.color} className="!m-0 font-bold px-3 py-1 text-sm rounded-full">{cfg.label}</Tag>
                                        {/* {confirmCfg && session.paymentStatus !== "CONFIRMED" && (
                                            <Tag color={confirmCfg.color} className="!m-0 font-bold px-3 py-1 text-sm rounded-full">{confirmCfg.label}</Tag>
                                        )} */}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><Car size={18} /></div>
                                        <div>
                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Vehicle</div>
                                            <div className="text-sm font-semibold text-slate-700">{session.vehiclePlate}</div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-xs text-slate-500 font-medium">{session.vehicleBrand} {session.vehicleModel}</span>
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full border border-slate-200"
                                                    style={{ backgroundColor: session.vehicleColor?.toLowerCase() || "#ccc" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><MapPin size={18} /></div>
                                            <div>
                                                <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Slot</div>
                                                <div className="text-sm font-semibold text-slate-700">{session.slotName}</div>
                                                <div className="text-xs text-slate-500 font-medium">Zone {session.zoneName} · {session.floorName}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Building2 size={18} /></div>
                                            <div>
                                                <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Building</div>
                                                <div className="text-sm font-semibold text-slate-700">{session.buildingName}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-100 mt-2">
                                    <div>
                                        <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-0.5">
                                            <Clock size={12}/> Check-in Time
                                        </span>
                                        <span className="text-sm font-semibold text-slate-700">
                                            {dayjs(session.checkinTime).format("DD/MM/YYYY HH:mm")}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5 block">Total Fee</span>
                                        <div className="text-lg font-black text-emerald-600">{(session.estimatedFee || 0).toLocaleString("vi-VN")}đ</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </Modal>
    );
};

export default PaidSessionsModal;
