import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Empty, Spin, Table, Tag } from "antd";
import { Receipt } from "lucide-react";
import dayjs from "dayjs";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getProfileUserRequest } from "../../../redux/profileUser/getProfileUserSlice";
import { getDriverPaymentsRequest } from "../../../redux/driver/payment/getDriverPayments/getDriverPaymentsSlice";

const PAYMENT_STATUS_COLORS = {
  PAID: "green",
  UNPAID: "gold",
  PENDING: "orange",
  FAILED: "red",
};

const PaymentHistory = () => {
  const dispatch = useDispatch();
  const { getProfileUser, loading: profileLoading } = useSelector(
    (state) => state.getProfileUser
  );
  const { payments, loading, error } = useSelector(
    (state) => state.getDriverPayments
  );

  const driverId = getProfileUser?.id ?? getProfileUser?.userId ?? "";

  useEffect(() => {
    dispatch(getProfileUserRequest());
  }, [dispatch]);

  useEffect(() => {
    if (driverId) {
      dispatch(getDriverPaymentsRequest({ driverId, limit: 20 }));
    }
  }, [dispatch, driverId]);

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
      title: "Reservation",
      dataIndex: "reservationCode",
      key: "reservationCode",
      render: (code) => code || "—",
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
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => (
        <Tag color={PAYMENT_STATUS_COLORS[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Paid Status",
      dataIndex: "paidStatus",
      key: "paidStatus",
      render: (status) =>
        status ? (
          <Tag color={PAYMENT_STATUS_COLORS[status] || "default"}>{status}</Tag>
        ) : (
          "—"
        ),
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
      render: (time) => (time ? dayjs(time).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "—",
    },
  ];

  const isLoading = profileLoading || loading;

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Driver" page="payment-history" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600">
            <Receipt size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Payment History
            </h1>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : !driverId ? (
          <Empty description="Driver ID not found" />
        ) : error ? (
          <Empty description={error} />
        ) : payments.length === 0 ? (
          <Empty description="No payment history" />
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

export default PaymentHistory;
