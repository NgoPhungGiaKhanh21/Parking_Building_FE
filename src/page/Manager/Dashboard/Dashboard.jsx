import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Empty, Progress, Spin, Table, Tag } from "antd";
import { CalendarRange, Building2, CircleDollarSign, Receipt } from "lucide-react";
import dayjs from "dayjs";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getRevenueRequest } from "../../../redux/manager/Revenue/getRevenueSlice";

const formatCurrency = (value) => {
  if (value == null) return "—";
  return `${Number(value).toLocaleString("vi-VN")}đ`;
};

const formatCount = (value) => {
  if (value == null) return "—";
  if (typeof value === "number") return value.toLocaleString("en-US");
  const text = String(value);
  if (!/^\d+$/.test(text)) return text;
  return text.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const toNumberSafe = (value) => {
  if (value == null) return 0;
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return num;
};

const formatIsoDateTime = (value) => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—");

const Dashboard = () => {
  const dispatch = useDispatch();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const { getRevenue: revenueData, loading, error } = useSelector(
    (state) => state.getRevenue,
  );

  useEffect(() => {
    dispatch(getRevenueRequest());
  }, [dispatch]);

  const buildings = useMemo(
    () => (Array.isArray(revenueData?.buildings) ? revenueData.buildings : []),
    [revenueData],
  );

  const totalRevenueNum = useMemo(
    () => toNumberSafe(revenueData?.totalRevenue),
    [revenueData],
  );

  const totalPaymentNum = useMemo(
    () => toNumberSafe(revenueData?.totalPaymentCount),
    [revenueData],
  );

  const topRevenueBuilding = useMemo(() => {
    if (buildings.length === 0) return null;
    return [...buildings].sort(
      (a, b) => toNumberSafe(b.totalRevenue) - toNumberSafe(a.totalRevenue),
    )[0];
  }, [buildings]);

  const topPaymentBuilding = useMemo(() => {
    if (buildings.length === 0) return null;
    return [...buildings].sort(
      (a, b) => toNumberSafe(b.paymentCount) - toNumberSafe(a.paymentCount),
    )[0];
  }, [buildings]);

  const revenueShareByBuilding = useMemo(
    () =>
      buildings.map((b) => {
        const revenue = toNumberSafe(b.totalRevenue);
        const percent = totalRevenueNum > 0 ? (revenue / totalRevenueNum) * 100 : 0;
        return {
          ...b,
          revenue,
          percent: Math.max(0, Math.min(100, percent)),
        };
      }),
    [buildings, totalRevenueNum],
  );

  const tableData = useMemo(
    () =>
      buildings.map((item, index) => ({
        key: item.buildingId || index,
        ...item,
      })),
    [buildings],
  );

  const applyFilter = () => {
    dispatch(
      getRevenueRequest({
        from: from ? from.toISOString() : undefined,
        to: to ? to.toISOString() : undefined,
      }),
    );
  };

  const applyPreset = (preset) => {
    const now = dayjs();
    let nextFrom;
    const nextTo = now;

    if (preset === "TODAY") {
      nextFrom = now.startOf("day");
    } else if (preset === "7D") {
      nextFrom = now.subtract(6, "day").startOf("day");
    } else if (preset === "30D") {
      nextFrom = now.subtract(29, "day").startOf("day");
    } else if (preset === "MONTH") {
      nextFrom = now.startOf("month");
    } else {
      return;
    }

    setFrom(nextFrom);
    setTo(nextTo);
    dispatch(
      getRevenueRequest({
        from: nextFrom.toISOString(),
        to: nextTo.toISOString(),
      }),
    );
  };

  const resetFilter = () => {
    setFrom(null);
    setTo(null);
    dispatch(getRevenueRequest());
  };

  const columns = [
    {
      title: "Building",
      dataIndex: "buildingName",
      key: "buildingName",
      render: (value) => (
        <span className="font-semibold text-slate-700">{value || "—"}</span>
      ),
    },
    {
      title: "Total Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right",
      render: (value) => (
        <span className="font-bold text-emerald-700">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "Payments",
      dataIndex: "paymentCount",
      key: "paymentCount",
      align: "right",
      render: (value) => (
        <span className="font-semibold text-indigo-700">{formatCount(value)}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Manager" page="revenue" />
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
            <CircleDollarSign size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Revenue Dashboard</h1>
            <p className="text-slate-500">
              Track total revenue and payment volume by building.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {typeof error === "string" ? error : error?.message || "Failed to fetch revenue"}
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            type="default"
            className="!rounded-lg !font-semibold"
            onClick={() => applyPreset("TODAY")}
          >
            Today
          </Button>
          <Button
            type="default"
            className="!rounded-lg !font-semibold"
            onClick={() => applyPreset("7D")}
          >
            7D
          </Button>
          <Button
            type="default"
            className="!rounded-lg !font-semibold"
            onClick={() => applyPreset("30D")}
          >
            30D
          </Button>
          <Button
            type="default"
            className="!rounded-lg !font-semibold"
            onClick={() => applyPreset("MONTH")}
          >
            This Month
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px]">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">From</p>
            <DatePicker
              showTime
              value={from}
              onChange={setFrom}
              className="w-full"
              placeholder="Select start date-time"
            />
          </div>
          <div className="min-w-[220px]">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">To</p>
            <DatePicker
              showTime
              value={to}
              onChange={setTo}
              className="w-full"
              placeholder="Select end date-time"
            />
          </div>
          <Button type="primary" onClick={applyFilter} className="!bg-indigo-600 !font-semibold">
            Apply Filter
          </Button>
          <Button onClick={resetFilter} className="!font-semibold">
            Reset
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase text-emerald-500">Total Revenue</p>
          <p className="text-3xl font-black text-emerald-700">
            {formatCurrency(revenueData?.totalRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase text-indigo-500">Total Payments</p>
          <p className="text-3xl font-black text-indigo-700">
            {formatCount(revenueData?.totalPaymentCount)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase text-amber-500">Filter Range</p>
          <div className="space-y-1 text-sm text-slate-700">
            <p className="flex items-center gap-2">
              <CalendarRange size={14} />
              {formatIsoDateTime(revenueData?.from)}
            </p>
            <p className="flex items-center gap-2">
              <CalendarRange size={14} />
              {formatIsoDateTime(revenueData?.to)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-1">
          <p className="mb-4 text-xs font-bold uppercase text-slate-500">
            Top Revenue Building Share
          </p>
          <div className="flex items-center justify-center">
            <Progress
              type="circle"
              percent={
                topRevenueBuilding && totalRevenueNum > 0
                  ? Math.round(
                      (toNumberSafe(topRevenueBuilding.totalRevenue) / totalRevenueNum) * 100,
                    )
                  : 0
              }
              size={160}
              strokeColor="#10b981"
              format={(percent) => `${percent}%`}
            />
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-slate-700">
            {topRevenueBuilding?.buildingName || "—"}
          </p>
          <p className="text-center text-xs text-slate-500">
            {topRevenueBuilding
              ? `${formatCurrency(topRevenueBuilding.totalRevenue)} / ${formatCurrency(totalRevenueNum)}`
              : "No data"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-1">
          <p className="mb-4 text-xs font-bold uppercase text-slate-500">
            Top Payment Building Share
          </p>
          <div className="flex items-center justify-center">
            <Progress
              type="circle"
              percent={
                topPaymentBuilding && totalPaymentNum > 0
                  ? Math.round(
                      (toNumberSafe(topPaymentBuilding.paymentCount) / totalPaymentNum) * 100,
                    )
                  : 0
              }
              size={160}
              strokeColor="#6366f1"
              format={(percent) => `${percent}%`}
            />
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-slate-700">
            {topPaymentBuilding?.buildingName || "—"}
          </p>
          <p className="text-center text-xs text-slate-500">
            {topPaymentBuilding
              ? `${formatCount(topPaymentBuilding.paymentCount)} / ${formatCount(totalPaymentNum)} payments`
              : "No data"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-1">
          <p className="mb-4 text-xs font-bold uppercase text-slate-500">Revenue Distribution</p>
          <div className="space-y-3">
            {revenueShareByBuilding.slice(0, 5).map((item) => (
              <div key={item.buildingId || item.buildingName}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.buildingName || "—"}</span>
                  <span className="font-bold text-emerald-700">{item.percent.toFixed(1)}%</span>
                </div>
                <Progress percent={Number(item.percent.toFixed(1))} showInfo={false} strokeColor="#10b981" />
              </div>
            ))}
            {revenueShareByBuilding.length === 0 && (
              <p className="text-sm text-slate-400">No distribution data.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <Building2 size={18} />
          <h2 className="text-base font-bold">Revenue by Building</h2>
          <Tag color="blue" className="ml-1">
            <Receipt size={12} className="mr-1 inline" />
            {formatCount(buildings.length)} buildings
          </Tag>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : tableData.length === 0 ? (
          <div className="py-10">
            <Empty description="No revenue data found for selected range" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{ pageSize: 8 }}
            rowClassName="hover:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
