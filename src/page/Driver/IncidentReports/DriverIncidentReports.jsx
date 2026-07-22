import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
} from "antd";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
  PlusCircle,
  RefreshCw,
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
  { value: "DRIVER_INCORRECT_FEE", label: "Incorrect parking fee" },
  { value: "DRIVER_SLOT_OCCUPIED", label: "Assigned slot is occupied" },
];

const INCIDENT_TYPE_LABELS = {
  ...Object.fromEntries(
    INCIDENT_TYPE_OPTIONS.map((item) => [item.value, item.label]),
  ),
  DRIVER_CANNOT_FIND_VEHICLE: "Cannot find my vehicle",
};

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    const timer = setTimeout(() => {
      setIsCreateModalOpen(false);
      form.resetFields();
      dispatch(resetIncidentMutationStatus());
    }, 0);

    return () => clearTimeout(timer);
  }, [createSuccess, dispatch, form]);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    form.resetFields();
    dispatch(resetIncidentMutationStatus());
  };

  const sessions = useMemo(() => getSessions(currentSession), [currentSession]);
  const reports = useMemo(
    () => (Array.isArray(myReports) ? myReports : []),
    [myReports],
  );

  const sessionOptions = useMemo(
    () => sessions.filter((session) => session.sessionId),
    [sessions],
  );
  const activeSession = sessionOptions[0] || null;

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
        sessionId: activeSession.sessionId,
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
          <p className="mt-0.5 max-w-75 truncate text-xs text-slate-500">
            {record.description || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Vehicle",
      key: "vehicle",
      render: (_, record) => (
        <div className="text-sm">
          <p className="font-semibold text-slate-700">
            {record.vehiclePlate || "—"}
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
          <div className="max-w-70">
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
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<RefreshCw size={15} />}
              loading={loadingMyReports}
              onClick={() => dispatch(getMyDriverIncidentsRequest())}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusCircle size={15} />}
              loading={sessionLoading}
              disabled={!sessionLoading && !activeSession}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Report
            </Button>
          </div>
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

      <div className="grid grid-cols-1 gap-6">
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
            scroll={{ x: 760 }}
            locale={{ emptyText: "You have not submitted any reports." }}
          />
        </div>
      </div>

      <Modal
        open={isCreateModalOpen}
        onCancel={closeCreateModal}
        footer={null}
        width={560}
        centered
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FileWarning size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Create Incident Report</p>
              <p className="text-xs font-normal text-slate-500">
                Report a problem from your current parking session.
              </p>
            </div>
          </div>
        }
      >
        {activeSession?.vehiclePlate && (
          <div className="mb-5 mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
              Current vehicle
            </p>
            <p className="mt-1 font-bold text-blue-800">
              {activeSession.vehiclePlate}
            </p>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="incidentType"
            label="Problem type"
            rules={[{ required: true, message: "Select a problem type." }]}
          >
            <Select
              size="large"
              placeholder="Select incident type"
              options={INCIDENT_TYPE_OPTIONS}
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

          <div className="flex justify-end gap-3">
            <Button onClick={closeCreateModal}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating}
              icon={<FileWarning size={16} />}
            >
              Submit Report
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DriverIncidentReports;
