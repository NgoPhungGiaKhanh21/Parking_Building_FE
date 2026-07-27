import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Upload,
} from "antd";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  FileWarning,
  ImagePlus,
  ListFilter,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  SquareParking,
} from "lucide-react";
import dayjs from "dayjs";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getStaffBuildingRequest } from "../../../redux/staff/guest_parking/getStaffBuilding/getStaffBuildingSlice";
import {
  checkoutDriverAfterIncidentRequest,
  getAllDriverIncidentsRequest,
  getIncidentAvailableSlotsRequest,
  getIncidentLatestReservationRequest,
  getIncidentSessionEvidenceRequest,
  getIncidentsBySessionRequest,
  resetIncidentMutationStatus,
  resetIncidentEnhancement,
  updateIncidentStatusRequest,
  validateIncidentReassignRequest,
  verifyIncidentVehicleRequest,
} from "../../../redux/incident/incidentSlice";

const { TextArea } = Input;

const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const TYPE_LABELS = {
  DRIVER_LOST_TICKET: "Lost parking ticket",
  DRIVER_CANNOT_FIND_VEHICLE: "Cannot find vehicle",
  DRIVER_INCORRECT_FEE: "Incorrect parking fee",
  DRIVER_SLOT_OCCUPIED: "Assigned slot occupied",
  SLOT_CONFLICT: "Slot conflict",
  RESERVATION_NO_SHOW: "Reservation no-show",
  PAYMENT_EXCEPTION: "Payment exception",
  UNAUTHORIZED_PARKING: "Unauthorized parking",
  MAINTENANCE_CONFLICT: "Maintenance conflict",
};

const STATUS_COLORS = {
  OPEN: "red",
  IN_PROGRESS: "blue",
  PENDING: "gold",
  RESOLVED: "green",
  CLOSED: "default",
  CANCELLED: "default",
};

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "PENDING", label: "Pending" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const getAllowedStatusOptions = (currentStatus) => {
  const transitions = {
    OPEN: ["OPEN", "IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["IN_PROGRESS", "PENDING", "RESOLVED", "CANCELLED"],
    PENDING: ["PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
    RESOLVED: ["RESOLVED", "CLOSED"],
    CLOSED: ["CLOSED"],
    CANCELLED: ["CANCELLED"],
  };
  const allowed = transitions[currentStatus] || [currentStatus];
  return STATUS_OPTIONS.filter((option) => allowed.includes(option.value));
};

const ACTION_OPTIONS_BY_TYPE = {
  DRIVER_LOST_TICKET: [
    { value: "AUTHORIZE_CHECKOUT", label: "Authorize checkout" },
  ],
  DRIVER_CANNOT_FIND_VEHICLE: [
    {
      value: "PROVIDE_VEHICLE_LOCATION",
      label: "Provide vehicle location",
    },
  ],
  DRIVER_INCORRECT_FEE: [
    { value: "UPDATE_PAYMENT", label: "Update payment amount" },
    { value: "REJECT", label: "Reject report" },
  ],
  DRIVER_SLOT_OCCUPIED: [
    { value: "REASSIGN_SLOT", label: "Reassign slot" },
    { value: "NO_SLOT_AVAILABLE", label: "No slot available" },
  ],
};

const IncidentManagement = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [checkoutImageFile, setCheckoutImageFile] = useState(null);
  const { getStaffBuilding: staffBuilding, loading: loadingStaffBuilding } =
    useSelector((state) => state.getStaffBuilding);

  const {
    allReports,
    loadingAllReports,
    updating,
    checkingOut,
    updateSuccess,
    checkoutSuccess,
    error,
    loadingSessionEvidence,
    loadingEvidence,
    loadingAvailableSlots,
    loadingRelatedIncidents,
    verifyingVehicle,
    validatingReassign,
    sessionEvidence,
    latestReservation,
    availableSlots,
    relatedIncidents,
    vehicleVerification,
    reassignValidation,
    sessionEvidenceError,
    latestReservationError,
    enhancementError,
  } = useSelector((state) => state.incident);

  const selectedStatus = Form.useWatch("status", form);
  const selectedAction = Form.useWatch("resolutionAction", form);
  const selectedNewSlotId = Form.useWatch("newSlotId", form);

  const buildingOptions = useMemo(() => {
    const buildings = Array.isArray(staffBuilding)
      ? staffBuilding
      : staffBuilding
        ? [staffBuilding]
        : [];
    return buildings
      .map((building) => ({
        value: building.buildingId || building.id,
        label: building.buildingName || building.name || "Building",
      }))
      .filter((building) => building.value);
  }, [staffBuilding]);
  const resolvedBuildingId =
    selectedBuildingId || buildingOptions[0]?.value || null;

  useEffect(() => {
    dispatch(getStaffBuildingRequest());
    return () => {
      dispatch(resetIncidentEnhancement());
      dispatch(resetIncidentMutationStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (resolvedBuildingId) {
      dispatch(getAllDriverIncidentsRequest(resolvedBuildingId));
    }
  }, [dispatch, resolvedBuildingId]);

  useEffect(() => {
    if (!updateSuccess) return;
    const timer = setTimeout(() => {
      setSelectedIncident(null);
      form.resetFields();
      dispatch(resetIncidentEnhancement());
      dispatch(resetIncidentMutationStatus());
    }, 0);

    return () => clearTimeout(timer);
  }, [dispatch, form, updateSuccess]);

  useEffect(() => {
    if (!checkoutSuccess) return;
    dispatch(resetIncidentMutationStatus());
  }, [checkoutSuccess, dispatch]);

  const reports = useMemo(
    () => (Array.isArray(allReports) ? allReports : []),
    [allReports],
  );

  const typeOptions = useMemo(
    () =>
      [...new Set(reports.map((item) => item.incidentType))]
        .filter(Boolean)
        .filter((value) => value !== "DRIVER_CANNOT_FIND_VEHICLE")
        .map((value) => ({
          value,
          label: TYPE_LABELS[value] || value.replaceAll("_", " "),
        })),
    [reports],
  );

  const filteredReports = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return reports.filter((item) => {
      const searchable = [
        item.vehiclePlate,
        item.ticketCode,
        item.reporterId,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!keyword || searchable.includes(keyword)) &&
        (!statusFilter || item.status === statusFilter) &&
        (!typeFilter || item.incidentType === typeFilter)
      );
    });
  }, [reports, searchText, statusFilter, typeFilter]);

  const summary = useMemo(
    () => ({
      open: reports.filter((item) => item.status === "OPEN").length,
      processing: reports.filter((item) =>
        ["IN_PROGRESS", "PENDING"].includes(item.status),
      ).length,
      resolved: reports.filter((item) => item.status === "RESOLVED").length,
      closed: reports.filter((item) => item.status === "CLOSED").length,
    }),
    [reports],
  );

  const openIncident = (incident) => {
    dispatch(resetIncidentEnhancement());
    setCheckoutImageFile(null);
    setSelectedIncident(incident);
    form.setFieldsValue({
      status: incident.status || "OPEN",
      resolution: incident.resolution || "",
      resolutionAction: incident.resolutionAction || undefined,
      adjustedAmount: incident.adjustedAmount,
      newSlotId: incident.newSlotId,
      cancelReason: incident.cancelReason || "",
      plateNumber: "",
      ticketCode: "",
    });
    dispatch(getIncidentSessionEvidenceRequest(incident.incidentId));
    dispatch(getIncidentLatestReservationRequest(incident.incidentId));
    if (incident.sessionId) {
      dispatch(getIncidentsBySessionRequest(incident.sessionId));
    }
    if (incident.incidentType === "DRIVER_SLOT_OCCUPIED") {
      dispatch(getIncidentAvailableSlotsRequest(incident.incidentId));
    }
  };

  const closeIncident = () => {
    setCheckoutImageFile(null);
    setSelectedIncident(null);
    form.resetFields();
    dispatch(resetIncidentEnhancement());
    dispatch(resetIncidentMutationStatus());
  };

  const handleVerifyVehicle = async () => {
    const values = await form.validateFields(["plateNumber"]);
    dispatch(
      verifyIncidentVehicleRequest({
        incidentId: selectedIncident.incidentId,
        data: {
          plateNumber: values.plateNumber.trim(),
          ...(form.getFieldValue("ticketCode")?.trim()
            ? { ticketCode: form.getFieldValue("ticketCode").trim() }
            : {}),
        },
      }),
    );
  };

  const handleSlotChange = (newSlotId) => {
    form.setFieldValue("newSlotId", newSlotId);
    dispatch(
      validateIncidentReassignRequest({
        incidentId: selectedIncident.incidentId,
        newSlotId,
      }),
    );
  };

  const handleUpdate = (values) => {
    const data = {};
    if (values.resolution?.trim()) data.resolution = values.resolution.trim();
    if (values.resolutionAction) {
      data.resolutionAction = values.resolutionAction;
    }
    if (
      values.resolutionAction === "UPDATE_PAYMENT" &&
      values.adjustedAmount != null
    ) {
      data.adjustedAmount = Number(values.adjustedAmount);
    }
    if (values.resolutionAction === "REASSIGN_SLOT" && values.newSlotId) {
      data.newSlotId = values.newSlotId.trim();
    }
    if (values.status === "CANCELLED" && values.cancelReason?.trim()) {
      data.cancelReason = values.cancelReason.trim();
    }

    dispatch(
      updateIncidentStatusRequest({
        incidentId: selectedIncident.incidentId,
        status: values.status,
        data,
      }),
    );
  };

  const handleAuthorizedCheckout = () => {
    dispatch(
      checkoutDriverAfterIncidentRequest({
        sessionId: sessionEvidence?.sessionId || selectedIncident.sessionId,
        checkoutImage: checkoutImageFile,
      }),
    );
  };

  const columns = [
    {
      title: "Incident",
      key: "incident",
      width: "46%",
      render: (_, record) => (
        <div className="min-w-0 pr-2">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="m-0 font-semibold text-slate-800">
              {TYPE_LABELS[record.incidentType] || record.incidentType}
            </p>
            <Tag
              color={record.reportSource === "SYSTEM" ? "purple" : "cyan"}
              className="m-0"
            >
              {record.reportSource || "DRIVER"}
            </Tag>
          </div>
          <p className="m-0 truncate text-xs text-slate-500">
            {record.description || "No description"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">
            {record.vehiclePlate || "Unknown vehicle"}
            {record.reporterId ? ` · ${record.reporterId}` : ""}
          </p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "16%",
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
      width: "20%",
      sorter: (a, b) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
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
      width: "18%",
      align: "right",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<Eye size={14} />}
          onClick={() => openIncident(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  const actionOptions =
    ACTION_OPTIONS_BY_TYPE[selectedIncident?.incidentType] || [];
  const needsResolution = selectedStatus === "RESOLVED";
  const allowedStatusOptions = getAllowedStatusOptions(
    selectedIncident?.status,
  );
  const isTerminalIncident = ["CLOSED", "CANCELLED"].includes(
    selectedIncident?.status,
  );
  const verificationMatches =
    vehicleVerification?.verificationResult === "MATCH" ||
    selectedIncident?.verificationResult === "MATCH";
  const requiresVehicleVerification =
    selectedIncident?.incidentType === "DRIVER_LOST_TICKET" &&
    selectedStatus === "RESOLVED" &&
    selectedAction === "AUTHORIZE_CHECKOUT";
  const validatedSlotAvailable =
    reassignValidation?.isAvailable ?? reassignValidation?.available;
  const validatedSlotInSameBuilding =
    reassignValidation?.isInSameBuilding ?? reassignValidation?.inSameBuilding;
  const validatedSlotSameVehicleType = reassignValidation?.isSameVehicleType;
  const reassignIsValid =
    reassignValidation?.slotId === selectedNewSlotId &&
    validatedSlotAvailable === true &&
    validatedSlotInSameBuilding !== false &&
    validatedSlotSameVehicleType !== false;
  const requiresValidReassign =
    selectedStatus === "RESOLVED" && selectedAction === "REASSIGN_SLOT";
  const sessionEvidenceValid =
    Boolean(sessionEvidence) &&
    sessionEvidence?.sessionActive !== false &&
    sessionEvidence?.driverMatchesReporter !== false;
  const sessionFeeIsEstimated =
    sessionEvidence?.sessionPaymentStatus !== "PAID" &&
    sessionEvidence?.sessionTotalFee != null &&
    Number(sessionEvidence.sessionTotalFee) ===
      Number(sessionEvidence.sessionEstimatedFee);
  const canCheckout =
    selectedIncident?.status === "RESOLVED" &&
    selectedIncident?.resolutionAction === "AUTHORIZE_CHECKOUT" &&
    (selectedIncident?.incidentType !== "DRIVER_LOST_TICKET" ||
      verificationMatches) &&
    sessionEvidence?.sessionActive === true &&
    Boolean(checkoutImageFile);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-5 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
          <div className="h-1 bg-indigo-500" />
          <div className="p-5 md:p-6">
            <CommonBreadcrumb role="Staff" page="incidents" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Incident Management
                  </h1>
                  <p className="text-slate-500">
                    Review driver reports, record resolutions, and authorize
                    actions.
                  </p>
                </div>
              </div>
              <Button
                icon={<RefreshCw size={15} />}
                loading={loadingAllReports || loadingStaffBuilding}
                onClick={() =>
                  resolvedBuildingId &&
                  dispatch(getAllDriverIncidentsRequest(resolvedBuildingId))
                }
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Open",
              value: summary.open,
              icon: AlertTriangle,
              color: "text-red-600",
              background: "bg-red-50",
            },
            {
              label: "Processing",
              value: summary.processing,
              icon: Clock3,
              color: "text-blue-600",
              background: "bg-blue-50",
            },
            {
              label: "Resolved",
              value: summary.resolved,
              icon: CheckCircle2,
              color: "text-emerald-600",
              background: "bg-emerald-50",
            },
            {
              label: "Closed",
              value: summary.closed,
              icon: FileWarning,
              color: "text-slate-600",
              background: "bg-slate-100",
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
                  <item.icon size={22} />
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

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Driver incident queue
              </h2>
              <p className="text-sm text-slate-500">
                Review reports for the selected assigned building.
              </p>
            </div>
            <Tag color="blue">{filteredReports.length} shown</Tag>
          </div>
          <div className="m-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              <ListFilter size={14} />
              Filters
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Select
                className="w-full"
                value={resolvedBuildingId}
                onChange={setSelectedBuildingId}
                loading={loadingStaffBuilding}
                placeholder="Select assigned building"
                options={buildingOptions}
              />
              <Input
                className="w-full xl:col-span-2"
                allowClear
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                prefix={<Search size={15} className="text-slate-400" />}
                placeholder="Search plate, ticket, reporter..."
              />
              <Select
                className="w-full"
                allowClear
                value={statusFilter}
                onChange={(value) => setStatusFilter(value ?? null)}
                placeholder="Filter status"
                options={STATUS_OPTIONS}
              />
              <div className="flex gap-2">
                <Select
                  className="min-w-0 flex-1"
                  allowClear
                  value={typeFilter}
                  onChange={(value) => setTypeFilter(value ?? null)}
                  placeholder="Filter type"
                  options={typeOptions}
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
          </div>

          <div className="overflow-x-hidden px-4 pb-4">
            <Table
              rowKey={(record) => record.incidentId}
              columns={columns}
              dataSource={filteredReports}
              loading={loadingAllReports || loadingStaffBuilding}
              tableLayout="fixed"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `${total} reports`,
              }}
              rowClassName={(record) =>
                ["OPEN", "IN_PROGRESS", "PENDING"].includes(record.status)
                  ? "bg-indigo-50/20"
                  : ""
              }
              locale={{
                emptyText: resolvedBuildingId
                  ? "No driver reports found for this building."
                  : "No assigned building found.",
              }}
            />
          </div>
        </div>

        <Modal
          open={Boolean(selectedIncident)}
          onCancel={closeIncident}
          footer={null}
          width={920}
          centered
          classNames={{
            body: "max-h-[80vh] overflow-y-auto pr-2",
          }}
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ClipboardCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Review Incident</p>
                <p className="text-xs font-normal text-slate-500">
                  Verify evidence and record the appropriate resolution.
                </p>
              </div>
            </div>
          }
        >
          {selectedIncident && (
            <>
              <div className="mb-5 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-center text-xs font-semibold text-slate-500">
                <div className="border-r border-slate-200 bg-slate-50 px-2 py-3">
                  <span className="mr-1.5 text-indigo-600">1</span>
                  Read report
                </div>
                <div className="border-r border-slate-200 bg-indigo-50 px-2 py-3 text-indigo-700">
                  <span className="mr-1.5">2</span>
                  Verify evidence
                </div>
                <div className="bg-slate-50 px-2 py-3">
                  <span className="mr-1.5 text-indigo-600">3</span>
                  Resolve
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                  1
                </div>
                <p className="font-bold text-slate-800">Incident report</p>
              </div>
              <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Incident
                  </p>
                  <p className="font-semibold text-slate-800">
                    {TYPE_LABELS[selectedIncident.incidentType] ||
                      selectedIncident.incidentType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Vehicle
                  </p>
                  <p className="font-semibold text-slate-800">
                    {selectedIncident.vehiclePlate || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Reporter
                  </p>
                  <p className="text-slate-700">
                    {selectedIncident.reporterId || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Created
                  </p>
                  <p className="text-slate-700">
                    {selectedIncident.createdAt
                      ? dayjs(selectedIncident.createdAt).format(
                          "DD/MM/YYYY HH:mm",
                        )
                      : "—"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Driver description
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-slate-700">
                    {selectedIncident.description || "—"}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Reports in the same parking stay
                  </p>
                  {loadingRelatedIncidents ? (
                    <Spin size="small" />
                  ) : (
                    <Tag
                      color={relatedIncidents.length > 1 ? "orange" : "blue"}
                    >
                      {relatedIncidents.length} report
                      {relatedIncidents.length === 1 ? "" : "s"}
                    </Tag>
                  )}
                </div>
              </div>

              <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={17} className="text-indigo-600" />
                    <p className="font-bold text-slate-800">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                        2
                      </span>
                      Parking Session Evidence
                    </p>
                  </div>
                  {sessionEvidence && (
                    <div className="flex gap-2">
                      <Tag
                        color={sessionEvidence.sessionActive ? "green" : "red"}
                      >
                        {sessionEvidence.sessionStatus || "UNKNOWN"}
                      </Tag>
                      <Tag
                        color={
                          sessionEvidence.sessionPaymentStatus === "PAID"
                            ? "green"
                            : "gold"
                        }
                      >
                        {sessionEvidence.sessionPaymentStatus || "UNPAID"}
                      </Tag>
                    </div>
                  )}
                </div>

                {loadingSessionEvidence ? (
                  <div className="flex justify-center py-8">
                    <Spin />
                  </div>
                ) : sessionEvidenceError ? (
                  <Alert type="error" showIcon message={sessionEvidenceError} />
                ) : sessionEvidence ? (
                  <>
                    {sessionEvidence.sessionActive === false && (
                      <Alert
                        type="error"
                        showIcon
                        className="mb-3"
                        message="This parking session is no longer active."
                      />
                    )}
                    {sessionEvidence.driverMatchesReporter === false && (
                      <Alert
                        type="warning"
                        showIcon
                        className="mb-3"
                        message="The incident reporter does not match the session driver."
                      />
                    )}

                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Driver
                        </p>
                        <p className="font-semibold text-slate-700">
                          {sessionEvidence.driverFullName ||
                            sessionEvidence.driverEmail ||
                            "—"}
                        </p>
                        {sessionEvidence.driverEmail && (
                          <p className="text-xs text-slate-500">
                            {sessionEvidence.driverEmail}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Vehicle
                        </p>
                        <p className="font-semibold text-slate-700">
                          {sessionEvidence.vehiclePlate || "—"}
                          {sessionEvidence.vehicleType
                            ? ` · ${sessionEvidence.vehicleType}`
                            : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Current location
                        </p>
                        <p className="font-semibold text-slate-700">
                          {[
                            sessionEvidence.buildingName,
                            sessionEvidence.floorName,
                            sessionEvidence.zoneName,
                            sessionEvidence.slotName,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Check-in time
                        </p>
                        <p className="font-semibold text-slate-700">
                          {sessionEvidence.checkinTime
                            ? dayjs(sessionEvidence.checkinTime).format(
                                "DD/MM/YYYY HH:mm",
                              )
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Ticket code
                        </p>
                        <p className="font-mono text-sm font-semibold text-slate-700">
                          {sessionEvidence.ticketCode || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          {sessionFeeIsEstimated
                            ? "Estimated fee"
                            : "Total fee"}
                        </p>
                        <p className="font-semibold text-slate-700">
                          {formatCurrency(sessionEvidence.sessionTotalFee)}
                        </p>
                      </div>
                    </div>

                    {(sessionEvidence.checkinVehicleImage ||
                      sessionEvidence.checkoutVehicleImage) && (
                      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-indigo-100 pt-4 sm:grid-cols-2">
                        {sessionEvidence.checkinVehicleImage && (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">
                              Check-in vehicle image
                            </p>
                            <Image
                              width={180}
                              src={sessionEvidence.checkinVehicleImage}
                              alt="Check-in vehicle evidence"
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        {sessionEvidence.checkoutVehicleImage && (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">
                              Check-out vehicle image
                            </p>
                            <Image
                              width={180}
                              src={sessionEvidence.checkoutVehicleImage}
                              alt="Check-out vehicle evidence"
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              <details className="group mb-5 rounded-xl border border-blue-100 bg-blue-50/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <span className="flex items-center gap-2">
                    <SquareParking size={17} className="text-blue-600" />
                    <span className="font-bold text-slate-800">
                      Reservation Cross-check
                    </span>
                    <Tag>Optional</Tag>
                  </span>
                  <span className="text-xs font-semibold text-blue-600 group-open:hidden">
                    Show details
                  </span>
                  <span className="hidden text-xs font-semibold text-blue-600 group-open:inline">
                    Hide details
                  </span>
                </summary>

                <div className="border-t border-blue-100 p-4">
                  {loadingEvidence ? (
                    <div className="flex justify-center py-5">
                      <Spin size="small" />
                    </div>
                  ) : latestReservationError ? (
                    <Alert
                      type="info"
                      showIcon
                      message="No active reservation was found. Session evidence remains available for verification."
                      description={latestReservationError}
                    />
                  ) : latestReservation ? (
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Reservation
                        </p>
                        <p className="font-semibold text-slate-700">
                          {latestReservation.reservationCode || "—"} ·{" "}
                          {latestReservation.reservationStatus || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Driver
                        </p>
                        <p className="font-semibold text-slate-700">
                          {latestReservation.driverFullName ||
                            latestReservation.driverEmail ||
                            "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Vehicle
                        </p>
                        <p className="font-semibold text-slate-700">
                          {latestReservation.vehiclePlate || "—"}
                          {latestReservation.vehicleType
                            ? ` · ${latestReservation.vehicleType}`
                            : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Reserved location
                        </p>
                        <p className="font-semibold text-slate-700">
                          {[
                            latestReservation.buildingName,
                            latestReservation.floorName,
                            latestReservation.zoneName,
                            latestReservation.slotName,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Ticket code
                        </p>
                        <p className="font-mono text-sm font-semibold text-slate-700">
                          {latestReservation.ticketCode || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Total fee
                        </p>
                        <p className="font-semibold text-slate-700">
                          {formatCurrency(latestReservation.sessionTotalFee)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No supplemental reservation evidence was found.
                    </p>
                  )}
                </div>
              </details>

              {enhancementError && (
                <Alert
                  type="error"
                  showIcon
                  className="mb-5"
                  message={enhancementError}
                />
              )}

              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    Resolution and action
                  </p>
                  <p className="text-xs text-slate-500">
                    Update status, choose the business action, and record the
                    outcome.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                  {selectedIncident.incidentType === "DRIVER_LOST_TICKET" &&
                    ["IN_PROGRESS", "PENDING"].includes(
                      selectedIncident.status,
                    ) && (
                      <div className="mb-5 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                        <p className="mb-1 font-bold text-slate-800">
                          Verify Vehicle Ownership
                        </p>
                        <p className="mb-4 text-xs text-slate-500">
                          Cross-check the plate and optional ticket against the
                          parking session before authorizing checkout.
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Form.Item
                            name="plateNumber"
                            label="Verified plate number"
                            className="mb-3"
                            rules={[
                              {
                                required: true,
                                message: "Enter the plate number.",
                              },
                            ]}
                          >
                            <Input placeholder="Example: 30A-123456" />
                          </Form.Item>
                          <Form.Item
                            name="ticketCode"
                            label="Ticket code (optional)"
                            className="mb-3"
                          >
                            <Input placeholder="Example: TKT-789456" />
                          </Form.Item>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="primary"
                            ghost
                            className="min-w-40"
                            icon={<ShieldCheck size={15} />}
                            loading={verifyingVehicle}
                            disabled={!sessionEvidenceValid}
                            onClick={handleVerifyVehicle}
                          >
                            Verify Ownership
                          </Button>
                        </div>

                        {(vehicleVerification ||
                          selectedIncident.verificationResult) && (
                          <Alert
                            className="mt-3"
                            showIcon
                            type={verificationMatches ? "success" : "error"}
                            message={`Verification: ${
                              vehicleVerification?.verificationResult ||
                              selectedIncident.verificationResult
                            }`}
                            description={
                              vehicleVerification?.message ||
                              (verificationMatches
                                ? "Vehicle ownership was verified."
                                : "Vehicle ownership has not been verified.")
                            }
                          />
                        )}
                      </div>
                    )}

                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: "Select a status." }]}
                  >
                    <Select
                      options={allowedStatusOptions}
                      disabled={isTerminalIncident}
                    />
                  </Form.Item>

                  {selectedStatus === "CANCELLED" && (
                    <Form.Item
                      name="cancelReason"
                      label="Cancellation reason"
                      rules={[
                        {
                          required: true,
                          message: "Enter the cancellation reason.",
                        },
                        { min: 5, message: "Enter at least 5 characters." },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        maxLength={500}
                        showCount
                        placeholder="Explain why this incident is being cancelled..."
                      />
                    </Form.Item>
                  )}

                  {needsResolution && actionOptions.length > 0 && (
                    <Form.Item
                      name="resolutionAction"
                      label="Resolution action"
                      rules={[
                        {
                          required: true,
                          message: "Select a resolution action.",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select the business action"
                        options={actionOptions}
                      />
                    </Form.Item>
                  )}

                  {selectedAction === "UPDATE_PAYMENT" && (
                    <Form.Item
                      name="adjustedAmount"
                      label="Adjusted amount (VND)"
                      rules={[
                        {
                          required: true,
                          message: "Enter the adjusted amount.",
                        },
                      ]}
                    >
                      <InputNumber min={0} className="w-full" />
                    </Form.Item>
                  )}

                  {selectedAction === "REASSIGN_SLOT" && (
                    <>
                      <Form.Item
                        name="newSlotId"
                        label="Available slot on the current floor"
                        rules={[
                          {
                            required: true,
                            message: "Select a replacement slot.",
                          },
                        ]}
                        extra={
                          sessionEvidence?.floorName
                            ? `Only compatible slots on ${sessionEvidence.floorName} are returned by the API.`
                            : "The replacement must be compatible with the current session."
                        }
                      >
                        <Select
                          showSearch
                          loading={loadingAvailableSlots}
                          placeholder="Select an available replacement slot"
                          optionFilterProp="label"
                          onChange={handleSlotChange}
                          options={(Array.isArray(availableSlots)
                            ? availableSlots
                            : []
                          )
                            .filter(
                              (slot) =>
                                slot.available !== false &&
                                slot.inSameBuilding !== false &&
                                slot.hasActiveReservation !== true,
                            )
                            .map((slot) => ({
                              value: slot.slotId,
                              label: [
                                slot.slotName,
                                slot.zoneName,
                                slot.floorName,
                                slot.buildingName,
                              ]
                                .filter(Boolean)
                                .join(" · "),
                            }))}
                          notFoundContent={
                            loadingAvailableSlots ? (
                              <Spin size="small" />
                            ) : (
                              "No available slot in the reserved floor"
                            )
                          }
                        />
                      </Form.Item>

                      {validatingReassign && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                          <Spin size="small" />
                          Validating replacement slot...
                        </div>
                      )}

                      {reassignValidation && (
                        <Alert
                          className="mb-4"
                          showIcon
                          type={reassignIsValid ? "success" : "error"}
                          message={
                            reassignValidation.message ||
                            (reassignIsValid
                              ? "Slot is available for reassignment"
                              : "Slot cannot be reassigned")
                          }
                        />
                      )}
                    </>
                  )}

                  {(needsResolution || selectedStatus === "PENDING") && (
                    <Form.Item
                      name="resolution"
                      label={
                        needsResolution ? "Resolution note" : "Pending reason"
                      }
                      rules={[
                        { required: true, message: "Enter a resolution note." },
                        { min: 5, message: "Enter at least 5 characters." },
                      ]}
                    >
                      <TextArea
                        rows={4}
                        maxLength={500}
                        showCount
                        placeholder="Describe verification and action taken..."
                      />
                    </Form.Item>
                  )}

                  {selectedIncident.status === "RESOLVED" &&
                    selectedIncident.resolutionAction ===
                      "AUTHORIZE_CHECKOUT" && (
                      <div className="mb-4 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <ImagePlus size={17} className="text-cyan-600" />
                          <p className="font-bold text-slate-800">
                            Check-out vehicle image
                            <span className="ml-1 text-red-500">*</span>
                          </p>
                        </div>
                        <Upload
                          accept="image/*"
                          listType="picture"
                          maxCount={1}
                          fileList={
                            checkoutImageFile
                              ? [
                                  {
                                    uid: "checkout-image",
                                    name: checkoutImageFile.name,
                                    status: "done",
                                    originFileObj: checkoutImageFile,
                                  },
                                ]
                              : []
                          }
                          beforeUpload={(file) => {
                            if (!file.type.startsWith("image/")) {
                              message.error("Please select an image file.");
                              return Upload.LIST_IGNORE;
                            }
                            setCheckoutImageFile(file);
                            return false;
                          }}
                          onRemove={() => {
                            setCheckoutImageFile(null);
                          }}
                        >
                          {!checkoutImageFile && (
                            <Button icon={<ImagePlus size={15} />}>
                              Select check-out image
                            </Button>
                          )}
                        </Upload>
                        <p className="mt-2 text-xs text-slate-500">
                          A current vehicle image is required before completing
                          checkout.
                        </p>
                      </div>
                    )}

                  {requiresVehicleVerification && !verificationMatches && (
                    <Alert
                      type="warning"
                      showIcon
                      className="mb-4"
                      message="A MATCH vehicle verification is required before AUTHORIZE CHECKOUT."
                    />
                  )}

                  <div className="sticky bottom-0 z-10 -mx-1 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-1 pt-4">
                    <div>
                      {selectedIncident.status === "RESOLVED" &&
                        selectedIncident.resolutionAction ===
                          "AUTHORIZE_CHECKOUT" && (
                          <Button
                            type="primary"
                            ghost
                            className="min-w-36"
                            loading={checkingOut}
                            disabled={!canCheckout}
                            icon={<LogOut size={15} />}
                            onClick={handleAuthorizedCheckout}
                          >
                            Checkout Driver
                          </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                      <Button className="min-w-24" onClick={closeIncident}>
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="min-w-32"
                        loading={updating}
                        disabled={
                          isTerminalIncident ||
                          (requiresVehicleVerification &&
                            !verificationMatches) ||
                          (requiresValidReassign && !reassignIsValid) ||
                          validatingReassign
                        }
                      >
                        Save Incident
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default IncidentManagement;
