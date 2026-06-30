/* eslint-disable react-hooks/preserve-manual-memoization */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Empty, Spin, Table, Tag } from "antd";
import {
  Activity,
  CircleDollarSign,
  ParkingCircle,
  Users,
  CalendarDays,
} from "lucide-react";
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

const StatCard = ({ icon, label, value, note, accentClass }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClass}`}
      >
        {icon}
      </div>
    </div>
    <p className="text-2xl font-black text-slate-800">{value}</p>
    {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState([]);
  const { stats, loading, error } = useSelector(
    (state) => state.getAdminDashboardStats,
  );

  useEffect(() => {
    dispatch(getAdminDashboardStatsRequest());
  }, [dispatch]);

  const applyDateFilter = () => {
    const [from, to] = Array.isArray(dateRange) ? dateRange : [];
    dispatch(
      getAdminDashboardStatsRequest({
        fromDay: from ? from.format("YYYY-MM-DD") : undefined,
        toDay: to ? to.format("YYYY-MM-DD") : undefined,
      }),
    );
  };

  const resetDateFilter = () => {
    setDateRange([]);
    dispatch(getAdminDashboardStatsRequest());
  };

  const occupancy = useMemo(() => stats?.occupancy || {}, [stats?.occupancy]);
  const sessions = useMemo(() => stats?.sessions || {}, [stats?.sessions]);
  const reservations = useMemo(
    () => stats?.reservations || {},
    [stats?.reservations],
  );
  const users = useMemo(() => stats?.users || {}, [stats?.users]);
  const generatedAt = stats?.generatedAt;

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

  const buildingOccupancyData = useMemo(
    () =>
      (Array.isArray(occupancy?.buildings) ? occupancy.buildings : []).map(
        (item) => ({
          name: item.buildingName || "N/A",
          occupancyRate: Number(
            normalizePercentValue(item.occupancyRate).toFixed(1),
          ),
          occupied: toNumberSafe(item.occupiedSlots),
          total: toNumberSafe(item.totalSlots),
        }),
      ),
    [occupancy?.buildings],
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

  const paymentMethodData = useMemo(
    () =>
      (Array.isArray(stats?.revenueByPaymentMethod)
        ? stats.revenueByPaymentMethod
        : []
      ).map((item) => ({
        method: item.method || "Unknown",
        totalRevenue: toNumberSafe(item.totalRevenue),
        count: toNumberSafe(item.count),
      })),
    [stats?.revenueByPaymentMethod],
  );

  const revenueTrendData = useMemo(
    () =>
      (Array.isArray(stats?.revenueTrend) ? stats.revenueTrend : []).map(
        (item, index) => ({
          date: item.date || `D${index + 1}`,
          revenue: toNumberSafe(item.revenue),
          transactions: toNumberSafe(item.count),
        }),
      ),
    [stats?.revenueTrend],
  );

  const derivedMetrics = useMemo(() => {
    const totalReservationToday = toNumberSafe(reservations.totalToday);
    const completedToday = toNumberSafe(reservations.totalCompleted);
    const successRate =
      totalReservationToday > 0
        ? (completedToday / totalReservationToday) * 100
        : 0;

    const totalRevenue = revenueTrendData.reduce(
      (sum, item) => sum + toNumberSafe(item.revenue),
      0,
    );
    const totalTransactions = revenueTrendData.reduce(
      (sum, item) => sum + toNumberSafe(item.transactions),
      0,
    );

    return {
      successRate: successRate.toFixed(1),
      totalRevenue,
      avgRevenuePerTransaction:
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
    };
  }, [
    reservations.totalCompleted,
    reservations.totalToday,
    revenueTrendData,
  ]);

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

  const paymentMethodColumns = [
    {
      title: "Payment Method",
      dataIndex: "method",
      key: "method",
      render: (value) => (
        <span className="font-semibold text-slate-700">{value || "—"}</span>
      ),
    },
    {
      title: "Transactions",
      dataIndex: "count",
      key: "count",
      align: "right",
      render: (value) => formatCount(value),
    },
    {
      title: "Total Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right",
      render: (value) => (
        <span className="font-bold text-emerald-700">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Avg / Transaction",
      key: "avgPerTxn",
      align: "right",
      render: (_, row) => {
        const count = toNumberSafe(row.count);
        const avg = count > 0 ? toNumberSafe(row.totalRevenue) / count : 0;
        return (
          <span className="font-semibold text-indigo-700">
            {formatCurrency(avg)}
          </span>
        );
      },
    },
  ];

  const buildingTableData = (
    Array.isArray(occupancy?.buildings) ? occupancy.buildings : []
  ).map((item, index) => ({
    key: item.buildingId || index,
    ...item,
  }));

  const paymentTableData = paymentMethodData.map((item, index) => ({
    key: `${item.method}-${index}`,
    ...item,
  }));

  return (
    <div className="min-h-screen bg-[#f5f7ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Admin" page="dashboard" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
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
          <Tag color="blue" className="px-3! py-1! text-xs! font-semibold!">
            Generated:{" "}
            {generatedAt ? new Date(generatedAt).toLocaleString() : "—"}
          </Tag>
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

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (Selected Trend)"
          value={formatCurrency(derivedMetrics.totalRevenue)}
          note={`Avg/txn: ${formatCurrency(derivedMetrics.avgRevenuePerTransaction)}`}
          icon={<CircleDollarSign size={18} className="text-emerald-600" />}
          accentClass="bg-emerald-50"
        />
        <StatCard
          label="Occupancy Rate"
          value={formatPercentValue(occupancy.occupancyRate)}
          note={`${formatCount(occupancy.occupiedSlots)} / ${formatCount(occupancy.totalSlots)} slots occupied`}
          icon={<ParkingCircle size={18} className="text-blue-600" />}
          accentClass="bg-blue-50"
        />
        <StatCard
          label="Active Sessions"
          value={formatCount(sessions.totalActiveSessions)}
          note={`Today: ${formatCount(sessions.sessionsToday)}`}
          icon={<CalendarDays size={18} className="text-amber-600" />}
          accentClass="bg-amber-50"
        />
        <StatCard
          label="Drivers Currently Parked"
          value={formatCount(users.driversCurrentlyParked)}
          note={`Reservation success today: ${derivedMetrics.successRate}%`}
          icon={<Users size={18} className="text-indigo-600" />}
          accentClass="bg-indigo-50"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Total Drivers
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800">
            {formatCount(users.totalDrivers)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Total Staff
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800">
            {formatCount(users.totalStaff)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Total Managers
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800">
            {formatCount(users.totalManagers)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            New Users This Month
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800">
            {formatCount(users.newUsersThisMonth)}
          </p>
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
              title="Occupancy Composition"
              subtitle="How current slots are distributed: occupied, reserved, pending exit, and available."
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
                      <Tooltip formatter={(value) => formatCount(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard
              title="Occupancy Rate by Building"
              subtitle="Compare building utilization to detect overloaded areas."
            >
              {buildingOccupancyData.length === 0 ? (
                <Empty description="No building occupancy data" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buildingOccupancyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis unit="%" />
                      <Tooltip
                        formatter={(value, name) =>
                          name === "occupancyRate"
                            ? [`${value}%`, "Occupancy Rate"]
                            : [formatCount(value), name]
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey="occupancyRate"
                        name="Occupancy Rate"
                        fill="#2563eb"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="mb-4">
            <ChartCard
              title="Revenue Trend"
              subtitle="Track revenue trajectory for the selected period."
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
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
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

          <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard
              title="Transactions Trend"
              subtitle="Understand transaction volume for the selected period."
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
                      <Tooltip formatter={(value) => formatCount(value)} />
                      <Legend />
                      <Bar
                        dataKey="transactions"
                        name="Transactions"
                        fill="#7c3aed"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard
              title="Reservations by Status"
              subtitle="Track reservation pipeline health and bottlenecks."
            >
              {reservationStatusData.every((item) => item.count === 0) ? (
                <Empty description="No reservation status data" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reservationStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCount(value)} />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Reservations"
                        fill="#f59e0b"
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
              Payment Method Detail
            </h2>
            <Table
              columns={paymentMethodColumns}
              dataSource={paymentTableData}
              pagination={{ pageSize: 5 }}
              rowClassName="hover:!bg-slate-50"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
