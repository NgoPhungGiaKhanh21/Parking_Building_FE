import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Empty, Spin, Table, Tag } from "antd";
import { CreditCard, RefreshCw } from "lucide-react";
import dayjs from "dayjs";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const PAYMENT_STATUS_COLORS = {
  CONFIRMED: "green",
  PAID: "green",
  UNPAID: "gold",
  PENDING: "orange",
  FAILED: "red",
};

const renderPaymentStatusTag = (record) => {
  const status = normalizeStatus(record.paymentStatus);
  if (!record.paymentStatus) return "—";
  return (
    <Tag color={PAYMENT_STATUS_COLORS[status] || "default"}>
      {record.paymentStatus}
    </Tag>
  );
};

const resolveDriverName = (record) =>
  record.driverName ?? record.fullName ?? record.driver?.fullName ?? "—";

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const { payments, loading, error } = useSelector(
    (state) => state.getAllPayments,
  );

  useEffect(() => {
    dispatch(getAllPaymentsRequest());
  }, [dispatch]);

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
      title: "Driver Name",
      dataIndex: "driverName",
      key: "driverName",
      render: (_, record) => (
        <span className="font-semibold text-slate-700">
          {resolveDriverName(record)}
        </span>
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
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (_, record) => renderPaymentStatusTag(record),
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
            scroll={{ x: 900 }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
