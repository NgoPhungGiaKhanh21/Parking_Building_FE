import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Empty, Input, Select, Spin, Table, Tag } from "antd";
import { Receipt, Search } from "lucide-react";
import dayjs from "dayjs";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getProfileUserRequest } from "../../../redux/profileUser/getProfileUserSlice";
import { getDriverPaymentsRequest } from "../../../redux/driver/payment/getDriverPayments/getDriverPaymentsSlice";

const PAYMENT_STATUS_COLORS = {
  CONFIRMED: "green",
  PAID: "green",
  UNPAID: "gold",
  PENDING: "orange",
  FAILED: "red",
};

const PaymentHistory = () => {
  const dispatch = useDispatch();
  const [reservationFilter, setReservationFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
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

  const paymentList = useMemo(
    () => (Array.isArray(payments) ? payments : []),
    [payments],
  );

  const methodOptions = useMemo(
    () =>
      [...new Set(paymentList.map((item) => item.paymentMethod))]
        .filter(Boolean)
        .map((value) => ({ value, label: value })),
    [paymentList],
  );

  const filteredPayments = useMemo(() => {
    const keyword = reservationFilter.trim().toLowerCase();
    return paymentList.filter((payment) => {
      const reservationCode = String(
        payment.reservationCode || "",
      ).toLowerCase();
      return (
        (!keyword || reservationCode.includes(keyword)) &&
        (!methodFilter || payment.paymentMethod === methodFilter) &&
        (!statusFilter || payment.paymentStatus === statusFilter)
      );
    });
  }, [methodFilter, paymentList, reservationFilter, statusFilter]);

  const columns = [
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
      title: "Time",
      dataIndex: "paymentTime",
      key: "paymentTime",
      sorter: (a, b) =>
        dayjs(a.paymentTime || 0).valueOf() -
        dayjs(b.paymentTime || 0).valueOf(),
      defaultSortOrder: "descend",
      sortDirections: ["descend", "ascend"],
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
        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_200px_200px_auto]">
          <Input
            allowClear
            value={reservationFilter}
            onChange={(event) => setReservationFilter(event.target.value)}
            prefix={<Search size={15} className="text-slate-400" />}
            placeholder="Filter by reservation code"
          />
          <Select
            allowClear
            value={methodFilter}
            onChange={(value) => setMethodFilter(value ?? null)}
            placeholder="Payment method"
            options={methodOptions}
          />
          <Select
            allowClear
            value={statusFilter}
            onChange={(value) => setStatusFilter(value ?? null)}
            placeholder="Payment status"
            options={[
              { value: "PAID", label: "Paid" },
              { value: "PENDING", label: "Pending" },
              { value: "UNPAID", label: "Unpaid" },
              { value: "FAILED", label: "Failed" },
            ]}
          />
          <Button
            onClick={() => {
              setReservationFilter("");
              setMethodFilter(null);
              setStatusFilter(null);
            }}
          >
            Reset
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : !driverId ? (
          <Empty description="Driver ID not found" />
        ) : error ? (
          <Empty description={error} />
        ) : paymentList.length === 0 ? (
          <Empty description="No payment history" />
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

export default PaymentHistory;
