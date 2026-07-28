# DriverIncidentReports.jsx — Giải thích code (comment kế bên)

> File gốc: `DriverIncidentReports.jsx` (cùng folder)  
> Mở 2 tab song song: **jsx bên trái — md bên phải**

---

## PHẦN 1 — Import & constants (dòng 1–64)

```javascript
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";  // Redux: dispatch action + đọc state

// Ant Design components dùng trong UI
import { Alert, Button, Form, Input, Modal, Select, Table, Tag } from "antd";

// Icon trang trí UI
import { AlertTriangle, CarFront, CheckCircle2, Clock3, FileWarning, ... } from "lucide-react";

import dayjs from "dayjs";  // format ngày giờ trong bảng

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";

// API session riêng — KHÔNG nằm incident slice
import { getCurrentSessionRequest } from "../../../redux/driver/session/currentSession/currentSessionSlice";

// 3 action incident Driver cần dùng
import {
  createDriverIncidentRequest,   // POST tạo report
  getMyDriverIncidentsRequest,   // GET list report của mình
  resetIncidentMutationStatus,   // reset flag success/error khi đóng modal / rời trang
} from "../../../redux/incident/incidentSlice";

const { TextArea } = Input;  // destructuring cho form mô tả

// Dropdown Create Report — 3 loại driver được chọn
const INCIDENT_TYPE_OPTIONS = [
  { value: "DRIVER_LOST_TICKET", label: "Lost parking ticket" },
  { value: "DRIVER_INCORRECT_FEE", label: "Incorrect parking fee" },
  { value: "DRIVER_SLOT_OCCUPIED", label: "Assigned slot is occupied" },
];

// Map value → label hiển thị (bảng + detail modal)
const INCIDENT_TYPE_LABELS = {
  ...Object.fromEntries(INCIDENT_TYPE_OPTIONS.map((item) => [item.value, item.label])),
  DRIVER_CANNOT_FIND_VEHICLE: "Cannot find my vehicle",  // backend có thể trả thêm loại này
};

// Màu Tag theo status
const STATUS_COLORS = {
  OPEN: "red",
  IN_PROGRESS: "blue",
  PENDING: "gold",
  RESOLVED: "green",
  CLOSED: "default",
  CANCELLED: "default",
};

// Backend trả session theo 2 format → chuẩn hóa về mảng
const getSessions = (currentSession) => {
  if (!currentSession) return [];
  if (Array.isArray(currentSession.sessions)) return currentSession.sessions;  // format { sessions: [...] }
  if (currentSession.sessionId) return [currentSession];                         // format object đơn
  return [];
};
```

---

## PHẦN 2 — State & Redux (dòng 66–106)

```javascript
const DriverIncidentReports = () => {
  const dispatch = useDispatch();  // gửi action sang Redux

  const [form] = Form.useForm();                    // form modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);  // mở/đóng modal tạo
  const [searchText, setSearchText] = useState("");       // filter search — chỉ FE
  const [statusFilter, setStatusFilter] = useState(null); // filter status — chỉ FE
  const [typeFilter, setTypeFilter] = useState(null);     // filter loại — chỉ FE
  const [selectedReport, setSelectedReport] = useState(null);  // row đang xem Detail (không gọi API)

  // Session đang đỗ — từ slice getCurrentSession
  const { currentSession, loading: sessionLoading } = useSelector(
    (state) => state.getCurrentSession,
  );

  // Data incident — từ slice incident (key trong store: incident)
  const {
    myReports,          // mảng report sau GET /incidents/driver/me
    loadingMyReports,   // spinner bảng
    creating,           // spinner nút Submit
    createSuccess,      // true khi POST thành công → trigger đóng modal
    error,              // lỗi API hiện Alert đỏ
  } = useSelector((state) => state.incident);

  // === MOUNT: load data khi vào trang ===
  useEffect(() => {
    dispatch(getCurrentSessionRequest());     // Saga → API session hiện tại
    dispatch(getMyDriverIncidentsRequest());  // Saga → GET /incidents/driver/me
    return () => dispatch(resetIncidentMutationStatus());  // cleanup khi rời trang
  }, [dispatch]);

  // === SAU CREATE THÀNH CÔNG: đóng modal ===
  useEffect(() => {
    if (!createSuccess) return;
    const timer = setTimeout(() => {
      setIsCreateModalOpen(false);              // đóng modal
      form.resetFields();                       // xóa input
      dispatch(resetIncidentMutationStatus());  // reset createSuccess = false
    }, 0);  // setTimeout(0) tránh conflict render cycle
    return () => clearTimeout(timer);
  }, [createSuccess, dispatch, form]);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    form.resetFields();
    dispatch(resetIncidentMutationStatus());
  };
```

**Luồng mount:**
```
Vào trang → getCurrentSession + getMyDriverIncidents
  → Saga call API → myReports + currentSession vào Redux → UI render
```

---

## PHẦN 3 — Derived data (dòng 108–152)

```javascript
  const sessions = useMemo(() => getSessions(currentSession), [currentSession]);

  const reports = useMemo(
    () => (Array.isArray(myReports) ? myReports : []),  // đảm bảo luôn là mảng
    [myReports],
  );

  const sessionOptions = useMemo(
    () => sessions.filter((session) => session.sessionId),  // chỉ session có id hợp lệ
    [sessions],
  );

  const activeSession = sessionOptions[0] || null;
  // ↑ Session "hiện tại" = phần tử đầu tiên
  // Dùng cho: banner biển số, disable nút Create, gửi sessionId khi tạo report

  // === FILTER CLIENT-SIDE (không gọi API) ===
  const filteredReports = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return reports.filter((report) => {
      const searchable = [
        INCIDENT_TYPE_LABELS[report.incidentType],
        report.description,
        report.vehiclePlate,
        report.resolution,  // cả phản hồi staff cũng search được
      ].filter(Boolean).join(" ").toLowerCase();

      return (
        (!keyword || searchable.includes(keyword)) &&
        (!statusFilter || report.status === statusFilter) &&
        (!typeFilter || report.incidentType === typeFilter)
      );
    });
  }, [reports, searchText, statusFilter, typeFilter]);

  // 4 thẻ summary — tính từ reports gốc (trước filter)
  const summary = useMemo(() => ({
    total: reports.length,
    open: reports.filter((item) => item.status === "OPEN").length,
    processing: reports.filter((item) => ["IN_PROGRESS", "PENDING"].includes(item.status)).length,
    completed: reports.filter((item) => ["RESOLVED", "CLOSED"].includes(item.status)).length,
  }), [reports]);
```

---

## PHẦN 4 — Submit create (dòng 154–162)

```javascript
  const handleSubmit = (values) => {
    // values từ Form onFinish: { incidentType, description }
    dispatch(
      createDriverIncidentRequest({
        sessionId: activeSession.sessionId,  // BẮT BUỘC — gắn report với session đang đỗ
        incidentType: values.incidentType,
        description: values.description.trim(),
      }),
    );
  };
```

**Luồng sau bấm Submit:**
```
handleSubmit
  → dispatch(createDriverIncidentRequest)
  → Slice: creating = true
  → Saga: POST /incidents/driver
  → Saga: createSuccess + getMyDriverIncidentsRequest() (refresh bảng)
  → useEffect createSuccess → đóng modal
```

---

## PHẦN 5 — Cột bảng (dòng 164–224)

```javascript
  const columns = [
    {
      title: "Report",
      render: (_, record) => (
        // Gom 3 thông tin 1 cột: loại + mô tả + biển số (tránh scroll ngang)
        <div>
          <p>{INCIDENT_TYPE_LABELS[record.incidentType] || record.incidentType}</p>
          <p>{record.description || "—"}</p>
          <p>{record.vehiclePlate || "—"}</p>
        </div>
      ),
    },
    {
      title: "Status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status]}>{status.replaceAll("_", " ")}</Tag>
      ),
    },
    {
      title: "Created",
      sorter: ...,                    // sort client-side theo ngày
      defaultSortOrder: "descend",   // mới nhất lên đầu
      render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button onClick={() => setSelectedReport(record)}>Detail</Button>
        // ↑ Chỉ set state local — KHÔNG dispatch API
        // Detail modal đọc từ selectedReport (data sẵn trong row)
      ),
    },
  ];
```

---

## PHẦN 6 — UI Header & nút (dòng 226–267)

```javascript
  return (
    <div className="w-full min-w-0 ...">  {/* min-w-0: tránh bị cắt content trong flex layout */}

      {/* Header + breadcrumb */}
      <CommonBreadcrumb role="Driver" page="reports" />

      <Button
        loading={loadingMyReports}
        onClick={() => dispatch(getMyDriverIncidentsRequest())}  // Refresh → gọi lại API list
      >
        Refresh
      </Button>

      <Button
        type="primary"
        loading={sessionLoading}
        disabled={!sessionLoading && !activeSession}
        // ↑ Không có session active → KHÔNG cho tạo report
        onClick={() => setIsCreateModalOpen(true)}
      >
        Create Report
      </Button>
```

---

## PHẦN 7 — Banner session (dòng 269–311)

```javascript
      {/* Banner đổi màu nếu có/không có session */}
      <div className={activeSession ? "border-indigo-100 bg-indigo-50/60" : "border-slate-200 bg-white"}>
        <p>
          {sessionLoading
            ? "Checking active session..."
            : activeSession?.vehiclePlate || "No active session"}
        </p>

        {activeSession && (
          <span>
            {[activeSession.buildingName, activeSession.floorName, activeSession.slotName]
              .filter(Boolean)
              .join(" · ")}
          </span>
          // Hiện vị trí đỗ: Building · Floor · Slot
        )}
      </div>
```

---

## PHẦN 8 — Bảng + filter (dòng 374–456)

```javascript
      {/* 4 summary cards — map từ summary object */}

      {error && <Alert type="error" message={error} />}  // lỗi từ Redux incident.error

      <Input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}  // chỉ set state local
        placeholder="Search incident, vehicle, description..."
      />

      <Select
        value={statusFilter}
        onChange={(value) => setStatusFilter(value ?? null)}  // null khi clear
        options={[ OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED, CANCELLED ]}
      />

      <Select
        value={typeFilter}
        options={INCIDENT_TYPE_OPTIONS}
      />

      <Table
        rowKey={(record) => record.incidentId}   // key duy nhất mỗi row
        dataSource={filteredReports}              // data đã filter FE
        loading={loadingMyReports}
        rowClassName={(record) =>
          ["OPEN", "IN_PROGRESS", "PENDING"].includes(record.status)
            ? "bg-amber-50/20"   // highlight row đang chờ xử lý
            : ""
        }
        locale={{
          emptyText: reports.length > 0
            ? "No reports match the selected filters."  // có data nhưng filter rỗng
            : "You have not submitted any reports.",    // chưa có report nào
        }}
      />
```

---

## PHẦN 9 — Modal Detail (dòng 458–551)

```javascript
      <Modal open={Boolean(selectedReport)} onCancel={() => setSelectedReport(null)}>
        {selectedReport && (
          <>
            {/* Hiển thị từ selectedReport — data có sẵn, không API */}

            <p>{INCIDENT_TYPE_LABELS[selectedReport.incidentType]}</p>
            <Tag color={STATUS_COLORS[selectedReport.status]}>...</Tag>
            <p>{selectedReport.vehiclePlate}</p>
            <p>{dayjs(selectedReport.createdAt).format("DD/MM/YYYY HH:mm")}</p>
            <p>{selectedReport.description}</p>

            {/* Phản hồi staff — chỉ hiện khi staff đã update incident */}
            {selectedReport.resolution ? (
              <div>
                <p>{selectedReport.resolution}</p>
                {selectedReport.resolutionAction && (
                  <Tag>{selectedReport.resolutionAction.replaceAll("_", " ")}</Tag>
                )}
              </div>
            ) : (
              <p>Waiting for staff to respond.</p>
            )}
          </>
        )}
      </Modal>
```

---

## PHẦN 10 — Modal Create (dòng 553–638)

```javascript
      <Modal open={isCreateModalOpen} onCancel={closeCreateModal} footer={null}>

        {/* Banner xe đang report — lấy từ activeSession */}
        {activeSession?.vehiclePlate && (
          <div>
            <p>{activeSession.vehiclePlate}</p>
            <Tag>Active session</Tag>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="incidentType"
            rules={[{ required: true }]}  // bắt buộc chọn loại
          >
            <Select options={INCIDENT_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="description"
            rules={[
              { required: true },
              { min: 10 },  // tối thiểu 10 ký tự
            ]}
          >
            <TextArea rows={5} maxLength={500} showCount />
          </Form.Item>

          <Button htmlType="submit" loading={creating}>Submit Report</Button>
          {/* creating = true khi Saga đang POST */}
        </Form>
      </Modal>
```

---

## Tóm tắt luồng Driver

| Hành động | Code | API |
|-----------|------|-----|
| Mở trang | `getCurrentSessionRequest` + `getMyDriverIncidentsRequest` | Session API + GET `/incidents/driver/me` |
| Refresh | `getMyDriverIncidentsRequest` | GET `/incidents/driver/me` |
| Create | `createDriverIncidentRequest({ sessionId, incidentType, description })` | POST `/incidents/driver` |
| Detail | `setSelectedReport(record)` | Không gọi API |
| Filter | `searchText`, `statusFilter`, `typeFilter` | Chỉ FE |

---

*Đọc kèm: `../Staff/incidentManagement/IncidentManagement.md` (phía Staff xử lý report này)*
