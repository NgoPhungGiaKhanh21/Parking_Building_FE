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
  CarFront,
  CheckCircle2,
  Clock3,
  FileWarning,
  ListChecks,
  MapPin,
  PlusCircle,
  RefreshCw,
  Search,
  Eye,
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
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
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

  const filteredReports = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return reports.filter((report) => {
      const searchable = [
        INCIDENT_TYPE_LABELS[report.incidentType],
        report.description,
        report.vehiclePlate,
        report.resolution,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!keyword || searchable.includes(keyword)) &&
        (!statusFilter || report.status === statusFilter) &&
        (!typeFilter || report.incidentType === typeFilter)
      );
    });
  }, [reports, searchText, statusFilter, typeFilter]);

  const summary = useMemo(
    () => ({
      total: reports.length,
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
      ellipsis: true,
      render: (_, record) => (
        <div className="min-w-0 break-words pr-2">
          <p className="m-0 font-semibold text-slate-800">
            {INCIDENT_TYPE_LABELS[record.incidentType] || record.incidentType}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {record.description || "—"}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-600">
            {record.vehiclePlate || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"} className="m-0">
          {String(status || "UNKNOWN").replaceAll("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      defaultSortOrder: "descend",
      render: (value) => (
        <span className="whitespace-nowrap text-sm text-slate-600">
          {value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      align: "right",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<Eye size={14} />}
          onClick={() => setSelectedReport(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full min-w-0 bg-slate-50 p-4 pb-8 md:p-8">
      <div className="mx-auto w-full min-w-0 max-w-screen-2xl">
      <div className="mb-5 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
        <div className="h-1 bg-amber-400" />
        <div className="p-5 md:p-6">
        <CommonBreadcrumb role="Driver" page="reports" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
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
      </div>

      <div
        className={`mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 ${
          activeSession
            ? "border-indigo-100 bg-indigo-50/60"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              activeSession
                ? "bg-indigo-100 text-indigo-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <CarFront size={21} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Current parking session
            </p>
            <p className="font-bold text-slate-800">
              {sessionLoading
                ? "Checking active session..."
                : activeSession?.vehiclePlate || "No active session"}
            </p>
          </div>
        </div>
        {activeSession && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} className="text-indigo-500" />
            <span>
              {[
                activeSession.buildingName,
                activeSession.floorName,
                activeSession.slotName,
              ]
                .filter(Boolean)
                .join(" · ") || "Parking location available in session details"}
            </span>
          </div>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "All reports",
            value: summary.total,
            icon: ListChecks,
            color: "text-slate-600",
            background: "bg-slate-100",
          },
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
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-black text-slate-800">
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
        <div className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                My report history
              </h2>
              <p className="text-sm text-slate-500">
                Track progress and review responses from parking staff.
              </p>
            </div>
            <Tag color="blue">{filteredReports.length} shown</Tag>
          </div>
          <div className="m-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              className="w-full xl:col-span-2"
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              prefix={<Search size={15} className="text-slate-400" />}
              placeholder="Search incident, vehicle, description..."
            />
            <Select
              className="w-full"
              allowClear
              value={statusFilter}
              onChange={(value) => setStatusFilter(value ?? null)}
              placeholder="Filter status"
              options={[
                { value: "OPEN", label: "Open" },
                { value: "IN_PROGRESS", label: "In progress" },
                { value: "PENDING", label: "Pending" },
                { value: "RESOLVED", label: "Resolved" },
                { value: "CLOSED", label: "Closed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
            <div className="flex gap-2">
              <Select
                className="min-w-0 flex-1"
                allowClear
                value={typeFilter}
                onChange={(value) => setTypeFilter(value ?? null)}
                placeholder="Filter type"
                options={INCIDENT_TYPE_OPTIONS}
              />
              <Button
                onClick={() => {
                  setSearchText("");
                  setStatusFilter(null);
                  setTypeFilter(null);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="w-full min-w-0 px-4 pb-4">
            <Table
              rowKey={(record) => record.incidentId}
              columns={columns}
              dataSource={filteredReports}
              loading={loadingMyReports}
              size="middle"
              pagination={{
                pageSize: 8,
                showTotal: (total) => `${total} reports`,
              }}
              rowClassName={(record) =>
                ["OPEN", "IN_PROGRESS", "PENDING"].includes(record.status)
                  ? "bg-amber-50/20"
                  : ""
              }
              locale={{
                emptyText:
                  reports.length > 0
                    ? "No reports match the selected filters."
                    : "You have not submitted any reports.",
              }}
            />
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(selectedReport)}
        onCancel={() => setSelectedReport(null)}
        footer={
          <Button onClick={() => setSelectedReport(null)}>Close</Button>
        }
        width={560}
        centered
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FileWarning size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Report Detail</p>
              <p className="text-xs font-normal text-slate-500">
                Full information about your incident report.
              </p>
            </div>
          </div>
        }
      >
        {selectedReport && (
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Problem type
              </p>
              <p className="font-semibold text-slate-800">
                {INCIDENT_TYPE_LABELS[selectedReport.incidentType] ||
                  selectedReport.incidentType}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Status
              </p>
              <Tag
                color={STATUS_COLORS[selectedReport.status] || "default"}
                className="mt-1"
              >
                {String(selectedReport.status || "UNKNOWN").replaceAll("_", " ")}
              </Tag>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Vehicle
              </p>
              <p className="font-semibold text-slate-800">
                {selectedReport.vehiclePlate || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Created
              </p>
              <p className="text-slate-700">
                {selectedReport.createdAt
                  ? dayjs(selectedReport.createdAt).format("DD/MM/YYYY HH:mm")
                  : "—"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Your description
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                {selectedReport.description || "—"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Staff resolution
              </p>
              {selectedReport.resolution ? (
                <div className="mt-1 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {selectedReport.resolution}
                  </p>
                  {selectedReport.resolutionAction && (
                    <Tag color="cyan" className="mt-2">
                      {selectedReport.resolutionAction.replaceAll("_", " ")}
                    </Tag>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-400">
                  Waiting for staff to respond.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isCreateModalOpen}
        onCancel={closeCreateModal}
        footer={null}
        width={620}
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
          <div className="mb-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-center gap-3">
              <CarFront size={20} className="text-indigo-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Reporting for current vehicle
                </p>
                <p className="font-bold text-indigo-900">
                  {activeSession.vehiclePlate}
                </p>
              </div>
            </div>
            <Tag color="blue">Active session</Tag>
          </div>
        )}

        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="Give staff enough detail to verify and resolve the problem quickly."
        />

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

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
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
    </div>
  );
};

export default DriverIncidentReports;
