import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Empty, Select, Spin, Tag } from "antd";
import {
  AlertTriangle,
  Building2,
  Car,
  Clock,
  LayoutDashboard,
  LogOut,
  ParkingCircle,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getManagerDashboardStatsRequest } from "../../../redux/manager/Dashboard/getManagerDashboardStatsSlice";
import { getManagerPeakHoursRequest } from "../../../redux/manager/Dashboard/getManagerPeakHoursSlice";
import { getBuildingListRequest } from "../../../redux/manager/Building/getBuildingList/getBuildingListSlice";

const SLOT_SEGMENTS = [
  { key: "availableSlots", label: "Available", color: "bg-emerald-500" },
  { key: "occupiedSlots", label: "Occupied", color: "bg-rose-500" },
  { key: "reservedSlots", label: "Reserved", color: "bg-violet-500" },
  { key: "pendingExitSlots", label: "Pending Exit", color: "bg-sky-500" },
];

const toNumberSafe = (value) => {
  if (value == null) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCount = (value) => {
  if (value == null) return "—";
  return toNumberSafe(value).toLocaleString("en-US");
};

const formatCurrency = (value) => {
  if (value == null) return "—";
  return `${toNumberSafe(value).toLocaleString("vi-VN")}đ`;
};

const formatDateDMY = (value) => {
  if (!value) return "—";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    const [year, month, day] = text.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }
  return text;
};

const formatHourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;

const formatDurationFromMinutes = (totalMinutes) => {
  const mins = toNumberSafe(totalMinutes);
  if (mins <= 0) return "0 min";
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
};

const getDefaultLast7DaysRange = () => [dayjs().subtract(6, "day"), dayjs()];

const toDashboardFilters = (range, buildingId) => {
  const [from, to] = Array.isArray(range) ? range : [];
  return {
    fromDay: from ? from.format("YYYY-MM-DD") : undefined,
    toDay: to ? to.format("YYYY-MM-DD") : undefined,
    buildingId: buildingId || undefined,
  };
};

const MetricTile = ({ icon, label, value, hint, accent }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className={`rounded-lg p-2 ${accent}`}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-slate-800">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState(getDefaultLast7DaysRange);
  const [buildingId, setBuildingId] = useState(null);
  const [appliedDateRange, setAppliedDateRange] = useState(getDefaultLast7DaysRange);
  const [appliedBuildingId, setAppliedBuildingId] = useState(null);

  const { stats, loading: statsLoading, error: statsError } = useSelector(
    (state) => state.getManagerDashboardStats,
  );
  const { peakHours, loading: peakLoading, error: peakError } = useSelector(
    (state) => state.getManagerPeakHours,
  );
  const { buildings: buildingList } = useSelector(
    (state) => state.getBuildingList,
  );

  const loading = statsLoading || peakLoading;
  const error = statsError || peakError;

  const fetchDashboard = useCallback(
    (range, selectedBuildingId) => {
      const filters = toDashboardFilters(range, selectedBuildingId);
      dispatch(getManagerDashboardStatsRequest(filters));
      dispatch(getManagerPeakHoursRequest(filters));
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(getBuildingListRequest());
    fetchDashboard(getDefaultLast7DaysRange(), null);
  }, [dispatch, fetchDashboard]);

  const occupancy = useMemo(() => stats?.occupancy || {}, [stats?.occupancy]);
  const sessions = useMemo(() => stats?.sessions || {}, [stats?.sessions]);
  const reservations = useMemo(
    () => stats?.reservations || {},
    [stats?.reservations],
  );
  const users = useMemo(() => stats?.users || {}, [stats?.users]);
  const incidents = useMemo(() => stats?.incidents || {}, [stats?.incidents]);

  const buildings = useMemo(
    () => (Array.isArray(occupancy.buildings) ? occupancy.buildings : []),
    [occupancy.buildings],
  );

  const buildingOptions = useMemo(() => {
    const list = Array.isArray(buildingList) ? buildingList : [];
    return [
      { value: "", label: "All buildings" },
      ...list.map((b) => ({
        value: b.id || b.buildingId,
        label: b.name || b.buildingName || "Unnamed building",
      })),
    ];
  }, [buildingList]);

  const appliedBuildingName = useMemo(() => {
    if (!appliedBuildingId) return null;
    const fromList = buildingOptions.find((o) => o.value === appliedBuildingId);
    if (fromList) return fromList.label;
    const fromStats = buildings.find((b) => b.buildingId === appliedBuildingId);
    return fromStats?.buildingName || "Selected building";
  }, [appliedBuildingId, buildingOptions, buildings]);

  const displayBuildings = useMemo(() => {
    if (!appliedBuildingId) return buildings;
    const matched = buildings.filter((b) => b.buildingId === appliedBuildingId);
    if (matched.length > 0) return matched;
    if (occupancy.totalSlots != null) {
      return [
        {
          buildingId: appliedBuildingId,
          buildingName: appliedBuildingName,
          totalSlots: occupancy.totalSlots,
          availableSlots: occupancy.availableSlots,
          occupiedSlots: occupancy.occupiedSlots,
          reservedSlots: occupancy.reservedSlots,
          pendingExitSlots: occupancy.pendingExitSlots,
          occupancyRate: occupancy.occupancyRate,
        },
      ];
    }
    return [];
  }, [appliedBuildingId, appliedBuildingName, buildings, occupancy]);

  const appliedRangeLabel = useMemo(() => {
    const [from, to] = appliedDateRange || [];
    if (!from || !to) return "All time";
    return `${from.format("DD/MM/YYYY")} – ${to.format("DD/MM/YYYY")}`;
  }, [appliedDateRange]);

  const commitFilters = (range, selectedBuildingId) => {
    setAppliedDateRange(range);
    setAppliedBuildingId(selectedBuildingId);
    fetchDashboard(range, selectedBuildingId);
  };

  const totalSlots = toNumberSafe(occupancy.totalSlots);
  const slotSegments = useMemo(
    () =>
      SLOT_SEGMENTS.map((segment) => ({
        ...segment,
        count: toNumberSafe(occupancy[segment.key]),
      })),
    [occupancy],
  );

  const revenueTrendData = useMemo(
    () =>
      (Array.isArray(stats?.revenueTrend) ? stats.revenueTrend : []).map(
        (item) => ({
          date: formatDateDMY(item.date),
          revenue: toNumberSafe(item.revenue),
          count: toNumberSafe(item.count),
        }),
      ),
    [stats?.revenueTrend],
  );

  const paymentMethods = useMemo(
    () =>
      Array.isArray(stats?.revenueByPaymentMethod)
        ? stats.revenueByPaymentMethod
        : [],
    [stats?.revenueByPaymentMethod],
  );

  const peakChartData = useMemo(
    () =>
      (Array.isArray(peakHours?.buckets) ? [...peakHours.buckets] : [])
        .sort((a, b) => toNumberSafe(a.hour) - toNumberSafe(b.hour))
        .map((bucket) => ({
          hour: formatHourLabel(bucket.hour),
          shortHour: `${String(bucket.hour).padStart(2, "0")}h`,
          count: toNumberSafe(bucket.sessionCount),
          isPeak: bucket.peak === true,
        })),
    [peakHours?.buckets],
  );

  const peakThreshold = toNumberSafe(peakHours?.peakThreshold);

  const applyFilters = () => commitFilters(dateRange, buildingId);

  const resetFilters = () => {
    const defaultRange = getDefaultLast7DaysRange();
    setDateRange(defaultRange);
    setBuildingId(null);
    commitFilters(defaultRange, null);
  };

  const applyPreset = (preset) => {
    let nextRange;
    if (preset === "month") {
      nextRange = [dayjs().startOf("month"), dayjs()];
    } else if (preset === 1) {
      nextRange = [dayjs().startOf("day"), dayjs()];
    } else {
      nextRange = [
        dayjs().subtract(preset - 1, "day").startOf("day"),
        dayjs(),
      ];
    }
    setDateRange(nextRange);
    commitFilters(nextRange, buildingId);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Manager" page="dashboard" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <LayoutDashboard size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                Parking Operations Dashboard
              </h1>
              <p className="mt-1 font-medium text-slate-500">
                {appliedBuildingName
                  ? `Stats for ${appliedBuildingName} · ${appliedRangeLabel}`
                  : `Overview for all buildings · ${appliedRangeLabel}`}
              </p>
              {stats?.generatedAt && (
                <p className="mt-1 text-xs text-slate-400">
                  Updated {dayjs(stats.generatedAt).format("DD/MM/YYYY HH:mm")}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-teal-100 bg-teal-50 px-5 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
              Occupancy Rate
            </p>
            <p className="text-3xl font-black text-teal-700">
              {toNumberSafe(occupancy.occupancyRate).toFixed(1)}%
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatCount(occupancy.occupiedSlots)} / {formatCount(totalSlots)} slots
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button size="small" onClick={() => applyPreset(1)}>
            Today
          </Button>
          <Button size="small" onClick={() => applyPreset(7)}>
            7 days
          </Button>
          <Button size="small" onClick={() => applyPreset(30)}>
            30 days
          </Button>
          <Button size="small" onClick={() => applyPreset("month")}>
            This month
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
              Date range
            </p>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(value) => setDateRange(value)}
              className="w-full"
              allowClear={false}
            />
          </div>
          <div className="min-w-[220px] flex-1">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
              Building
            </p>
            <Select
              value={buildingId || ""}
              onChange={(value) => setBuildingId(value || null)}
              options={buildingOptions}
              className="w-full"
              placeholder="All buildings"
            />
          </div>
          <Button type="primary" onClick={applyFilters} className="!bg-teal-600">
            Apply
          </Button>
          <Button onClick={resetFilters}>Reset</Button>
        </div>

        {(appliedBuildingName || appliedDateRange) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Showing:
            </span>
            <Tag color="blue">{appliedBuildingName || "All buildings"}</Tag>
            <Tag color="default">{appliedRangeLabel}</Tag>
            {loading && stats && (
              <span className="text-xs text-slate-400">Updating…</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {typeof error === "string" ? error : error?.message || "Failed to load dashboard"}
        </div>
      )}

      {loading && !stats ? (
        <div className="flex justify-center py-24">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Slot occupancy strip */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ParkingCircle size={18} className="text-teal-600" />
                <h2 className="text-base font-bold text-slate-800">
                  {appliedBuildingName
                    ? `Slot Status — ${appliedBuildingName}`
                    : "Slot Status Overview"}
                </h2>
              </div>
              <Tag color="default">{formatCount(totalSlots)} total slots</Tag>
            </div>
            <div className="mb-3 flex h-8 overflow-hidden rounded-full bg-slate-100">
              {slotSegments.map((segment) => {
                const width =
                  totalSlots > 0 ? (segment.count / totalSlots) * 100 : 0;
                if (width <= 0) return null;
                return (
                  <div
                    key={segment.key}
                    className={`${segment.color} transition-all`}
                    style={{ width: `${width}%` }}
                    title={`${segment.label}: ${segment.count}`}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {slotSegments.map((segment) => (
                <div
                  key={segment.key}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className={`h-3 w-3 rounded-full ${segment.color}`} />
                  <div>
                    <p className="text-xs text-slate-500">{segment.label}</p>
                    <p className="font-bold text-slate-800">
                      {formatCount(segment.count)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KPI row */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              icon={<Car size={16} className="text-teal-600" />}
              label="Active Sessions"
              value={formatCount(sessions.totalActiveSessions)}
              hint={`${formatCount(sessions.sessionsToday)} check-ins today`}
              accent="bg-teal-50"
            />
            <MetricTile
              icon={<Clock size={16} className="text-indigo-600" />}
              label="Avg Park Time"
              value={formatDurationFromMinutes(sessions.avgDurationMinutes)}
              hint={`~ ${formatCurrency(sessions.avgFee)} / session`}
              accent="bg-indigo-50"
            />
            <MetricTile
              icon={<AlertTriangle size={16} className="text-amber-600" />}
              label="Open Incidents"
              value={formatCount(incidents.totalOpen)}
              hint={`${formatCount(incidents.totalThisMonth)} this month`}
              accent="bg-amber-50"
            />
            <MetricTile
              icon={<Users size={16} className="text-violet-600" />}
              label="Drivers Parked"
              value={formatCount(users.driversCurrentlyParked)}
              hint={`${formatCount(users.totalDrivers)} total drivers`}
              accent="bg-violet-50"
            />
          </div>

          {/* Peak hours + Sessions */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-orange-500" />
                    <h2 className="text-base font-bold text-slate-800">
                      Check-in by Hour
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Avg {toNumberSafe(peakHours?.averagePerHour).toFixed(1)} check-ins/hr
                    {peakThreshold > 0 && ` · peak threshold ${peakThreshold.toFixed(1)}`}
                  </p>
                </div>
                {Array.isArray(peakHours?.peakHours) &&
                  peakHours.peakHours.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {peakHours.peakHours.map((hour) => (
                        <Tag key={hour} color="orange">
                          Peak {formatHourLabel(hour)}
                        </Tag>
                      ))}
                    </div>
                  )}
              </div>
              {peakChartData.length === 0 ? (
                <Empty description="No peak hour data" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={peakChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="shortHour"
                      tick={{ fontSize: 10 }}
                      interval={1}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                    <Tooltip
                      formatter={(value) => [formatCount(value), "Check-ins"]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.hour || ""
                      }
                    />
                    {peakThreshold > 0 && (
                      <ReferenceLine
                        y={peakThreshold}
                        stroke="#f97316"
                        strokeDasharray="4 4"
                        label={{
                          value: "Peak",
                          position: "insideTopRight",
                          fill: "#ea580c",
                          fontSize: 11,
                        }}
                      />
                    )}
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
                      {peakChartData.map((entry) => (
                        <Cell
                          key={entry.hour}
                          fill={entry.isPeak ? "#f97316" : "#14b8a6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-4 xl:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Session Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-600">Guest (active)</span>
                    <span className="font-bold text-slate-800">
                      {formatCount(sessions.activeGuestSessions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-600">Driver (active)</span>
                    <span className="font-bold text-slate-800">
                      {formatCount(sessions.activeDriverSessions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2">
                    <span className="text-sm text-teal-700">Today (guest)</span>
                    <span className="font-bold text-teal-800">
                      {formatCount(sessions.guestSessionsToday)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2">
                    <span className="text-sm text-teal-700">Today (registered)</span>
                    <span className="font-bold text-teal-800">
                      {formatCount(sessions.registeredSessionsToday)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Reservations
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Pending", value: reservations.totalPending, color: "text-amber-700 bg-amber-50" },
                    { label: "Completed", value: reservations.totalCompleted, color: "text-emerald-700 bg-emerald-50" },
                    { label: "Cancelled", value: reservations.totalCancelled, color: "text-rose-700 bg-rose-50" },
                    { label: "Expired", value: reservations.totalExpired, color: "text-slate-700 bg-slate-100" },
                    { label: "Today", value: reservations.totalToday, color: "text-violet-700 bg-violet-50" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-lg px-3 py-2 ${item.color}`}
                    >
                      <p className="text-[10px] font-semibold uppercase">{item.label}</p>
                      <p className="text-lg font-black">{formatCount(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Wallet size={18} className="text-emerald-600" />
                <h2 className="text-base font-bold text-slate-800">
                  Revenue Trend
                </h2>
              </div>
              {revenueTrendData.length === 0 ? (
                <Empty description="No revenue trend data" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueTrendData}>
                    <defs>
                      <linearGradient id="managerRevenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "revenue"
                          ? [formatCurrency(value), "Revenue"]
                          : [formatCount(value), "Transactions"]
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0d9488"
                      strokeWidth={2}
                      fill="url(#managerRevenueFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-800">
                Payment Methods
              </h2>
              {paymentMethods.length === 0 ? (
                <Empty description="No payment data" />
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((item) => (
                    <div
                      key={item.method}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <Tag color={item.method === "PAYOS" ? "blue" : "green"}>
                          {item.method}
                        </Tag>
                        <span className="text-xs text-slate-500">
                          {formatCount(item.count)} payments
                        </span>
                      </div>
                      <p className="text-xl font-black text-emerald-700">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Building occupancy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-slate-600" />
              <h2 className="text-base font-bold text-slate-800">
                {appliedBuildingName
                  ? `Building Occupancy — ${appliedBuildingName}`
                  : "Occupancy by Building"}
              </h2>
            </div>
            {displayBuildings.length === 0 ? (
              <Empty description="No building data for current filter" />
            ) : (
              <div className="space-y-4">
                {displayBuildings.map((building) => {
                  const rate = toNumberSafe(building.occupancyRate);
                  return (
                    <div
                      key={building.buildingId}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800">
                          {building.buildingName || "—"}
                        </p>
                        <span className="text-sm font-bold text-teal-700">
                          {rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all"
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{formatCount(building.availableSlots)} free</span>
                        <span>{formatCount(building.occupiedSlots)} occupied</span>
                        <span>{formatCount(building.reservedSlots)} reserved</span>
                        <span className="flex items-center gap-1">
                          <LogOut size={12} />
                          {formatCount(building.pendingExitSlots)} pending exit
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
};

export default Dashboard;
