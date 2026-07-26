/* eslint-disable react-hooks/preserve-manual-memoization */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Empty, Spin, Table, Tag, Tabs } from "antd";
import { Activity, CircleDollarSign } from "lucide-react";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getAdminDashboardStatsRequest } from "../../../redux/admin/dashboardStats/getAdminDashboardStatsSlice";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";

const CHART_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed"];

const toNumberSafe = (value) => {
  if (value == null) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCount = (value) => {
  if (value == null) return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString("en-US");
};

const formatCurrency = (value) => {
  if (value == null) return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `${num.toLocaleString("vi-VN")}đ`;
};

const formatDateDMY = (value) => {
  if (!value) return "—";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    const [year, month, day] = text.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return parsed.toLocaleDateString("vi-VN");
};

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

const resolveDriverName = (record) =>
  record?.driverName ?? record?.fullName ?? record?.driver?.fullName ?? "Guest";

const normalizePercentValue = (value) => {
  const num = toNumberSafe(value);
  if (num <= 1) return num * 100;
  return num;
};

const formatPercentValue = (value) =>
  `${normalizePercentValue(value).toFixed(1)}%`;

const ChartCard = ({ title, subtitle, children }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-slate-800">{title}</p>
    {subtitle && <p className="mb-3 text-xs text-slate-500">{subtitle}</p>}
    {children}
  </div>
);

const StatCard = ({
  icon,
  label,
  value,
  note,
  accentClass,
  containerClass,
}) => (
  <div
    className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${containerClass || ""}`}
  >
    <div className="mb-3 flex items-center justify-between">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClass}`}
      >
        {icon}
      </div>
    </div>
    <p className="text-3xl font-black text-slate-800">{value}</p>
    {note && (
      <p className="mt-1.5 text-xs font-medium text-slate-500">{note}</p>
    )}
  </div>
);

const getDefaultLast7DaysRange = () => [dayjs().subtract(6, "day"), dayjs()];

const toDashboardDateFilters = (range) => {
  const [from, to] = Array.isArray(range) ? range : [];
  return {
    fromDay: from ? from.format("YYYY-MM-DD") : undefined,
    toDay: to ? to.format("YYYY-MM-DD") : undefined,
  };
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState(getDefaultLast7DaysRange);
  const { stats, loading, error } = useSelector(
    (state) => state.getAdminDashboardStats,
  );
  const { payments: allPayments } = useSelector(
    (state) => state.getAllPayments,
  );

  useEffect(() => {
    dispatch(
      getAdminDashboardStatsRequest(
        toDashboardDateFilters(getDefaultLast7DaysRange()),
      ),
    );
    dispatch(getAllPaymentsRequest());
  }, [dispatch]);

  const applyDateFilter = () => {
    dispatch(getAdminDashboardStatsRequest(toDashboardDateFilters(dateRange)));
  };

  const resetDateFilter = () => {
    const defaultRange = getDefaultLast7DaysRange();
    setDateRange(defaultRange);
    dispatch(
      getAdminDashboardStatsRequest(toDashboardDateFilters(defaultRange)),
    );
  };

  const occupancy = useMemo(() => stats?.occupancy || {}, [stats?.occupancy]);
  const reservations = useMemo(
    () => stats?.reservations || {},
    [stats?.reservations],
  );
  const users = useMemo(() => stats?.users || {}, [stats?.users]);

  const occupancyPieData = useMemo(
    () =>
      [
        { name: "Occupied", value: toNumberSafe(occupancy.occupiedSlots) },
        { name: "Reserved", value: toNumberSafe(occupancy.reservedSlots) },
        {
          name: "Pending Exit",
          value: toNumberSafe(occupancy.pendingExitSlots),
        },
        { name: "Available", value: toNumberSafe(occupancy.availableSlots) },
      ].filter((item) => item.value > 0),
    [occupancy],
  );

  const reservationStatusData = useMemo(
    () => [
      { status: "Pending", count: toNumberSafe(reservations.totalPending) },
      { status: "Completed", count: toNumberSafe(reservations.totalCompleted) },
      { status: "Cancelled", count: toNumberSafe(reservations.totalCancelled) },
      { status: "Expired", count: toNumberSafe(reservations.totalExpired) },
    ],
    [reservations],
  );

  const revenueTrendData = useMemo(
    () =>
      (Array.isArray(stats?.revenueTrend) ? stats.revenueTrend : []).map(
        (item, index) => ({
          date: item.date ? formatDateDMY(item.date) : `D${index + 1}`,
          revenue: toNumberSafe(item.revenue),
          transactions: toNumberSafe(item.count),
        }),
      ),
    [stats?.revenueTrend],
  );

  const derivedMetrics = useMemo(() => {
    const totalRevenue = revenueTrendData.reduce(
      (sum, item) => sum + toNumberSafe(item.revenue),
      0,
    );
    const totalTransactions = revenueTrendData.reduce(
      (sum, item) => sum + toNumberSafe(item.transactions),
      0,
    );

    return {
      totalRevenue,
      avgRevenuePerTransaction:
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
    };
  }, [revenueTrendData]);

  const buildingColumns = [
    {
      title: "Building",
      dataIndex: "buildingName",
      key: "buildingName",
      render: (value) => (
        <span className="font-semibold text-slate-700">{value || "—"}</span>
      ),
    },
    {
      title: "Total Slots",
      dataIndex: "totalSlots",
      key: "totalSlots",
      align: "right",
      render: (value) => formatCount(value),
    },
    {
      title: "Occupied",
      dataIndex: "occupiedSlots",
      key: "occupiedSlots",
      align: "right",
      render: (value) => (
        <span className="font-semibold text-rose-700">
          {formatCount(value)}
        </span>
      ),
    },
    {
      title: "Reserved",
      dataIndex: "reservedSlots",
      key: "reservedSlots",
      align: "right",
      render: (value) => formatCount(value),
    },
    {
      title: "Pending Exit",
      dataIndex: "pendingExitSlots",
      key: "pendingExitSlots",
      align: "right",
      render: (value) => formatCount(value),
    },
    {
      title: "Occupancy Rate",
      dataIndex: "occupancyRate",
      key: "occupancyRate",
      align: "right",
      render: (value) => (
        <span className="font-bold text-blue-700">
          {formatPercentValue(value)}
        </span>
      ),
    },
  ];

  const commonColumns = [
    {
      title: "Driver",
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
      render: (method) => <Tag>{method || "—"}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => (
        <span className="font-bold text-emerald-700">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => {
        const normalized = normalizeStatus(status);
        return (
          <Tag color={PAYMENT_STATUS_COLORS[normalized] || "default"}>
            {status || "—"}
          </Tag>
        );
      },
    },
  ];

  const timeColumn = {
    title: "Time",
    dataIndex: "paymentTime",
    key: "paymentTime",
    align: "right",
    render: (time, record) => {
      const resolved = time || record.createdAt || record.updatedAt;
      return resolved ? dayjs(resolved).format("DD/MM/YYYY HH:mm") : "—";
    },
  };

  const payosColumns = [
    ...commonColumns,
    {
      title: "Transaction",
      dataIndex: "transactionCode",
      key: "transactionCode",
      render: (code) => <code className="text-xs text-slate-600">{code || "—"}</code>,
    },
    timeColumn,
  ];

  const cashColumns = [
    ...commonColumns,
    timeColumn,
  ];

  const buildingTableData = (
    Array.isArray(occupancy?.buildings) ? occupancy.buildings : []
  ).map((item, index) => ({
    key: item.buildingId || index,
    ...item,
  }));

  const paymentTableData = useMemo(() => {
    const [from, to] = Array.isArray(dateRange) ? dateRange : [];
    const fromMs = from ? from.startOf("day").valueOf() : null;
    const toMs = to ? to.endOf("day").valueOf() : null;

    const list = Array.isArray(allPayments) ? allPayments : [];
    return list
      .filter((item) => {
        if (toNumberSafe(item.amount) <= 0) return false;
        const raw = item.paymentTime || item.createdAt || item.updatedAt;
        if (!raw || (!fromMs && !toMs)) return true;
        const value = dayjs(raw).valueOf();
        if (Number.isNaN(value)) return false;
        if (fromMs != null && value < fromMs) return false;
        if (toMs != null && value > toMs) return false;
        return true;
      })
      .sort((a, b) => {
        const aValue = dayjs(
          a.paymentTime || a.createdAt || a.updatedAt || 0,
        ).valueOf();
        const bValue = dayjs(
          b.paymentTime || b.createdAt || b.updatedAt || 0,
        ).valueOf();
        return bValue - aValue;
      })
      .map((item, index) => ({
        key: item.paymentId || index,
        ...item,
      }));
  }, [allPayments, dateRange]);

  const payosPayments = useMemo(() => paymentTableData.filter(p => normalizeStatus(p.paymentMethod) === 'PAYOS'), [paymentTableData]);
  const cashPayments = useMemo(() => paymentTableData.filter(p => normalizeStatus(p.paymentMethod) === 'CASH'), [paymentTableData]);

  return (
    <div className="min-h-screen bg-[#f5f7ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Admin" page="dashboard" />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600">
              <Activity size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Admin Analytics Dashboard
              </h1>
              <p className="text-slate-500">
                Monitor occupancy, revenue, reservations, and users in one view.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="min-w-[270px]">
            <p className="mb-1 text-[11px] font-bold uppercase text-slate-500">
              Filter by Date Range
            </p>
            <DatePicker.RangePicker
              className="w-full"
              value={dateRange}
              onChange={(values) => setDateRange(values || [])}
              format="DD/MM/YYYY"
              placeholder={["From", "To"]}
            />
          </div>
          <Button
            type="primary"
            className="bg-indigo-600! font-semibold!"
            onClick={applyDateFilter}
          >
            Apply
          </Button>
          <Button className="font-semibold!" onClick={resetDateFilter}>
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load dashboard"}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-stretch">
        <StatCard
          label="Revenue (Selected Trend)"
          value={formatCurrency(derivedMetrics.totalRevenue)}
          note={`Avg/txn: ${formatCurrency(derivedMetrics.avgRevenuePerTransaction)}`}
          icon={<CircleDollarSign size={18} className="text-emerald-600" />}
          accentClass="bg-emerald-50"
          containerClass="h-full border-emerald-100 bg-emerald-50/40"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">
              Total Drivers
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {formatCount(users.totalDrivers)}
            </p>
          </div>
          <div className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">
              Total Staff
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {formatCount(users.totalStaff)}
            </p>
          </div>
          <div className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">
              Total Managers
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {formatCount(users.totalManagers)}
            </p>
          </div>
          <div className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">
              New Users This Month
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {formatCount(users.newUsersThisMonth)}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard
              title="Current Parking Status"
              subtitle="Real-time parking occupancy (not affected by date filter). Unit: slots and %."
            >
              {occupancyPieData.length === 0 ? (
                <Empty description="No occupancy data" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={occupancyPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={55}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {occupancyPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `${formatCount(value)} slots`,
                          "Slot Count",
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard
              title="Reservations by Status"
              subtitle="Reservation status distribution for the selected date range (affected by date filter). Unit: reservations."
            >
              {reservationStatusData.every((item) => item.count === 0) ? (
                <Empty description="No reservation status data" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reservationStatusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={55}
                        label={({ status, percent }) =>
                          `${status}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {reservationStatusData.map((entry, index) => (
                          <Cell
                            key={`reservation-cell-${entry.status}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `${formatCount(value)} reservations`,
                          "Reservations",
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="mb-4">
            <ChartCard
              title="Revenue Trend"
              subtitle="Track revenue trajectory for the selected period (unit: VND)."
            >
              {revenueTrendData.length === 0 ? (
                <Empty description="No revenue trend data" />
              ) : (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue (VND)",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (VND)"
                        stroke="#16a34a"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="mb-4">
            <ChartCard
              title="Transactions Trend"
              subtitle="Understand transaction volume for the selected period (unit: transactions)."
            >
              {revenueTrendData.length === 0 ? (
                <Empty description="No transaction trend data" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `${formatCount(value)} transactions`,
                          "Transactions",
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="transactions"
                        name="Transactions (count)"
                        fill="#7c3aed"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-800">
              Building Occupancy Detail
            </h2>
            <Table
              columns={buildingColumns}
              dataSource={buildingTableData}
              pagination={{ pageSize: 6 }}
              rowClassName="hover:!bg-slate-50"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-800">
              Payment Transactions Detail
            </h2>
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "PayOS Transactions",
                  children: (
                    <Table
                      columns={payosColumns}
                      dataSource={payosPayments}
                      pagination={{ pageSize: 5 }}
                      rowClassName="hover:!bg-slate-50"
                      scroll={{ x: 800 }}
                    />
                  ),
                },
                {
                  key: "2",
                  label: "Cash Transactions",
                  children: (
                    <Table
                      columns={cashColumns}
                      dataSource={cashPayments}
                      pagination={{ pageSize: 5 }}
                      rowClassName="hover:!bg-slate-50"
                      scroll={{ x: 800 }}
                    />
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;