import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Empty, Modal, Spin, Table, Tag } from "antd";
import { CheckCircle2, CreditCard, RefreshCw } from "lucide-react";
import dayjs from "dayjs";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getProfileUserRequest } from "../../../redux/profileUser/getProfileUserSlice";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import { confirmPaymentByStaffRequest } from "../../../redux/staff/payment/confirmPaymentByStaff/confirmPaymentByStaffSlice";

const normalizeStatus = (value) => String(value || "").trim().toUpperCase();

const getPaidStatus = (record) => normalizeStatus(record.paidStatus);
const getPaymentStatus = (record) => normalizeStatus(record.paymentStatus);

/** Chỉ confirm khi driver đã PAID (paidStatus), chưa staff confirm (paymentStatus ≠ CONFIRMED) */
const canStaffConfirm = (record) => {
    if (getPaidStatus(record) !== "PAID") return false;
    if (getPaymentStatus(record) === "CONFIRMED") return false;
    return true;
};

const renderPaidStatusTag = (record) => {
    const paid = getPaidStatus(record);
    const colors = {
        PAID: "cyan",
        UNPAID: "gold",
        CONFIRMED: "green",
        PENDING: "orange",
    };
    if (!record.paidStatus) return "—";
    return (
        <Tag color={colors[paid] || "default"}>{record.paidStatus}</Tag>
    );
};

const buildConfirmPayload = (payment, staffProfile) => ({
    paymentId: payment.paymentId,
    sessionId: payment.sessionId ?? "",
    driverId: payment.driverId ?? "",
    staffId: staffProfile?.id ?? staffProfile?.userId ?? "",
    amount: payment.amount ?? 0,
    paymentMethod: payment.paymentMethod ?? "",
    transactionCode: payment.transactionCode ?? "",
    isConfirmed: true,
    confirmationStatus: "CONFIRMED",
    reason: "",
    message: "",
    confirmedAt: dayjs().toISOString(),
    note: payment.note ?? "",
});

const PaymentManagement = () => {
    const dispatch = useDispatch();
    const { getProfileUser } = useSelector((state) => state.getProfileUser);
    const { payments, loading, error } = useSelector((state) => state.getAllPayments);
    const { loading: confirmLoading } = useSelector(
        (state) => state.confirmPaymentByStaff
    );

    useEffect(() => {
        dispatch(getProfileUserRequest());
        dispatch(getAllPaymentsRequest());
    }, [dispatch]);

    const handleConfirm = (payment) => {
        Modal.confirm({
            title: "Confirm payment?",
            content: `Xác nhận payment ${payment.paymentId}?`,
            okText: "Confirm",
            cancelText: "Cancel",
            onOk: () =>
                dispatch(
                    confirmPaymentByStaffRequest(
                        buildConfirmPayload(payment, getProfileUser)
                    )
                ),
        });
    };

    const columns = [
        {
            title: "Payment ID",
            dataIndex: "paymentId",
            key: "paymentId",
            render: (id) => (
                <code className="text-xs font-mono text-slate-600">{id}</code>
            ),
        },
        {
            title: "Session ID",
            dataIndex: "sessionId",
            key: "sessionId",
            render: (id) => (
                <code className="text-xs font-mono text-slate-500">{id || "—"}</code>
            ),
        },
        {
            title: "Driver ID",
            dataIndex: "driverId",
            key: "driverId",
            render: (id) => (
                <code className="text-xs font-mono text-slate-500">{id || "—"}</code>
            ),
        },
        {
            title: "Method",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            render: (method) => <Tag>{method}</Tag>,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => (
                <span className="font-bold text-emerald-600">
                    {(amount ?? 0).toLocaleString("vi-VN")}đ
                </span>
            ),
        },
        {
            title: "Paid Status",
            dataIndex: "paidStatus",
            key: "paidStatus",
            render: (_, record) => renderPaidStatusTag(record),
        },
        {
            title: "Transaction",
            dataIndex: "transactionCode",
            key: "transactionCode",
            render: (code) => code || "—",
        },
        {
            title: "Time",
            dataIndex: "paymentTime",
            key: "paymentTime",
            render: (time) =>
                time ? dayjs(time).format("DD/MM/YYYY HH:mm") : "—",
        },
        {
            title: "Action",
            key: "action",
            width: 110,
            render: (_, record) => {
                if (canStaffConfirm(record)) {
                    return (
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircle2 size={14} />}
                            loading={confirmLoading}
                            onClick={() => handleConfirm(record)}
                        >
                            Confirm
                        </Button>
                    );
                }
                if (getPaymentStatus(record) === "CONFIRMED") {
                    return <Tag color="green">Confirmed</Tag>;
                }
                return <Tag color="gold">Unpaid</Tag>;
            },
        },
    ];

    return (
        <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <CommonBreadcrumb role="Staff" page="payment" />
                </div>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600">
                            <CreditCard size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                                Payment Management
                            </h1>
                            <p className="mt-1 font-medium text-slate-500">
                                paidStatus = PAID → Confirm · paymentStatus = CONFIRMED → Done
                            </p>
                        </div>
                    </div>
                    <Button
                        icon={<RefreshCw size={16} />}
                        onClick={() => dispatch(getAllPaymentsRequest())}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Empty description={error} />
                ) : payments.length === 0 ? (
                    <Empty description="No payments found" />
                ) : (
                    <Table
                        rowKey="paymentId"
                        columns={columns}
                        dataSource={payments}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                    />
                )}
            </div>
        </div>
    );
};

export default PaymentManagement;
