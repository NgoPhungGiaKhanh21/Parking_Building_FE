import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Tag,
  TimePicker,
} from "antd";
import {
  CheckCircle2,
  Clock3,
  ListFilter,
  Pencil,
  Plus,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import dayjs from "dayjs";
import {
  createBuildingRuleRequest,
  deleteBuildingRuleRequest,
  getBuildingRulesRequest,
  resetBuildingRuleMutation,
  updateBuildingRuleRequest,
} from "../../../../redux/manager/Building/buildingRules/buildingRulesSlice";
import { getVehicleTypeListRequest } from "../../../../redux/manager/Building/getVehicleTypeList/getVehicleTypeListSlice";
import { mapVehicleTypeOptions } from "../utils/buildingUtils";

const { TextArea } = Input;

const TIME_FORMAT = "HH:mm";
const TIME_RANGE_RULES = new Set(["NO_OVERNIGHT", "OPERATING_HOURS"]);

const RULE_CODE_OPTIONS = [
  { value: "NO_OVERNIGHT", label: "No overnight parking" },
  { value: "MAX_PARKING_HOURS", label: "Maximum parking hours" },
  { value: "OPERATING_HOURS", label: "Operating hours" },
  { value: "VEHICLE_TYPE_CURFEW", label: "Vehicle type curfew" },
];

const RULE_CODE_LABELS = Object.fromEntries(
  RULE_CODE_OPTIONS.map((item) => [item.value, item.label]),
);

const RULE_VALUE_HELP = {
  NO_OVERNIGHT: "Select the overnight restricted time window.",
  MAX_PARKING_HOURS: "Maximum parking duration in hours (1–168).",
  OPERATING_HOURS: "Select daily operating hours for this building.",
  VEHICLE_TYPE_CURFEW: "Select vehicle type and curfew time.",
};

const parseTime = (value) => {
  if (!value || typeof value !== "string") return null;
  const parsed = dayjs(value.trim(), TIME_FORMAT, true);
  return parsed.isValid() ? parsed : null;
};

const formatTime = (value) =>
  value ? dayjs(value).format(TIME_FORMAT) : null;

/** API ruleValue string → form fields for editors */
const parseRuleValueToForm = (ruleCode, ruleValue) => {
  const raw = String(ruleValue || "").trim();
  if (!raw) return {};

  if (TIME_RANGE_RULES.has(ruleCode)) {
    const [from, to] = raw.split("-").map((part) => part?.trim());
    return {
      timeFrom: parseTime(from),
      timeTo: parseTime(to),
    };
  }

  if (ruleCode === "MAX_PARKING_HOURS") {
    const hours = Number(raw);
    return Number.isFinite(hours) ? { maxHours: hours } : {};
  }

  if (ruleCode === "VEHICLE_TYPE_CURFEW") {
    const match = raw.match(/^(.+):(\d{2}:\d{2})$/);
    if (match) {
      return {
        vehicleTypeName: match[1].trim(),
        curfewTime: parseTime(match[2]),
      };
    }
  }

  return {};
};

/** Form fields → API ruleValue string */
const buildRuleValue = (ruleCode, values) => {
  if (TIME_RANGE_RULES.has(ruleCode)) {
    const from = formatTime(values.timeFrom);
    const to = formatTime(values.timeTo);
    if (!from || !to) return null;
    return `${from}-${to}`;
  }

  if (ruleCode === "MAX_PARKING_HOURS") {
    if (values.maxHours == null || values.maxHours === "") return null;
    return String(Number(values.maxHours));
  }

  if (ruleCode === "VEHICLE_TYPE_CURFEW") {
    const typeName = values.vehicleTypeName?.trim();
    const time = formatTime(values.curfewTime);
    if (!typeName || !time) return null;
    return `${typeName}:${time}`;
  }

  return null;
};

const BuildingRulesModal = ({ open, building, onCancel }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const selectedRuleCode = Form.useWatch("ruleCode", form);

  const {
    rulesByBuilding,
    loadingByBuilding,
    mutating,
    mutationSuccess,
    error,
  } = useSelector((state) => state.buildingRules);
  const { vehicleTypes, loading: vehicleTypesLoading } = useSelector(
    (state) => state.getVehicleTypeList,
  );

  const buildingId = building?.id || building?.buildingId;
  const vehicleTypeOptions = useMemo(
    () => mapVehicleTypeOptions(vehicleTypes),
    [vehicleTypes],
  );
  // Select needs label string as value because API stores "Truck:22:00"
  const vehicleTypeNameOptions = useMemo(
    () =>
      vehicleTypeOptions.map((option) => ({
        value: option.label,
        label: option.label,
      })),
    [vehicleTypeOptions],
  );

  const rules = useMemo(
    () =>
      buildingId && Array.isArray(rulesByBuilding[buildingId])
        ? rulesByBuilding[buildingId]
        : [],
    [buildingId, rulesByBuilding],
  );

  const filteredRules = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return rules.filter((rule) => {
      const searchable = [
        rule.title,
        rule.description,
        rule.ruleValue,
        RULE_CODE_LABELS[rule.ruleCode],
        rule.ruleCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!keyword || searchable.includes(keyword)) &&
        (!statusFilter || rule.status === statusFilter)
      );
    });
  }, [rules, searchText, statusFilter]);

  const summary = useMemo(
    () => ({
      total: rules.length,
      active: rules.filter((rule) => rule.status === "ACTIVE").length,
      inactive: rules.filter((rule) => rule.status === "INACTIVE").length,
    }),
    [rules],
  );

  const isLoading = Boolean(loadingByBuilding[buildingId]);

  useEffect(() => {
    if (open && buildingId) {
      dispatch(getBuildingRulesRequest(buildingId));
    }
  }, [buildingId, dispatch, open]);

  useEffect(() => {
    if (!open) {
      setSearchText("");
      setStatusFilter(null);
    }
  }, [open]);

  useEffect(() => {
    if (!mutationSuccess) return;
    const timer = setTimeout(() => {
      setIsFormOpen(false);
      setEditingRule(null);
      form.resetFields();
      dispatch(resetBuildingRuleMutation());
    }, 0);

    return () => clearTimeout(timer);
  }, [dispatch, form, mutationSuccess]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRule(null);
    form.resetFields();
    dispatch(resetBuildingRuleMutation());
  };

  const openCreate = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({ status: "ACTIVE" });
    dispatch(getVehicleTypeListRequest());
    setIsFormOpen(true);
  };

  const openUpdate = (rule) => {
    setEditingRule(rule);
    dispatch(getVehicleTypeListRequest());
    form.setFieldsValue({
      ruleCode: rule.ruleCode,
      title: rule.title,
      description: rule.description,
      status: rule.status || "ACTIVE",
      ...parseRuleValueToForm(rule.ruleCode, rule.ruleValue),
    });
    setIsFormOpen(true);
  };

  const handleRuleCodeChange = (ruleCode) => {
    form.setFieldsValue({
      ruleCode,
      timeFrom: undefined,
      timeTo: undefined,
      maxHours: undefined,
      vehicleTypeName: undefined,
      curfewTime: undefined,
    });
  };

  const handleSubmit = (values) => {
    const ruleValue = buildRuleValue(values.ruleCode, values);
    if (!ruleValue) return;

    if (editingRule) {
      dispatch(
        updateBuildingRuleRequest({
          buildingId,
          ruleId: editingRule.ruleId,
          data: {
            title: values.title.trim(),
            description: values.description?.trim() || "",
            ruleValue,
            status: values.status,
          },
        }),
      );
      return;
    }

    dispatch(
      createBuildingRuleRequest({
        buildingId,
        data: {
          ruleCode: values.ruleCode,
          title: values.title.trim(),
          description: values.description?.trim() || "",
          ruleValue,
          status: values.status,
        },
      }),
    );
  };

  const closeMainModal = () => {
    closeForm();
    onCancel();
  };

  const refreshRules = () => {
    if (buildingId) dispatch(getBuildingRulesRequest(buildingId));
  };

  const renderRuleValueFields = () => {
    if (!selectedRuleCode) {
      return (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="Select a rule type to configure its value."
        />
      );
    }

    if (TIME_RANGE_RULES.has(selectedRuleCode)) {
      return (
        <div className="mb-1 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="timeFrom"
            label="From"
            rules={[{ required: true, message: "Select start time." }]}
            extra={RULE_VALUE_HELP[selectedRuleCode]}
          >
            <TimePicker
              size="large"
              className="w-full"
              format={TIME_FORMAT}
              minuteStep={5}
              needConfirm={false}
              placeholder="HH:mm"
            />
          </Form.Item>
          <Form.Item
            name="timeTo"
            label="To"
            rules={[{ required: true, message: "Select end time." }]}
          >
            <TimePicker
              size="large"
              className="w-full"
              format={TIME_FORMAT}
              minuteStep={5}
              needConfirm={false}
              placeholder="HH:mm"
            />
          </Form.Item>
        </div>
      );
    }

    if (selectedRuleCode === "MAX_PARKING_HOURS") {
      return (
        <Form.Item
          name="maxHours"
          label="Maximum hours"
          extra={RULE_VALUE_HELP.MAX_PARKING_HOURS}
          rules={[
            { required: true, message: "Enter maximum hours." },
            {
              type: "number",
              min: 1,
              max: 168,
              message: "Hours must be between 1 and 168.",
            },
          ]}
        >
          <InputNumber
            size="large"
            className="w-full"
            min={1}
            max={168}
            precision={0}
            addonAfter="hours"
            placeholder="e.g. 24"
          />
        </Form.Item>
      );
    }

    if (selectedRuleCode === "VEHICLE_TYPE_CURFEW") {
      return (
        <div className="mb-1 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="vehicleTypeName"
            label="Vehicle type"
            extra={RULE_VALUE_HELP.VEHICLE_TYPE_CURFEW}
            rules={[{ required: true, message: "Select a vehicle type." }]}
          >
            <Select
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Select vehicle type"
              loading={vehicleTypesLoading}
              options={vehicleTypeNameOptions}
              notFoundContent={
                vehicleTypesLoading ? <Spin size="small" /> : "No vehicle types"
              }
            />
          </Form.Item>
          <Form.Item
            name="curfewTime"
            label="Curfew time"
            rules={[{ required: true, message: "Select curfew time." }]}
          >
            <TimePicker
              size="large"
              className="w-full"
              format={TIME_FORMAT}
              minuteStep={5}
              needConfirm={false}
              placeholder="HH:mm"
            />
          </Form.Item>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={closeMainModal}
        footer={null}
        width={820}
        centered
        destroyOnClose
        classNames={{ body: "max-h-[85vh] overflow-y-auto pr-1" }}
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ScrollText size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Building Rules</p>
              <p className="text-xs font-normal text-slate-500">
                {building?.name || "Building"} · Manage parking regulations
              </p>
            </div>
          </div>
        }
      >
        <div className="mb-4 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-indigo-600" />
              <div>
                <p className="font-semibold text-slate-800">
                  Parking regulations
                </p>
                <p className="text-xs text-slate-500">
                  Active rules are shown to drivers on the availability page.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                icon={<RefreshCw size={15} />}
                loading={isLoading}
                onClick={refreshRules}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<Plus size={15} />}
                onClick={openCreate}
              >
                Create Rule
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            {
              label: "All rules",
              value: summary.total,
              icon: ScrollText,
              color: "text-slate-600",
              background: "bg-slate-100",
            },
            {
              label: "Active",
              value: summary.active,
              icon: CheckCircle2,
              color: "text-emerald-600",
              background: "bg-emerald-50",
            },
            {
              label: "Inactive",
              value: summary.inactive,
              icon: XCircle,
              color: "text-red-600",
              background: "bg-red-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-100 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-0.5 text-xl font-black text-slate-800">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.background} ${item.color}`}
                >
                  <item.icon size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            <ListFilter size={14} />
            Filters
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_160px_auto]">
            <Input
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              prefix={<Search size={15} className="text-slate-400" />}
              placeholder="Search title, type, value..."
            />
            <Select
              allowClear
              placeholder="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value ?? null)}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
            <Button
              onClick={() => {
                setSearchText("");
                setStatusFilter(null);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {error && (
          <Alert
            type="error"
            showIcon
            className="mb-4"
            message={typeof error === "string" ? error : "Request failed"}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : rules.length === 0 ? (
          <Empty description="No building rules configured yet." />
        ) : filteredRules.length === 0 ? (
          <Empty description="No rules match the selected filters." />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Rule list</p>
              <Tag color="blue">{filteredRules.length} shown</Tag>
            </div>

            {filteredRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <ScrollText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-800">
                          {rule.title || RULE_CODE_LABELS[rule.ruleCode]}
                        </p>
                        <Tag
                          color={rule.status === "ACTIVE" ? "green" : "default"}
                          className="m-0"
                        >
                          {rule.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Tag>
                      </div>
                      <Tag color="blue" className="mt-1.5">
                        {RULE_CODE_LABELS[rule.ruleCode] || rule.ruleCode}
                      </Tag>
                      {rule.description && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {rule.description}
                        </p>
                      )}
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                        <Clock3 size={14} className="text-indigo-500" />
                        {rule.ruleValue || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1">
                    <Button
                      size="small"
                      icon={<Pencil size={14} />}
                      onClick={() => openUpdate(rule)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this building rule?"
                      description="This action cannot be undone."
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                      onConfirm={() =>
                        dispatch(
                          deleteBuildingRuleRequest({
                            buildingId,
                            ruleId: rule.ruleId,
                          }),
                        )
                      }
                    >
                      <Button
                        danger
                        size="small"
                        loading={mutating}
                        icon={<Trash2 size={14} />}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={isFormOpen}
        onCancel={closeForm}
        footer={null}
        centered
        width={580}
        destroyOnClose
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              {editingRule ? <Pencil size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <p className="font-bold text-slate-800">
                {editingRule ? "Update Building Rule" : "Create Building Rule"}
              </p>
              <p className="text-xs font-normal text-slate-500">
                {editingRule
                  ? "Edit title, description, value, or status."
                  : "Add a new regulation for this building."}
              </p>
            </div>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          className="mt-2"
        >
          <Form.Item
            name="ruleCode"
            label="Rule type"
            rules={[{ required: true, message: "Select a rule type." }]}
          >
            <Select
              size="large"
              disabled={Boolean(editingRule)}
              placeholder="Select rule type"
              options={RULE_CODE_OPTIONS}
              onChange={handleRuleCodeChange}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter the rule title." }]}
          >
            <Input
              size="large"
              maxLength={120}
              placeholder="Rule title shown to drivers"
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="Explain the regulation clearly..."
            />
          </Form.Item>

          <div className="mb-2">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Rule value
            </p>
            {renderRuleValueFields()}
          </div>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Select a status." }]}
          >
            <Select
              size="large"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
          </Form.Item>

          <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button onClick={closeForm}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={mutating}>
              {editingRule ? "Save Changes" : "Create Rule"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default BuildingRulesModal;
