import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Empty, Modal, Spin, Tag } from "antd";
import { TrendingUp } from "lucide-react";
import dayjs from "dayjs";
import {
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
import {
  getBuildingPeakHoursRequest,
  getBuildingPeakHoursReset,
} from "../../../redux/driver/availability/getBuildingPeakHours/getBuildingPeakHoursSlice";

const toNumberSafe = (value) => {
  if (value == null) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatHourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;

const getDefaultLast7DaysRange = () => [dayjs().subtract(6, "day"), dayjs()];

const PeakHoursModal = ({ open, onClose, buildingId, buildingName }) => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState(getDefaultLast7DaysRange);
  const { peakHours, loading, error } = useSelector(
    (state) => state.getBuildingPeakHours,
  );

  const fetchPeakHours = (range) => {
    if (!buildingId) return;
    const [from, to] = range || [];
    dispatch(
      getBuildingPeakHoursRequest({
        buildingId,
        fromDay: from?.format("YYYY-MM-DD"),
        toDay: to?.format("YYYY-MM-DD"),
      }),
    );
  };

  useEffect(() => {
    if (!open || !buildingId) return;
    const defaultRange = getDefaultLast7DaysRange();
    setDateRange(defaultRange);
    const [from, to] = defaultRange;
    dispatch(
      getBuildingPeakHoursRequest({
        buildingId,
        fromDay: from.format("YYYY-MM-DD"),
        toDay: to.format("YYYY-MM-DD"),
      }),
    );
  }, [open, buildingId, dispatch]);

  const handleClose = () => {
    dispatch(getBuildingPeakHoursReset());
    onClose();
  };

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

  const applyPreset = (days) => {
    const nextRange =
      days === 1
        ? [dayjs().startOf("day"), dayjs()]
        : [dayjs().subtract(days - 1, "day").startOf("day"), dayjs()];
    setDateRange(nextRange);
    fetchPeakHours(nextRange);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-orange-500" />
          <span>Peak Hours — {buildingName || "Building"}</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={720}
      centered
      destroyOnClose
    >
      <p className="mb-4 text-sm text-slate-500">
        Busier hours at this building — useful for choosing when to arrive or
        book a reservation.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="small" onClick={() => applyPreset(7)}>
          7 days
        </Button>
        <Button size="small" onClick={() => applyPreset(30)}>
          30 days
        </Button>
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(value) => {
            if (!value) return;
            setDateRange(value);
            fetchPeakHours(value);
          }}
          allowClear={false}
          className="ml-auto"
        />
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {typeof error === "string" ? error : error?.message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : peakChartData.length === 0 ? (
        <Empty description="No peak hour data for this period" />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Avg {toNumberSafe(peakHours?.averagePerHour).toFixed(1)} check-ins/hr
              {peakThreshold > 0 && ` · peak threshold ${peakThreshold.toFixed(1)}`}
            </p>
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

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={peakChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="shortHour" tick={{ fontSize: 10 }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
              <Tooltip
                formatter={(value) => [value, "Check-ins"]}
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
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
                {peakChartData.map((entry) => (
                  <Cell
                    key={entry.hour}
                    fill={entry.isPeak ? "#f97316" : "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </Modal>
  );
};

export default PeakHoursModal;
