# IncidentManagement.jsx — Giải thích code (comment kế bên)

> File gốc: `IncidentManagement.jsx` (cùng folder)  
> Mở 2 tab song song: **jsx bên trái — md bên phải**

---

## PHẦN 1 — Import (dòng 1–48)

```javascript
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Alert, Button, Form, Image, Input, InputNumber,
  message, Modal, Select, Spin, Table, Tag, Upload,
} from "antd";
// Upload + Image: dùng cho checkout image và xem ảnh evidence

import { ... } from "lucide-react";
import dayjs from "dayjs";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";

// API lấy building staff được gán — KHÔNG nằm incident slice
import { getStaffBuildingRequest } from "../../../redux/staff/guest_parking/getStaffBuilding/getStaffBuildingSlice";

// Tất cả action incident Staff cần
import {
  checkoutDriverAfterIncidentRequest,      // POST checkout + ảnh
  getAllDriverIncidentsRequest,            // GET list theo buildingId
  getIncidentAvailableSlotsRequest,        // GET slot trống (reassign)
  getIncidentLatestReservationRequest,     // GET reservation optional
  getIncidentSessionEvidenceRequest,       // GET evidence chính
  getIncidentsBySessionRequest,            // GET report cùng session
  resetIncidentMutationStatus,
  resetIncidentEnhancement,                // xóa evidence khi đóng modal
  updateIncidentStatusRequest,             // PUT cập nhật status + resolution
  validateIncidentReassignRequest,         // POST validate slot mới
  verifyIncidentVehicleRequest,            // POST verify biển số
} from "../../../redux/incident/incidentSlice";
```

---

## PHẦN 2 — Constants (dòng 52–122)

```javascript
const formatCurrency = (value) => {
  // Format VND cho phí session/reservation trong modal evidence
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value));
};

const TYPE_LABELS = {
  DRIVER_LOST_TICKET: "Lost parking ticket",
  DRIVER_CANNOT_FIND_VEHICLE: "Cannot find vehicle",
  DRIVER_INCORRECT_FEE: "Incorrect parking fee",
  DRIVER_SLOT_OCCUPIED: "Assigned slot occupied",
  // ... thêm loại system nếu backend trả
};

const STATUS_COLORS = { OPEN: "red", IN_PROGRESS: "blue", ... };

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  // ... dùng cho filter + form status
];

// === STATE MACHINE: status hiện tại → status được phép chọn ===
const getAllowedStatusOptions = (currentStatus) => {
  const transitions = {
    OPEN: ["OPEN", "IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["IN_PROGRESS", "PENDING", "RESOLVED", "CANCELLED"],
    PENDING: ["PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
    RESOLVED: ["RESOLVED", "CLOSED"],
    CLOSED: ["CLOSED"],       // terminal — không đổi nữa
    CANCELLED: ["CANCELLED"], // terminal
  };
  const allowed = transitions[currentStatus] || [currentStatus];
  return STATUS_OPTIONS.filter((option) => allowed.includes(option.value));
};

// === Action resolution theo loại incident ===
const ACTION_OPTIONS_BY_TYPE = {
  DRIVER_LOST_TICKET: [
    { value: "AUTHORIZE_CHECKOUT", label: "Authorize checkout" },
  ],
  DRIVER_CANNOT_FIND_VEHICLE: [
    { value: "PROVIDE_VEHICLE_LOCATION", label: "Provide vehicle location" },
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
// Khi staff chọn status = RESOLVED → form hiện dropdown action tương ứng
```

---

## PHẦN 3 — State local & Redux (dòng 124–210)

```javascript
const IncidentManagement = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();  // form trong modal Review

  // === STATE LOCAL (UI only) ===
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);  // building user chọn filter
  const [selectedIncident, setSelectedIncident] = useState(null);     // incident đang review trong modal
  const [checkoutImageFile, setCheckoutImageFile] = useState(null);    // File ảnh checkout (local, chưa upload)

  // === REDUX: building staff được gán ===
  const { getStaffBuilding: staffBuilding, loading: loadingStaffBuilding } =
    useSelector((state) => state.getStaffBuilding);

  // === REDUX: incident slice (nhiều field cho modal) ===
  const {
    allReports,              // bảng chính — GET /incidents/driver/all?buildingId=
    loadingAllReports,
    updating,                // nút Save Incident loading
    checkingOut,             // nút Checkout Driver loading
    updateSuccess,           // true → đóng modal sau save
    checkoutSuccess,
    error,

    // Evidence data (load khi openIncident)
    loadingSessionEvidence,
    loadingEvidence,         // latest reservation
    loadingAvailableSlots,
    loadingRelatedIncidents,
    verifyingVehicle,
    validatingReassign,
    sessionEvidence,         // ★ nguồn verify chính
    latestReservation,       // optional
    availableSlots,
    relatedIncidents,
    vehicleVerification,
    reassignValidation,
    sessionEvidenceError,
    latestReservationError,
    enhancementError,
  } = useSelector((state) => state.incident);

  // Theo dõi form realtime → show/hide field động
  const selectedStatus = Form.useWatch("status", form);
  const selectedAction = Form.useWatch("resolutionAction", form);
  const selectedNewSlotId = Form.useWatch("newSlotId", form);
```

---

## PHẦN 4 — Building scope (dòng 165–193)

```javascript
  const buildingOptions = useMemo(() => {
    const buildings = Array.isArray(staffBuilding)
      ? staffBuilding
      : staffBuilding ? [staffBuilding] : [];  // normalize object đơn → mảng
    return buildings.map((building) => ({
      value: building.buildingId || building.id,
      label: building.buildingName || building.name || "Building",
    })).filter((building) => building.value);
  }, [staffBuilding]);

  const resolvedBuildingId =
    selectedBuildingId || buildingOptions[0]?.value || null;
  // User chọn building HOẶC mặc định building đầu tiên được gán

  // === MOUNT ===
  useEffect(() => {
    dispatch(getStaffBuildingRequest());  // GET building staff được assign
    return () => {
      dispatch(resetIncidentEnhancement());
      dispatch(resetIncidentMutationStatus());
    };
  }, [dispatch]);

  // === LOAD LIST khi có buildingId ===
  useEffect(() => {
    if (resolvedBuildingId) {
      dispatch(getAllDriverIncidentsRequest(resolvedBuildingId));
      // Saga → GET /incidents/driver/all?buildingId=xxx
      // Slice lưu activeBuildingId để saga refresh sau update
    }
  }, [dispatch, resolvedBuildingId]);
```

**Luồng mount Staff:**
```
getStaffBuildingRequest → có buildingId
  → getAllDriverIncidentsRequest(buildingId) → allReports → bảng
```

---

## PHẦN 5 — Sau update / checkout success (dòng 195–210)

```javascript
  useEffect(() => {
    if (!updateSuccess) return;
    setSelectedIncident(null);           // đóng modal review
    form.resetFields();
    dispatch(resetIncidentEnhancement()); // xóa sessionEvidence, slots, ...
    dispatch(resetIncidentMutationStatus());
  }, [updateSuccess]);

  useEffect(() => {
    if (!checkoutSuccess) return;
    dispatch(resetIncidentMutationStatus());  // checkout xong — list đã refresh trong saga
  }, [checkoutSuccess]);
```

---

## PHẦN 6 — Filter & summary (dòng 212–259)

```javascript
  const reports = useMemo(
    () => (Array.isArray(allReports) ? allReports : []),
    [allReports]
  );

  const typeOptions = useMemo(() =>
    [...new Set(reports.map((item) => item.incidentType))]
      .filter(Boolean)
      .filter((value) => value !== "DRIVER_CANNOT_FIND_VEHICLE")  // ẩn loại này khỏi filter
      .map((value) => ({ value, label: TYPE_LABELS[value] || value })),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return reports.filter((item) => {
      const searchable = [item.vehiclePlate, item.ticketCode, item.reporterId, item.description]
        .filter(Boolean).join(" ").toLowerCase();
      return (
        (!keyword || searchable.includes(keyword)) &&
        (!statusFilter || item.status === statusFilter) &&
        (!typeFilter || item.incidentType === typeFilter)
      );
    });
  }, [reports, searchText, statusFilter, typeFilter]);
  // ↑ Filter chỉ FE — không gọi API

  const summary = useMemo(() => ({
    open: reports.filter((item) => item.status === "OPEN").length,
    processing: reports.filter((item) => ["IN_PROGRESS", "PENDING"].includes(item.status)).length,
    resolved: reports.filter((item) => item.status === "RESOLVED").length,
    closed: reports.filter((item) => item.status === "CLOSED").length,
  }), [reports]);
```

---

## PHẦN 7 — openIncident ★ (dòng 261–283)

```javascript
  const openIncident = (incident) => {
    dispatch(resetIncidentEnhancement());  // xóa evidence cũ trước khi load mới
    setCheckoutImageFile(null);
    setSelectedIncident(incident);           // mở modal Review

    // Điền form với data incident hiện có (nếu đã xử lý một phần trước đó)
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

    // === GỌI SONG SONG CÁC API EVIDENCE ===
    dispatch(getIncidentSessionEvidenceRequest(incident.incidentId));
    // → GET /incidents/{id}/session-evidence ★ NGUỒN CHÍNH

    dispatch(getIncidentLatestReservationRequest(incident.incidentId));
    // → GET /incidents/{id}/latest-reservation (optional, không block)

    if (incident.sessionId) {
      dispatch(getIncidentsBySessionRequest(incident.sessionId));
      // → GET /incidents/by-session/{sessionId} — đếm report cùng lần đỗ
    }

    if (incident.incidentType === "DRIVER_SLOT_OCCUPIED") {
      dispatch(getIncidentAvailableSlotsRequest(incident.incidentId));
      // → GET .../available-slots-for-reassign — chỉ load khi cần đổi slot
    }
  };
```

**Bấm Detail trên bảng → gọi `openIncident(record)`**

---

## PHẦN 8 — Handlers (dòng 285–353)

```javascript
  const closeIncident = () => {
    setCheckoutImageFile(null);
    setSelectedIncident(null);
    form.resetFields();
    dispatch(resetIncidentEnhancement());
    dispatch(resetIncidentMutationStatus());
  };

  // === LOST TICKET: verify biển số ===
  const handleVerifyVehicle = async () => {
    const values = await form.validateFields(["plateNumber"]);  // validate trước
    dispatch(verifyIncidentVehicleRequest({
      incidentId: selectedIncident.incidentId,
      data: {
        plateNumber: values.plateNumber.trim(),
        ...(form.getFieldValue("ticketCode")?.trim()
          ? { ticketCode: form.getFieldValue("ticketCode").trim() }
          : {}),
      },
    }));
    // → POST /incidents/{id}/verify-vehicle
    // Kết quả → vehicleVerification.verificationResult === "MATCH"
  };

  // === SLOT OCCUPIED: validate slot mới ===
  const handleSlotChange = (newSlotId) => {
    form.setFieldValue("newSlotId", newSlotId);
    dispatch(validateIncidentReassignRequest({
      incidentId: selectedIncident.incidentId,
      newSlotId,
    }));
    // → POST /incidents/validate-reassign?incidentId=&newSlotId=
  };

  // === SAVE INCIDENT CHÍNH ===
  const handleUpdate = (values) => {
    const data = {};
    if (values.resolution?.trim()) data.resolution = values.resolution.trim();
    if (values.resolutionAction) data.resolutionAction = values.resolutionAction;

    if (values.resolutionAction === "UPDATE_PAYMENT" && values.adjustedAmount != null) {
      data.adjustedAmount = Number(values.adjustedAmount);
    }
    if (values.resolutionAction === "REASSIGN_SLOT" && values.newSlotId) {
      data.newSlotId = values.newSlotId.trim();
    }
    if (values.status === "CANCELLED" && values.cancelReason?.trim()) {
      data.cancelReason = values.cancelReason.trim();
    }

    dispatch(updateIncidentStatusRequest({
      incidentId: selectedIncident.incidentId,
      status: values.status,
      data,
    }));
    // → PUT /incidents/{id}/status?status=RESOLVED body: data
    // Saga success → refresh allReports + updateSuccess → đóng modal
  };

  // === CHECKOUT (bước riêng, sau khi incident đã RESOLVED) ===
  const handleAuthorizedCheckout = () => {
    dispatch(checkoutDriverAfterIncidentRequest({
      sessionId: sessionEvidence?.sessionId || selectedIncident.sessionId,
      checkoutImage: checkoutImageFile,  // File → FormData trong API
    }));
    // → POST /sessions/driver/checkout (multipart)
  };
```

---

## PHẦN 9 — Derived flags (dòng 427–470)

```javascript
  const actionOptions = ACTION_OPTIONS_BY_TYPE[selectedIncident?.incidentType] || [];
  const needsResolution = selectedStatus === "RESOLVED";  // RESOLVED → bắt buộc action + note
  const allowedStatusOptions = getAllowedStatusOptions(selectedIncident?.status);
  const isTerminalIncident = ["CLOSED", "CANCELLED"].includes(selectedIncident?.status);

  // Verify plate đã MATCH chưa (từ API hoặc đã lưu trên incident)
  const verificationMatches =
    vehicleVerification?.verificationResult === "MATCH" ||
    selectedIncident?.verificationResult === "MATCH";

  // Lost ticket + RESOLVED + AUTHORIZE_CHECKOUT → phải verify trước khi Save
  const requiresVehicleVerification =
    selectedIncident?.incidentType === "DRIVER_LOST_TICKET" &&
    selectedStatus === "RESOLVED" &&
    selectedAction === "AUTHORIZE_CHECKOUT";

  // Reassign slot hợp lệ chưa
  const reassignIsValid =
    reassignValidation?.slotId === selectedNewSlotId &&
    (reassignValidation?.isAvailable ?? reassignValidation?.available) === true &&
    (reassignValidation?.isInSameBuilding ?? reassignValidation?.inSameBuilding) !== false &&
    reassignValidation?.isSameVehicleType !== false;

  const requiresValidReassign =
    selectedStatus === "RESOLVED" && selectedAction === "REASSIGN_SLOT";

  // Session evidence còn dùng được không
  const sessionEvidenceValid =
    Boolean(sessionEvidence) &&
    sessionEvidence?.sessionActive !== false &&
    sessionEvidence?.driverMatchesReporter !== false;

  // Phí đang là ước tính hay đã chốt
  const sessionFeeIsEstimated =
    sessionEvidence?.sessionPaymentStatus !== "PAID" &&
    sessionEvidence?.sessionTotalFee != null &&
    Number(sessionEvidence.sessionTotalFee) === Number(sessionEvidence.sessionEstimatedFee);

  // Đủ điều kiện bấm Checkout Driver chưa
  const canCheckout =
    selectedIncident?.status === "RESOLVED" &&
    selectedIncident?.resolutionAction === "AUTHORIZE_CHECKOUT" &&
    (selectedIncident?.incidentType !== "DRIVER_LOST_TICKET" || verificationMatches) &&
    sessionEvidence?.sessionActive === true &&
    Boolean(checkoutImageFile);  // ★ bắt buộc có ảnh checkout
```

---

## PHẦN 10 — Bảng & filter UI (dòng 472–657)

```javascript
  return (
    <>
      <CommonBreadcrumb role="Staff" page="incidents" />

      <Button
        loading={loadingAllReports || loadingStaffBuilding}
        onClick={() =>
          resolvedBuildingId &&
          dispatch(getAllDriverIncidentsRequest(resolvedBuildingId))
        }
      >
        Refresh
      </Button>

      {/* 4 summary cards: Open / Processing / Resolved / Closed */}

      <Select
        value={resolvedBuildingId}
        onChange={setSelectedBuildingId}  // đổi building → useEffect load list mới
        options={buildingOptions}
      />

      <Table
        rowKey={(record) => record.incidentId}
        dataSource={filteredReports}
        loading={loadingAllReports || loadingStaffBuilding}
        tableLayout="fixed"  // tránh scroll ngang
        columns={[
          {
            title: "Incident",
            render: (_, record) => (
              // Loại + tag DRIVER/SYSTEM + mô tả + biển số
            ),
          },
          { title: "Status", render: (status) => <Tag>...</Tag> },
          { title: "Created", sorter: ..., defaultSortOrder: "descend" },
          {
            title: "Action",
            render: (_, record) => (
              <Button onClick={() => openIncident(record)}>Detail</Button>
              // ↑ Mở modal Review + gọi API evidence
            ),
          },
        ]}
      />
    </>
  );
```

---

## PHẦN 11 — Modal Review: Bước 1 (dòng 659–766)

```javascript
      <Modal open={Boolean(selectedIncident)} onCancel={closeIncident} width={920}>

        {/* Thanh 3 bước: Read report → Verify evidence → Resolve */}
        <div>1 Read report | 2 Verify evidence | 3 Resolve</div>

        {/* === BƯỚC 1: đọc report từ selectedIncident (data bảng) === */}
        <p>{TYPE_LABELS[selectedIncident.incidentType]}</p>
        <p>{selectedIncident.vehiclePlate}</p>
        <p>{selectedIncident.reporterId}</p>
        <p>{dayjs(selectedIncident.createdAt).format(...)}</p>
        <p>{selectedIncident.description}</p>

        {/* Tag số report cùng session — từ relatedIncidents API */}
        {loadingRelatedIncidents ? <Spin /> : (
          <Tag>{relatedIncidents.length} reports</Tag>
        )}
```

---

## PHẦN 12 — Modal Review: Bước 2 Session Evidence (dòng 768–931)

```javascript
        {/* === BƯỚC 2A: Session Evidence — NGUỒN CHÍNH === */}
        {loadingSessionEvidence ? <Spin /> :
         sessionEvidenceError ? <Alert type="error" /> :
         sessionEvidence ? (
           <>
             {/* Cảnh báo nếu session không còn active */}
             {sessionEvidence.sessionActive === false && (
               <Alert message="This parking session is no longer active." />
             )}

             {/* Cảnh báo nếu người report ≠ driver session */}
             {sessionEvidence.driverMatchesReporter === false && (
               <Alert message="The incident reporter does not match the session driver." />
             )}

             {/* Hiển thị: driver, vehicle, location, checkin, ticket, fee */}
             <p>{sessionEvidence.driverFullName}</p>
             <p>{sessionEvidence.vehiclePlate}</p>
             <p>{[buildingName, floorName, zoneName, slotName].join(" · ")}</p>
             <p>{sessionEvidence.ticketCode}</p>
             <p>{formatCurrency(sessionEvidence.sessionTotalFee)}</p>

             {/* Ảnh check-in / check-out nếu API trả về URL */}
             {sessionEvidence.checkinVehicleImage && <Image src={...} />}
             {sessionEvidence.checkoutVehicleImage && <Image src={...} />}
           </>
         ) : null}
```

---

## PHẦN 13 — Modal Review: Bước 2B Reservation (dòng 933–1032)

```javascript
        {/* === BƯỚC 2B: Reservation — OPTIONAL, collapsible === */}
        <details>  {/* user bấm mới mở */}
          <summary>Reservation Cross-check <Tag>Optional</Tag></summary>

          {loadingEvidence ? <Spin /> :
           latestReservationError ? (
             <Alert type="info"
               message="No active reservation... Session evidence remains available."
             />
             // Lỗi reservation KHÔNG chặn xử lý chính
           ) :
           latestReservation ? (
             // Hiển thị: reservationCode, driver, vehicle, location, ticket, fee
           ) : (
             <p>No supplemental reservation evidence was found.</p>
           )}
        </details>

        {enhancementError && <Alert type="error" message={enhancementError} />}
        // Lỗi verify / reassign / related incidents
```

---

## PHẦN 14 — Modal Review: Bước 3 Form (dòng 1043–1391)

```javascript
        {/* === BƯỚC 3: Form resolution === */}
        <Form form={form} onFinish={handleUpdate}>

          {/* --- LOST TICKET: panel verify vehicle --- */}
          {selectedIncident.incidentType === "DRIVER_LOST_TICKET" &&
           ["IN_PROGRESS", "PENDING"].includes(selectedIncident.status) && (
            <>
              <Form.Item name="plateNumber" rules={[{ required: true }]}>
                <Input placeholder="30A-123456" />
              </Form.Item>
              <Form.Item name="ticketCode">
                <Input placeholder="TKT-789456" />  {/* optional */}
              </Form.Item>
              <Button
                loading={verifyingVehicle}
                disabled={!sessionEvidenceValid}  // session phải valid mới verify
                onClick={handleVerifyVehicle}
              >
                Verify Ownership
              </Button>
              {/* Alert success/error theo verificationMatches */}
            </>
          )}

          {/* --- Status dropdown --- */}
          <Form.Item name="status">
            <Select
              options={allowedStatusOptions}      // theo state machine
              disabled={isTerminalIncident}       // CLOSED/CANCELLED không sửa
            />
          </Form.Item>

          {/* --- Cancel reason (khi chọn CANCELLED) --- */}
          {selectedStatus === "CANCELLED" && (
            <Form.Item name="cancelReason" rules={[{ required: true }, { min: 5 }]}>
              <TextArea />
            </Form.Item>
          )}

          {/* --- Resolution action (khi status = RESOLVED) --- */}
          {needsResolution && actionOptions.length > 0 && (
            <Form.Item name="resolutionAction" rules={[{ required: true }]}>
              <Select options={actionOptions} />  {/* theo ACTION_OPTIONS_BY_TYPE */}
            </Form.Item>
          )}

          {/* --- Field động: UPDATE_PAYMENT --- */}
          {selectedAction === "UPDATE_PAYMENT" && (
            <Form.Item name="adjustedAmount" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
          )}

          {/* --- Field động: REASSIGN_SLOT --- */}
          {selectedAction === "REASSIGN_SLOT" && (
            <>
              <Form.Item name="newSlotId">
                <Select
                  loading={loadingAvailableSlots}
                  onChange={handleSlotChange}  // mỗi lần chọn → validate API
                  options={availableSlots
                    .filter(slot => slot.available !== false && ...)
                    .map(slot => ({ value: slot.slotId, label: "..." }))}
                />
              </Form.Item>
              {validatingReassign && <Spin />}
              {reassignValidation && <Alert type={reassignIsValid ? "success" : "error"} />}
            </>
          )}

          {/* --- Resolution note (RESOLVED hoặc PENDING) --- */}
          {(needsResolution || selectedStatus === "PENDING") && (
            <Form.Item name="resolution" rules={[{ required: true }, { min: 5 }]}>
              <TextArea placeholder="Describe verification and action taken..." />
            </Form.Item>
          )}

          {/* --- Upload ảnh checkout (sau incident đã RESOLVED + AUTHORIZE_CHECKOUT) --- */}
          {selectedIncident.status === "RESOLVED" &&
           selectedIncident.resolutionAction === "AUTHORIZE_CHECKOUT" && (
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={(file) => {
                if (!file.type.startsWith("image/")) {
                  message.error("Please select an image file.");
                  return Upload.LIST_IGNORE;
                }
                setCheckoutImageFile(file);  // lưu File local
                return false;                // chặn antd auto upload
              }}
              onRemove={() => setCheckoutImageFile(null)}
            />
          )}

          {requiresVehicleVerification && !verificationMatches && (
            <Alert message="A MATCH vehicle verification is required before AUTHORIZE CHECKOUT." />
          )}

          {/* --- Footer buttons --- */}
          <Button
            loading={checkingOut}
            disabled={!canCheckout}
            onClick={handleAuthorizedCheckout}
          >
            Checkout Driver
          </Button>
          {/* Chỉ hiện khi incident đã RESOLVED + AUTHORIZE_CHECKOUT */}

          <Button onClick={closeIncident}>Cancel</Button>

          <Button
            htmlType="submit"
            loading={updating}
            disabled={
              isTerminalIncident ||
              (requiresVehicleVerification && !verificationMatches) ||
              (requiresValidReassign && !reassignIsValid) ||
              validatingReassign
            }
          >
            Save Incident
          </Button>
        </Form>
```

---

## Tóm tắt luồng Staff

| Bước | Hàm / UI | API |
|------|----------|-----|
| Mount | `getStaffBuildingRequest` | Staff building API |
| Load bảng | `getAllDriverIncidentsRequest(buildingId)` | GET `/incidents/driver/all` |
| Bấm Detail | `openIncident` | session-evidence + reservation + related + slots |
| Verify xe | `handleVerifyVehicle` | POST verify-vehicle |
| Chọn slot | `handleSlotChange` | POST validate-reassign |
| Save | `handleUpdate` → `updateIncidentStatusRequest` | PUT status |
| Checkout | `handleAuthorizedCheckout` | POST checkout FormData |

---

## Modal 3 bước — nhớ nhanh

```
Bước 1 → selectedIncident (data bảng, không API thêm)
Bước 2 → sessionEvidence (API chính) + latestReservation (optional)
Bước 3 → Form status/action/resolution + checkout image + Save/Checkout
```

---

*Đọc kèm: `../../Driver/IncidentReports/DriverIncidentReports.md` (Driver tạo report)*  
*Redux/API chi tiết: `../../../docs/incident/INCIDENT_CODE_GUIDE.md`*
