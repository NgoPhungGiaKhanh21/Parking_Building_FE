import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  Select,
  Spin,
  Table,
  Tag,
} from "antd";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock3,
  FileWarning,
  PlusCircle,
  RefreshCw,
  Ticket,
} from "lucide-react";
import dayjs from "dayjs";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getCurrentSessionRequest } from "../../../redux/driver/session/currentSession/currentSessionSlice";
import {
  createDriverIncidentRequest,
  getMyDriverIncidentsRequest,
  resetIncidentMutationStatus,
} from "../../../redux/incident/incidentSlice";

const { TextArea } = Input;

const INCIDENT_TYPE_OPTIONS = [
  { value: "DRIVER_LOST_TICKET", label: "Lost parking ticket" },
  {
    value: "DRIVER_CANNOT_FIND_VEHICLE",
    label: "Cannot find my vehicle",
  },
  { value: "DRIVER_INCORRECT_FEE", label: "Incorrect parking fee" },
  { value: "DRIVER_SLOT_OCCUPIED", label: "Assigned slot is occupied" },
];

const INCIDENT_TYPE_LABELS = Object.fromEntries(
  INCIDENT_TYPE_OPTIONS.map((item) => [item.value, item.label]),
);

const STATUS_COLORS = {
  OPEN: "red",
  IN_PROGRESS: "blue",
  PENDING: "gold",
  RESOLVED: "green",
  CLOSED: "default",
  CANCELLED: "default",
};

const getSessions = (currentSession) => {
  if (!currentSession) return [];
  if (Array.isArray(currentSession.sessions)) return currentSession.sessions;
  if (currentSession.sessionId) return [currentSession];
  return [];
};

const DriverIncidentReports = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { currentSession, loading: sessionLoading } = useSelector(
    (state) => state.getCurrentSession,
  );
  const {
    myReports,
    loadingMyReports,
    creating,
    createSuccess,
    error,
  } = useSelector((state) => state.incident);

  useEffect(() => {
    dispatch(getCurrentSessionRequest());
    dispatch(getMyDriverIncidentsRequest());
    return () => dispatch(resetIncidentMutationStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!createSuccess) return;
    form.resetFields();
    dispatch(resetIncidentMutationStatus());
  }, [createSuccess, dispatch, form]);

  const sessions = useMemo(() => getSessions(currentSession), [currentSession]);
  const reports = useMemo(
    () => (Array.isArray(myReports) ? myReports : []),
    [myReports],
  );

  const sessionOptions = useMemo(
    () =>
      sessions.map((session) => ({
        value: session.sessionId,
        label: `${session.vehiclePlate || "Vehicle"} · ${session.ticketCode || session.sessionId}`,
      })),
    [sessions],
  );

  const summary = useMemo(
    () => ({
      open: reports.filter((item) => item.status === "OPEN").length,
      processing: reports.filter((item) =>
        ["IN_PROGRESS", "PENDING"].includes(item.status),
      ).length,
      completed: reports.filter((item) =>
        ["RESOLVED", "CLOSED"].includes(item.status),
      ).length,
    }),
    [reports],
  );

  const handleSubmit = (values) => {
    dispatch(
      createDriverIncidentRequest({
        sessionId: values.sessionId,
        incidentType: values.incidentType,
        description: values.description.trim(),
      }),
    );
  };

  const columns = [
    {
      title: "Report",
      key: "report",
      render: (_, record) => (
        <div>
          <p className="font-semibold text-slate-800">
            {INCIDENT_TYPE_LABELS[record.incidentType] || record.incidentType}
          </p>
          <p className="mt-0.5 max-w-[300px] truncate text-xs text-slate-500">
            {record.description || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Vehicle / Ticket",
      key: "vehicle",
      render: (_, record) => (
        <div className="text-sm">
          <p className="font-semibold text-slate-700">
            {record.vehiclePlate || "—"}
          </p>
          <p className="font-mono text-xs text-slate-400">
            {record.ticketCode || record.sessionId || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {String(status || "UNKNOWN").replaceAll("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      defaultSortOrder: "descend",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—",
    },
    {
      title: "Resolution",
      key: "resolution",
      render: (_, record) =>
        record.resolution ? (
          <div className="max-w-[280px]">
            <p className="text-sm text-slate-700">{record.resolution}</p>
            {record.resolutionAction && (
              <Tag color="cyan" className="mt-1">
                {record.resolutionAction.replaceAll("_", " ")}
              </Tag>
            )}
          </div>
        ) : (
          <span className="text-slate-400">Waiting for staff</span>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Driver" page="reports" />
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <FileWarning size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Parking Incident Reports
              </h1>
              <p className="text-slate-500">
                Report parking problems and track staff resolution.
              </p>
            </div>
          </div>
          <Button
            icon={<RefreshCw size={15} />}
            loading={loadingMyReports}
            onClick={() => dispatch(getMyDriverIncidentsRequest())}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Open",
            value: summary.open,
            icon: AlertTriangle,
            color: "text-red-600",
            background: "bg-red-50",
          },
          {
            label: "In progress",
            value: summary.processing,
            icon: Clock3,
            color: "text-blue-600",
            background: "bg-blue-50",
          },
          {
            label: "Resolved / Closed",
            value: summary.completed,
            icon: CheckCircle2,
            color: "text-emerald-600",
            background: "bg-emerald-50",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-3xl font-black text-slate-800">
                  {item.value}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.background} ${item.color}`}
              >
                <item.icon size={21} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          className="mb-5"
          message={typeof error === "string" ? error : "Request failed"}
        />
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <PlusCircle size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Create report</h2>
              <p className="text-xs text-slate-500">
                Select the affected parking session.
              </p>
            </div>
          </div>

          {sessionLoading ? (
            <div className="flex justify-center py-16">
              <Spin />
            </div>
          ) : sessionOptions.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No active parking session available"
            />
          ) : (
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="sessionId"
                label="Parking session"
                rules={[{ required: true, message: "Select a session." }]}
              >
                <Select
                  placeholder="Vehicle plate · ticket"
                  options={sessionOptions}
                  suffixIcon={<Car size={15} />}
                />
              </Form.Item>
              <Form.Item
                name="incidentType"
                label="Problem type"
                rules={[{ required: true, message: "Select a problem type." }]}
              >
                <Select
                  placeholder="Select incident type"
                  options={INCIDENT_TYPE_OPTIONS}
                  suffixIcon={<Ticket size={15} />}
                />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Describe the problem." },
                  { min: 10, message: "Enter at least 10 characters." },
                ]}
              >
                <TextArea
                  rows={5}
                  maxLength={500}
                  showCount
                  placeholder="Describe what happened and any useful details..."
                />
              </Form.Item>
              <Button
                block
                type="primary"
                htmlType="submit"
                loading={creating}
                className="h-11"
                icon={<FileWarning size={16} />}
              >
                Submit Report
              </Button>
            </Form>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            My report history
          </h2>
          <Table
            rowKey={(record) => record.incidentId}
            columns={columns}
            dataSource={reports}
            loading={loadingMyReports}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 1000 }}
            locale={{ emptyText: "You have not submitted any reports." }}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverIncidentReports;
