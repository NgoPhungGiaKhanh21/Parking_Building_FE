# Incident Module — Giải thích full code (Driver + Staff)

> **Mục đích file này:** Giải thích toàn bộ luồng incident với comment kế bên từng đoạn code quan trọng.  
> **Không sửa code gốc** — chỉ đọc file này kèm theo source.

---

## Mục lục

1. [Cấu trúc file](#1-cấu-trúc-file)
2. [API layer — incidentApi.js](#2-api-layer--incidentapijs)
3. [Redux Slice — incidentSlice.js](#3-redux-slice--incidentslicejs)
4. [Redux Saga — incidentSaga.js](#4-redux-saga--incidentsagajs)
5. [Driver — DriverIncidentReports.jsx](#5-driver--driverincidentreportsjsx)
6. [Staff — IncidentManagement.jsx](#6-staff--incidentmanagementjsx)
7. [Luồng end-to-end](#7-luồng-end-to-end)
8. [Bảng tra cứu nhanh](#8-bảng-tra-cứu-nhanh)

---

## 1. Cấu trúc file

```
src/
├── service/incidentApi.js                          # HTTP endpoints
├── redux/incident/
│   ├── incidentSlice.js                            # State + actions
│   └── incidentSaga.js                             # Gọi API async
├── page/Driver/IncidentReports/
│   └── DriverIncidentReports.jsx                   # Role Driver
└── page/Staff/incidentManagement/
    └── IncidentManagement.jsx                      # Role Staff
```

**Pattern chung (giống Price Manager, Staff Management):**

```
Component dispatch(xxxRequest)
  → Slice: loading = true
  → Saga: call API
  → Saga: dispatch(xxxSuccess / xxxFail)
  → Slice: lưu data
  → Component useSelector → re-render
```

**Đăng ký Redux:**

- Slice: `rootReduce.js` → key `incident`
- Saga: `rootSaga.js` → `watchIncident()`

---

## 2. API layer — incidentApi.js

File: `src/service/incidentApi.js`

Mọi request đi qua `api.js` → tự gắn `Authorization: Bearer {token}`.

```javascript
import api from "./api";

// DRIVER: Tạo báo cáo mới (gắn với sessionId đang đỗ)
export const createDriverIncidentApi = (data) =>
  api.post("/incidents/driver", data);
// body: { sessionId, incidentType, description }

// DRIVER: Lấy danh sách báo cáo của chính mình
export const getMyDriverIncidentsApi = () =>
  api.get("/incidents/driver/me");

// STAFF: Lấy tất cả báo cáo driver theo building được gán
export const getAllDriverIncidentsApi = (buildingId) =>
  api.get("/incidents/driver/all", {
    params: buildingId ? { buildingId } : {},  // bắt buộc có buildingId
  });

// STAFF: Các incident cùng 1 parking session
export const getIncidentsBySessionApi = (sessionId) =>
  api.get(`/incidents/by-session/${encodeURIComponent(sessionId)}`);

// STAFF: Xác minh biển số / vé (lost ticket flow)
export const verifyIncidentVehicleApi = ({ incidentId, data }) =>
  api.post(`/incidents/${encodeURIComponent(incidentId)}/verify-vehicle`, data);
// body: { plateNumber, ticketCode? }

// STAFF: Kiểm tra slot mới có hợp lệ để reassign không
export const validateIncidentReassignApi = ({ incidentId, newSlotId }) =>
  api.post("/incidents/validate-reassign", null, {
    params: { incidentId, newSlotId },
  });

// STAFF: Reservation bổ sung (optional, không chặn xử lý chính)
export const getIncidentLatestReservationApi = (incidentId) =>
  api.get(`/incidents/${encodeURIComponent(incidentId)}/latest-reservation`);

// STAFF: Bằng chứng chính — thông tin session đỗ xe
export const getIncidentSessionEvidenceApi = (incidentId) =>
  api.get(`/incidents/${encodeURIComponent(incidentId)}/session-evidence`);

// STAFF: Danh sách slot trống để đổi chỗ (slot occupied flow)
export const getIncidentAvailableSlotsApi = (incidentId) =>
  api.get(`/incidents/${encodeURIComponent(incidentId)}/available-slots-for-reassign`);

// STAFF: Cập nhật trạng thái + resolution
export const updateIncidentStatusApi = ({ incidentId, status, data = {} }) =>
  api.put(`/incidents/${encodeURIComponent(incidentId)}/status`, data, {
    params: { status },  // status truyền qua query param
  });

// STAFF: Checkout driver sau khi đã RESOLVED + AUTHORIZE_CHECKOUT
export const checkoutDriverAfterIncidentApi = ({ sessionId, ticketCode, checkoutImage }) => {
  const formData = new FormData();
  if (sessionId) formData.append("sessionId", sessionId);
  if (ticketCode) formData.append("ticketCode", ticketCode);
  if (checkoutImage) formData.append("checkoutImage", checkoutImage);
  // FormData → api.js tự bỏ Content-Type để browser set multipart boundary
  return api.post("/sessions/driver/checkout", formData);
};
```

---

## 3. Redux Slice — incidentSlice.js

File: `src/redux/incident/incidentSlice.js`

**1 slice duy nhất** phục vụ cả Driver và Staff.

### 3.1. Initial state

```javascript
const initialState = {
  // --- LIST DATA ---
  myReports: [],              // Driver: GET /incidents/driver/me
  allReports: [],             // Staff: GET /incidents/driver/all
  activeBuildingId: null,     // Staff: buildingId đang filter (dùng refresh sau update)

  // --- LOADING FLAGS ---
  loadingMyReports: false,
  loadingAllReports: false,
  creating: false,            // Driver đang tạo report
  updating: false,            // Staff đang save incident
  checkingOut: false,         // Staff đang checkout
  loadingSessionEvidence: false,
  loadingEvidence: false,     // latest reservation
  loadingAvailableSlots: false,
  loadingRelatedIncidents: false,
  verifyingVehicle: false,
  validatingReassign: false,

  // --- EVIDENCE / ENHANCEMENT DATA (Staff modal) ---
  sessionEvidence: null,      // Nguồn chính verify
  latestReservation: null,    // Optional cross-check
  availableSlots: [],         // Dropdown reassign slot
  relatedIncidents: [],       // Report cùng session
  vehicleVerification: null,  // Kết quả verify plate
  reassignValidation: null,   // Kết quả validate slot mới

  // --- ERRORS ---
  sessionEvidenceError: null,
  latestReservationError: null,
  enhancementError: null,     // Lỗi verify / reassign / related
  error: null,                // Lỗi chung (create, list, update, checkout)

  // --- MUTATION SUCCESS FLAGS ---
  createSuccess: false,
  updateSuccess: false,
  checkoutSuccess: false,
};
```

### 3.2. Reducer pattern (ví dụ get list Driver)

```javascript
getMyDriverIncidentsRequest: (state) => {
  state.loadingMyReports = true;  // bật spinner bảng Driver
  state.error = null;
},
getMyDriverIncidentsSuccess: (state, action) => {
  state.loadingMyReports = false;
  state.myReports = action.payload;  // mảng report từ saga
},
getMyDriverIncidentsFail: (state, action) => {
  state.loadingMyReports = false;
  state.error = action.payload;
},
```

### 3.3. Staff list — lưu luôn buildingId

```javascript
getAllDriverIncidentsRequest: (state, action) => {
  state.loadingAllReports = true;
  state.activeBuildingId = action.payload || null;  // saga dùng lại khi refresh
  state.error = null;
},
```

### 3.4. Reset helpers

```javascript
// Đóng modal Staff → xóa evidence tạm
resetIncidentEnhancement: (state) => {
  state.sessionEvidence = null;
  state.latestReservation = null;
  state.availableSlots = [];
  // ... clear hết evidence + loading flags
},

// Sau create/update/checkout → xóa success flag
resetIncidentMutationStatus: (state) => {
  state.createSuccess = false;
  state.updateSuccess = false;
  state.checkoutSuccess = false;
  state.error = null;
},
```

---

## 4. Redux Saga — incidentSaga.js

File: `src/redux/incident/incidentSaga.js`

### 4.1. Helper parse response

```javascript
const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const getResponseList = (response) => {
  const data = getResponseData(response);
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.items ?? [];  // hỗ trợ pagination format
};
```

### 4.2. Driver — tạo report

```javascript
function* handleCreateDriverIncident(action) {
  try {
    yield call(createDriverIncidentApi, action.payload);
    // payload: { sessionId, incidentType, description }

    yield put(createDriverIncidentSuccess());
    yield put(getMyDriverIncidentsRequest());  // tự refresh list Driver
    toast.success("Report submitted successfully");
  } catch (error) {
    yield put(createDriverIncidentFail(message));
    toast.error(message);
  }
}
```

### 4.3. Staff — update incident

```javascript
function* handleUpdateIncidentStatus(action) {
  try {
    yield call(updateIncidentStatusApi, action.payload);
    // payload: { incidentId, status, data: { resolution, resolutionAction, ... } }

    yield put(updateIncidentStatusSuccess());

    const buildingId = yield select((state) => state.incident.activeBuildingId);
    yield put(getAllDriverIncidentsRequest(buildingId));  // refresh list Staff

    toast.success("Incident updated successfully");
  } catch (error) { /* ... */ }
}
```

### 4.4. Staff — checkout

```javascript
function* handleCheckoutDriverAfterIncident(action) {
  try {
    yield call(checkoutDriverAfterIncidentApi, action.payload);
    // payload: { sessionId, checkoutImage }

    yield put(checkoutDriverAfterIncidentSuccess());
    yield put(getAllDriverIncidentsRequest(buildingId));  // refresh list
    toast.success("Driver checked out successfully");
  } catch (error) { /* ... */ }
}
```

### 4.5. Evidence APIs — không toast (trừ lỗi nặng)

```javascript
// Session evidence — nguồn chính, lỗi hiện trong modal
function* handleGetIncidentSessionEvidence(action) {
  const response = yield call(getIncidentSessionEvidenceApi, action.payload);
  yield put(getIncidentSessionEvidenceSuccess(getResponseData(response)));
}

// Latest reservation — optional, lỗi chỉ hiện info panel
function* handleGetIncidentLatestReservation(action) { /* tương tự */ }

// Verify vehicle — có toast success/error
function* handleVerifyIncidentVehicle(action) {
  const result = getResponseData(response);
  yield put(verifyIncidentVehicleSuccess(result));
  toast.success(result?.message || "Vehicle verification completed");
}
```

### 4.6. Đăng ký watcher (rootSaga gọi watchIncident)

```javascript
export function* watchIncident() {
  yield takeLatest(getMyDriverIncidentsRequest.type, handleGetMyDriverIncidents);
  yield takeLatest(getAllDriverIncidentsRequest.type, handleGetAllDriverIncidents);
  yield takeLatest(createDriverIncidentRequest.type, handleCreateDriverIncident);
  yield takeLatest(updateIncidentStatusRequest.type, handleUpdateIncidentStatus);
  yield takeLatest(checkoutDriverAfterIncidentRequest.type, handleCheckoutDriverAfterIncident);
  yield takeLatest(getIncidentSessionEvidenceRequest.type, handleGetIncidentSessionEvidence);
  yield takeLatest(getIncidentLatestReservationRequest.type, handleGetIncidentLatestReservation);
  yield takeLatest(getIncidentAvailableSlotsRequest.type, handleGetIncidentAvailableSlots);
  yield takeLatest(getIncidentsBySessionRequest.type, handleGetIncidentsBySession);
  yield takeLatest(verifyIncidentVehicleRequest.type, handleVerifyIncidentVehicle);
  yield takeLatest(validateIncidentReassignRequest.type, handleValidateIncidentReassign);
}
```

`takeLatest` = request mới sẽ hủy request cũ cùng loại (tránh race condition).

---

## 5. Driver — DriverIncidentReports.jsx

File: `src/page/Driver/IncidentReports/DriverIncidentReports.jsx`

### 5.1. Constants — loại sự cố Driver được chọn

```javascript
const INCIDENT_TYPE_OPTIONS = [
  { value: "DRIVER_LOST_TICKET", label: "Lost parking ticket" },
  { value: "DRIVER_INCORRECT_FEE", label: "Incorrect parking fee" },
  { value: "DRIVER_SLOT_OCCUPIED", label: "Assigned slot is occupied" },
];

const INCIDENT_TYPE_LABELS = {
  ...Object.fromEntries(INCIDENT_TYPE_OPTIONS.map(...)),
  DRIVER_CANNOT_FIND_VEHICLE: "Cannot find my vehicle",  // label thêm, không có trong dropdown create
};

const STATUS_COLORS = {
  OPEN: "red",
  IN_PROGRESS: "blue",
  PENDING: "gold",
  RESOLVED: "green",
  CLOSED: "default",
  CANCELLED: "default",
};
```

### 5.2. Helper normalize session

Backend có thể trả session theo nhiều format:

```javascript
const getSessions = (currentSession) => {
  if (!currentSession) return [];
  if (Array.isArray(currentSession.sessions)) return currentSession.sessions;  // format mảng
  if (currentSession.sessionId) return [currentSession];                        // format object đơn
  return [];
};
```

### 5.3. State local

```javascript
const [form] = Form.useForm();
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [searchText, setSearchText] = useState("");       // filter client-side
const [statusFilter, setStatusFilter] = useState(null);
const [typeFilter, setTypeFilter] = useState(null);
const [selectedReport, setSelectedReport] = useState(null);  // modal Detail read-only
```

### 5.4. Redux selectors

```javascript
const { currentSession, loading: sessionLoading } = useSelector(
  (state) => state.getCurrentSession,  // API session riêng, không nằm incident slice
);

const {
  myReports,           // danh sách report
  loadingMyReports,    // spinner bảng
  creating,            // spinner nút Submit
  createSuccess,       // trigger đóng modal sau khi tạo xong
  error,
} = useSelector((state) => state.incident);
```

### 5.5. Mount — load data

```javascript
useEffect(() => {
  dispatch(getCurrentSessionRequest());     // cần biết driver đang đỗ xe không
  dispatch(getMyDriverIncidentsRequest());  // load lịch sử report
  return () => dispatch(resetIncidentMutationStatus());  // cleanup khi rời trang
}, [dispatch]);
```

### 5.6. Sau create thành công — đóng modal

```javascript
useEffect(() => {
  if (!createSuccess) return;
  const timer = setTimeout(() => {
    setIsCreateModalOpen(false);              // đóng modal create
    form.resetFields();                       // xóa form
    dispatch(resetIncidentMutationStatus());  // reset flag success
  }, 0);
  return () => clearTimeout(timer);
}, [createSuccess, dispatch, form]);
```

Dùng `setTimeout(0)` để tránh setState trong cùng render cycle với saga success.

### 5.7. Derived data — session active

```javascript
const sessions = useMemo(() => getSessions(currentSession), [currentSession]);
const sessionOptions = useMemo(
  () => sessions.filter((session) => session.sessionId),
  [sessions],
);
const activeSession = sessionOptions[0] || null;  // lấy session đầu tiên làm session hiện tại
```

**Quan trọng:** Nút Create Report `disabled={!sessionLoading && !activeSession}`  
→ Không có session active thì không tạo được report.

### 5.8. Filter client-side (không gọi API)

```javascript
const filteredReports = useMemo(() => {
  const keyword = searchText.trim().toLowerCase();
  return reports.filter((report) => {
    const searchable = [
      INCIDENT_TYPE_LABELS[report.incidentType],
      report.description,
      report.vehiclePlate,
      report.resolution,
    ].filter(Boolean).join(" ").toLowerCase();

    return (
      (!keyword || searchable.includes(keyword)) &&
      (!statusFilter || report.status === statusFilter) &&
      (!typeFilter || report.incidentType === typeFilter)
    );
  });
}, [reports, searchText, statusFilter, typeFilter]);
```

### 5.9. Submit create report

```javascript
const handleSubmit = (values) => {
  dispatch(
    createDriverIncidentRequest({
      sessionId: activeSession.sessionId,  // bắt buộc — gắn report với session đang đỗ
      incidentType: values.incidentType,
      description: values.description.trim(),
    }),
  );
};
```

**Luồng:** Submit → Saga POST → refresh myReports → createSuccess → đóng modal.

### 5.10. Bảng columns

```javascript
const columns = [
  {
    title: "Report",
    render: (_, record) => (
      // Gom: loại sự cố + mô tả + biển số trong 1 cột
    ),
  },
  {
    title: "Status",
    render: (status) => <Tag color={STATUS_COLORS[status]}>...</Tag>,
  },
  {
    title: "Created",
    sorter: ...,  // sort theo thời gian
    defaultSortOrder: "descend",
  },
  {
    title: "Action",
    render: (_, record) => (
      <Button onClick={() => setSelectedReport(record)}>Detail</Button>
      // Detail dùng data có sẵn trong row — KHÔNG gọi API detail riêng
    ),
  },
];
```

### 5.11. Modal Detail (read-only)

```javascript
<Modal open={Boolean(selectedReport)} onCancel={() => setSelectedReport(null)}>
  {/* Hiển thị: type, status, vehicle, created, description */}
  {/* Staff resolution: resolution + resolutionAction nếu staff đã xử lý */}
  {selectedReport.resolution ? (
    <div>...</div>
  ) : (
    <p>Waiting for staff to respond.</p>
  )}
</Modal>
```

### 5.12. Modal Create

```javascript
<Form form={form} onFinish={handleSubmit}>
  <Form.Item name="incidentType" rules={[{ required: true }]}>
    <Select options={INCIDENT_TYPE_OPTIONS} />
  </Form.Item>
  <Form.Item name="description" rules={[{ required: true }, { min: 10 }]}>
    <TextArea maxLength={500} showCount />
  </Form.Item>
  <Button htmlType="submit" loading={creating}>Submit Report</Button>
</Form>
```

---

## 6. Staff — IncidentManagement.jsx

File: `src/page/Staff/incidentManagement/IncidentManagement.jsx`

File dài (~1400 dòng) nhưng logic chia thành **6 khối rõ ràng**.

### 6.1. Constants — loại incident + status machine

```javascript
const TYPE_LABELS = {
  DRIVER_LOST_TICKET: "Lost parking ticket",
  DRIVER_CANNOT_FIND_VEHICLE: "Cannot find vehicle",
  DRIVER_INCORRECT_FEE: "Incorrect parking fee",
  DRIVER_SLOT_OCCUPIED: "Assigned slot occupied",
  // ... thêm loại system nếu backend trả về
};

// State machine: status hiện tại → status được phép chuyển
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
```

### 6.2. Resolution action theo loại incident

```javascript
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
```

Khi staff chọn status = `RESOLVED` → form hiện dropdown action tương ứng loại incident.

### 6.3. State local + Redux

```javascript
// Local
const [searchText, setSearchText] = useState("");
const [statusFilter, setStatusFilter] = useState(null);
const [typeFilter, setTypeFilter] = useState(null);
const [selectedBuildingId, setSelectedBuildingId] = useState(null);
const [selectedIncident, setSelectedIncident] = useState(null);  // incident đang review
const [checkoutImageFile, setCheckoutImageFile] = useState(null); // file ảnh checkout

// Staff building (redux riêng — không nằm incident slice)
const { getStaffBuilding: staffBuilding } = useSelector((state) => state.getStaffBuilding);

// Incident slice — rất nhiều field cho modal review
const {
  allReports, loadingAllReports,
  updating, checkingOut, updateSuccess, checkoutSuccess,
  sessionEvidence, latestReservation, availableSlots,
  relatedIncidents, vehicleVerification, reassignValidation,
  loadingSessionEvidence, verifyingVehicle, validatingReassign,
  // ... errors
} = useSelector((state) => state.incident);

// Form.useWatch — theo dõi field form realtime để show/hide UI động
const selectedStatus = Form.useWatch("status", form);
const selectedAction = Form.useWatch("resolutionAction", form);
const selectedNewSlotId = Form.useWatch("newSlotId", form);
```

### 6.4. Building options — staff chỉ xem building được gán

```javascript
const buildingOptions = useMemo(() => {
  const buildings = Array.isArray(staffBuilding)
    ? staffBuilding
    : staffBuilding ? [staffBuilding] : [];
  return buildings.map((building) => ({
    value: building.buildingId || building.id,
    label: building.buildingName || building.name || "Building",
  })).filter((building) => building.value);
}, [staffBuilding]);

const resolvedBuildingId =
  selectedBuildingId || buildingOptions[0]?.value || null;
// Ưu tiên building user chọn, không thì lấy building đầu tiên được gán
```

### 6.5. Mount + load list theo building

```javascript
useEffect(() => {
  dispatch(getStaffBuildingRequest());  // lấy building staff được gán
  return () => {
    dispatch(resetIncidentEnhancement());
    dispatch(resetIncidentMutationStatus());
  };
}, [dispatch]);

useEffect(() => {
  if (resolvedBuildingId) {
    dispatch(getAllDriverIncidentsRequest(resolvedBuildingId));
    // GET /incidents/driver/all?buildingId=xxx
  }
}, [dispatch, resolvedBuildingId]);
```

### 6.6. Sau update thành công — đóng modal review

```javascript
useEffect(() => {
  if (!updateSuccess) return;
  setSelectedIncident(null);
  form.resetFields();
  dispatch(resetIncidentEnhancement());      // xóa evidence tạm
  dispatch(resetIncidentMutationStatus());
}, [updateSuccess]);
```

### 6.7. openIncident — hàm quan trọng nhất (mở modal review)

```javascript
const openIncident = (incident) => {
  dispatch(resetIncidentEnhancement());  // xóa evidence cũ trước khi load mới
  setCheckoutImageFile(null);
  setSelectedIncident(incident);

  // Điền form với data hiện có của incident (nếu đã xử lý một phần)
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

  // --- Gọi song song các API evidence ---
  dispatch(getIncidentSessionEvidenceRequest(incident.incidentId));   // BẮT BUỘC — nguồn chính
  dispatch(getIncidentLatestReservationRequest(incident.incidentId)); // OPTIONAL — đối chiếu thêm

  if (incident.sessionId) {
    dispatch(getIncidentsBySessionRequest(incident.sessionId));       // đếm report cùng session
  }

  if (incident.incidentType === "DRIVER_SLOT_OCCUPIED") {
    dispatch(getIncidentAvailableSlotsRequest(incident.incidentId));  // chỉ load khi cần reassign
  }
};
```

### 6.8. closeIncident — đóng modal + cleanup

```javascript
const closeIncident = () => {
  setCheckoutImageFile(null);
  setSelectedIncident(null);
  form.resetFields();
  dispatch(resetIncidentEnhancement());
  dispatch(resetIncidentMutationStatus());
};
```

### 6.9. Verify vehicle (lost ticket)

```javascript
const handleVerifyVehicle = async () => {
  const values = await form.validateFields(["plateNumber"]);  // validate trước khi dispatch
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
// Kết quả → vehicleVerification.verificationResult === "MATCH" → cho phép checkout
```

### 6.10. Validate slot reassign (slot occupied)

```javascript
const handleSlotChange = (newSlotId) => {
  form.setFieldValue("newSlotId", newSlotId);
  dispatch(
    validateIncidentReassignRequest({
      incidentId: selectedIncident.incidentId,
      newSlotId,
    }),
  );
};
```

### 6.11. handleUpdate — save incident chính

```javascript
const handleUpdate = (values) => {
  const data = {};

  if (values.resolution?.trim()) data.resolution = values.resolution.trim();
  if (values.resolutionAction) data.resolutionAction = values.resolutionAction;

  // Field phụ thuộc action
  if (values.resolutionAction === "UPDATE_PAYMENT" && values.adjustedAmount != null) {
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
// Saga: PUT /incidents/{id}/status?status=... → refresh allReports
```

### 6.12. handleAuthorizedCheckout — bước riêng sau RESOLVED

```javascript
const handleAuthorizedCheckout = () => {
  dispatch(
    checkoutDriverAfterIncidentRequest({
      sessionId: sessionEvidence?.sessionId || selectedIncident.sessionId,
      checkoutImage: checkoutImageFile,  // File object → FormData trong API
    }),
  );
};
```

### 6.13. Derived flags — điều kiện enable/disable nút

```javascript
const actionOptions = ACTION_OPTIONS_BY_TYPE[selectedIncident?.incidentType] || [];
const needsResolution = selectedStatus === "RESOLVED";
const allowedStatusOptions = getAllowedStatusOptions(selectedIncident?.status);
const isTerminalIncident = ["CLOSED", "CANCELLED"].includes(selectedIncident?.status);

// Verify plate đã MATCH chưa
const verificationMatches =
  vehicleVerification?.verificationResult === "MATCH" ||
  selectedIncident?.verificationResult === "MATCH";

// Lost ticket + RESOLVED + AUTHORIZE_CHECKOUT → bắt buộc verify trước
const requiresVehicleVerification =
  selectedIncident?.incidentType === "DRIVER_LOST_TICKET" &&
  selectedStatus === "RESOLVED" &&
  selectedAction === "AUTHORIZE_CHECKOUT";

// Reassign slot hợp lệ chưa
const reassignIsValid =
  reassignValidation?.slotId === selectedNewSlotId &&
  reassignValidation?.isAvailable === true &&
  reassignValidation?.isInSameBuilding !== false &&
  reassignValidation?.isSameVehicleType !== false;

const requiresValidReassign =
  selectedStatus === "RESOLVED" && selectedAction === "REASSIGN_SLOT";

// Session evidence còn hợp lệ không
const sessionEvidenceValid =
  Boolean(sessionEvidence) &&
  sessionEvidence?.sessionActive !== false &&
  sessionEvidence?.driverMatchesReporter !== false;

// Đủ điều kiện checkout chưa
const canCheckout =
  selectedIncident?.status === "RESOLVED" &&
  selectedIncident?.resolutionAction === "AUTHORIZE_CHECKOUT" &&
  (selectedIncident?.incidentType !== "DRIVER_LOST_TICKET" || verificationMatches) &&
  sessionEvidence?.sessionActive === true &&
  Boolean(checkoutImageFile);  // bắt buộc có ảnh checkout
```

### 6.14. Modal Review — 3 bước UI

```
┌─────────────────────────────────────────────────────────┐
│  Bước 1: Read report                                    │
│  - Loại, biển số, reporter, mô tả driver                │
│  - Tag số relatedIncidents cùng session                  │
├─────────────────────────────────────────────────────────┤
│  Bước 2: Verify evidence                                │
│  A) Session Evidence (chính) — sessionEvidence          │
│     - Driver, vehicle, location, ticket, fee, images    │
│     - Alert nếu session inactive / driver mismatch      │
│  B) Reservation Cross-check (optional) — latestReservation│
│     - Collapsible <details>, không block xử lý          │
├─────────────────────────────────────────────────────────┤
│  Bước 3: Resolution form                                │
│  - Status dropdown (theo state machine)                 │
│  - Verify vehicle panel (lost ticket only)              │
│  - Resolution action (khi status = RESOLVED)            │
│  - adjustedAmount / newSlotId / cancelReason (dynamic)  │
│  - Upload checkout image (sau RESOLVED + AUTHORIZE)     │
│  - Nút "Checkout Driver" + "Save Incident"              │
└─────────────────────────────────────────────────────────┘
```

### 6.15. Nút Save bị disable khi

```javascript
disabled={
  isTerminalIncident ||                                    // CLOSED/CANCELLED
  (requiresVehicleVerification && !verificationMatches) || // chưa verify xe
  (requiresValidReassign && !reassignIsValid) ||           // slot chưa valid
  validatingReassign                                       // đang validate slot
}
```

### 6.16. Upload checkout image

```javascript
<Upload
  accept="image/*"
  maxCount={1}
  beforeUpload={(file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Please select an image file.");
      return Upload.LIST_IGNORE;
    }
    setCheckoutImageFile(file);  // lưu File local, KHÔNG auto upload
    return false;                // return false = chặn antd upload mặc định
  }}
  onRemove={() => setCheckoutImageFile(null)}
/>
```

Ảnh chỉ gửi lên khi staff bấm **Checkout Driver** → saga → FormData POST.

---

## 7. Luồng end-to-end

### 7.1. Driver tạo report

```
1. Driver mở trang
   → getCurrentSessionRequest + getMyDriverIncidentsRequest

2. Có activeSession?
   NO  → nút Create disabled
   YES → bấm Create Report

3. Điền incidentType + description → Submit
   → createDriverIncidentRequest({ sessionId, incidentType, description })
   → POST /incidents/driver
   → refresh myReports
   → incident status = OPEN (backend set)

4. Driver xem bảng / Detail modal
   → chờ staff xử lý, resolution hiện khi staff update
```

### 7.2. Staff xử lý report (ví dụ LOST TICKET)

```
1. Staff mở trang
   → getStaffBuildingRequest
   → getAllDriverIncidentsRequest(buildingId)

2. Bấm Detail trên 1 row
   → openIncident(incident)
   → load session-evidence + latest-reservation + related-incidents

3. Staff đọc report (bước 1) + xem evidence (bước 2)

4. Chuyển status: OPEN → IN_PROGRESS → PENDING (tùy workflow)

5. Verify vehicle (plate + optional ticket)
   → verifyIncidentVehicleRequest
   → verificationResult = MATCH

6. Set status = RESOLVED, action = AUTHORIZE_CHECKOUT, ghi resolution note
   → updateIncidentStatusRequest
   → PUT /incidents/{id}/status

7. Upload ảnh checkout → bấm Checkout Driver
   → checkoutDriverAfterIncidentRequest({ sessionId, checkoutImage })
   → POST /sessions/driver/checkout (FormData)

8. Driver refresh trang → thấy status RESOLVED + resolution note
```

### 7.3. Staff xử lý SLOT OCCUPIED

```
1. openIncident → load availableSlots (API riêng)

2. status = RESOLVED, action = REASSIGN_SLOT

3. Chọn slot mới → handleSlotChange → validateIncidentReassignRequest

4. reassignIsValid = true → Save Incident
   → updateIncidentStatusRequest với data.newSlotId
```

---

## 8. Bảng tra cứu nhanh

### API ↔ Action ↔ Ai gọi

| dispatch action | API | Component |
|-----------------|-----|-----------|
| `getMyDriverIncidentsRequest` | GET `/incidents/driver/me` | Driver |
| `createDriverIncidentRequest` | POST `/incidents/driver` | Driver |
| `getAllDriverIncidentsRequest(id)` | GET `/incidents/driver/all` | Staff |
| `getIncidentSessionEvidenceRequest` | GET `.../session-evidence` | Staff modal |
| `getIncidentLatestReservationRequest` | GET `.../latest-reservation` | Staff modal |
| `getIncidentsBySessionRequest` | GET `/incidents/by-session/{id}` | Staff modal |
| `getIncidentAvailableSlotsRequest` | GET `.../available-slots-for-reassign` | Staff modal |
| `verifyIncidentVehicleRequest` | POST `.../verify-vehicle` | Staff modal |
| `validateIncidentReassignRequest` | POST `/incidents/validate-reassign` | Staff modal |
| `updateIncidentStatusRequest` | PUT `.../status` | Staff modal |
| `checkoutDriverAfterIncidentRequest` | POST `/sessions/driver/checkout` | Staff modal |

### File đọc theo thứ tự khi debug

1. `incidentApi.js` — endpoint là gì
2. `incidentSaga.js` — saga gọi API nào, refresh gì sau success
3. `incidentSlice.js` — state field nào lưu data
4. `DriverIncidentReports.jsx` hoặc `IncidentManagement.jsx` — UI dispatch action nào

---

## Ghi chú thêm

- **Driver Detail modal** không gọi API — dùng data từ row bảng.
- **Staff Detail modal** gọi nhiều API evidence khi mở (`openIncident`).
- **Session evidence** là nguồn verify chính; **reservation** chỉ bổ sung, lỗi không chặn flow.
- **Checkout** là API riêng, không nằm trong `updateIncidentStatus`.
- Cả 2 role dùng chung `state.incident` nhưng field khác nhau: Driver dùng `myReports`, Staff dùng `allReports`.

---

*Tài liệu này map với source tại thời điểm viết. Khi code thay đổi, cập nhật file doc tương ứng.*
