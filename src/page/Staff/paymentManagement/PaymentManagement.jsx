import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Empty, Input, Select, Spin, Table, Tag } from "antd";
import { CreditCard, RefreshCw, Search } from "lucide-react";
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
  const statusValue = record.paymentStatus ?? record.paidStatus;
  const status = normalizeStatus(statusValue);
  if (!statusValue) return "—";
  return (
    <Tag color={PAYMENT_STATUS_COLORS[status] || "default"}>{statusValue}</Tag>
  );
};

const resolveDriverName = (record) =>
  record.driverName ?? record.fullName ?? record.driver?.fullName ?? "Guest";

const resolvePaymentStatus = (record) =>
  normalizeStatus(record.paymentStatus ?? record.paidStatus);

const isPaidStatus = (status) => status === "PAID" || status === "CONFIRMED";

const getPaymentTime = (record) =>
  dayjs(
    record.paymentTime || record.createdAt || record.updatedAt || 0,
  ).valueOf();

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const [driverNameFilter, setDriverNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { payments, loading, error } = useSelector(
    (state) => state.getAllPayments,
  );

  useEffect(() => {
    dispatch(getAllPaymentsRequest());
  }, [dispatch]);

  const filteredPayments = useMemo(() => {
    const keyword = driverNameFilter.trim().toLowerCase();
    const list = Array.isArray(payments) ? payments : [];

    return list.filter((payment) => {
      const matchesName =
        !keyword ||
        resolveDriverName(payment).toLowerCase().includes(keyword);
      const status = resolvePaymentStatus(payment);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PAID" && isPaidStatus(status)) ||
        (statusFilter !== "PAID" && status === statusFilter);

      return matchesName && matchesStatus;
    });
  }, [driverNameFilter, payments, statusFilter]);

  const columns = [
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
      title: "Time",
      dataIndex: "paymentTime",
      key: "paymentTime",
      sorter: (a, b) => getPaymentTime(a) - getPaymentTime(b),
      defaultSortOrder: "descend",
      sortDirections: ["descend", "ascend"],
      render: (time, record) => {
        const resolvedTime = time || record.createdAt || record.updatedAt;
        return resolvedTime
          ? dayjs(resolvedTime).format("DD/MM/YYYY HH:mm")
          : "—";
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
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            allowClear
            value={driverNameFilter}
            onChange={(event) => setDriverNameFilter(event.target.value)}
            placeholder="Filter by driver name"
            prefix={<Search size={16} className="text-slate-400" />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "All payment statuses" },
              { value: "PAID", label: "Paid" },
              { value: "UNPAID", label: "Unpaid" },
              { value: "PENDING", label: "Pending" },
              { value: "FAILED", label: "Failed" },
            ]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : error ? (
          <Empty description={error} />
        ) : !Array.isArray(payments) || payments.length === 0 ? (
          <Empty description="No payments found" />
        ) : filteredPayments.length === 0 ? (
          <Empty description="No payments match the selected filters" />
        ) : (
          <Table
            rowKey="paymentId"
            columns={columns}
            dataSource={filteredPayments}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 650 }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
