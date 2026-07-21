import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Tag,
} from "antd";
import {
  Clock3,
  Pencil,
  Plus,
  ScrollText,
  Trash2,
} from "lucide-react";
import {
  createBuildingRuleRequest,
  deleteBuildingRuleRequest,
  getBuildingRulesRequest,
  resetBuildingRuleMutation,
  updateBuildingRuleRequest,
} from "../../../../redux/manager/Building/buildingRules/buildingRulesSlice";

const { TextArea } = Input;

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
  NO_OVERNIGHT: "Example: 22:00-06:00",
  MAX_PARKING_HOURS: "Enter the maximum number of hours, for example: 24",
  OPERATING_HOURS: "Example: 06:00-23:00",
  VEHICLE_TYPE_CURFEW: "Format: TypeName:HH:mm, for example: Truck:22:00",
};

const BuildingRulesModal = ({ open, building, onCancel }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const selectedRuleCode = Form.useWatch("ruleCode", form);

  const {
    rulesByBuilding,
    loadingByBuilding,
    mutating,
    mutationSuccess,
    error,
  } = useSelector((state) => state.buildingRules);

  const buildingId = building?.id || building?.buildingId;
  const rules = useMemo(
    () =>
      buildingId && Array.isArray(rulesByBuilding[buildingId])
        ? rulesByBuilding[buildingId]
        : [],
    [buildingId, rulesByBuilding],
  );

  useEffect(() => {
    if (open && buildingId) {
      dispatch(getBuildingRulesRequest(buildingId));
    }
  }, [buildingId, dispatch, open]);

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
    form.setFieldsValue({ status: "ACTIVE" });
    setIsFormOpen(true);
  };

  const openUpdate = (rule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      ruleCode: rule.ruleCode,
      title: rule.title,
      description: rule.description,
      ruleValue: rule.ruleValue,
      status: rule.status || "ACTIVE",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (values) => {
    if (editingRule) {
      dispatch(
        updateBuildingRuleRequest({
          buildingId,
          ruleId: editingRule.ruleId,
          data: {
            title: values.title.trim(),
            description: values.description?.trim() || "",
            ruleValue: values.ruleValue.trim(),
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
          ruleValue: values.ruleValue.trim(),
          status: values.status,
        },
      }),
    );
  };

  const closeMainModal = () => {
    closeForm();
    onCancel();
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={closeMainModal}
        footer={null}
        width={760}
        title={`Building Rules · ${building?.name || "Building"}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
          <div>
            <p className="font-semibold text-slate-800">
              Parking regulations
            </p>
            <p className="text-xs text-slate-500">
              Manager view includes both active and inactive rules.
            </p>
          </div>
          <Button type="primary" icon={<Plus size={15} />} onClick={openCreate}>
            Create Rule
          </Button>
        </div>

        {error && (
          <Alert
            type="error"
            showIcon
            className="mb-4"
            message={typeof error === "string" ? error : "Request failed"}
          />
        )}

        {loadingByBuilding[buildingId] ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : rules.length === 0 ? (
          <Empty description="No building rules configured" />
        ) : (
          <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
            {rules.map((rule) => (
              <div
                key={rule.ruleId}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <ScrollText size={19} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-800">
                          {rule.title || RULE_CODE_LABELS[rule.ruleCode]}
                        </p>
                        <Tag color={rule.status === "ACTIVE" ? "green" : "default"}>
                          {rule.status || "ACTIVE"}
                        </Tag>
                      </div>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        {RULE_CODE_LABELS[rule.ruleCode] || rule.ruleCode}
                      </p>
                      {rule.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {rule.description}
                        </p>
                      )}
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                        <Clock3 size={14} className="text-slate-400" />
                        {rule.ruleValue || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="small"
                      icon={<Pencil size={14} />}
                      onClick={() => openUpdate(rule)}
                    />
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
                      />
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
        title={editingRule ? "Update Building Rule" : "Create Building Rule"}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="ruleCode"
            label="Rule Type"
            rules={[{ required: true, message: "Select a rule type." }]}
          >
            <Select
              disabled={Boolean(editingRule)}
              placeholder="Select rule type"
              options={RULE_CODE_OPTIONS}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter the rule title." }]}
          >
            <Input maxLength={120} placeholder="Rule title shown to drivers" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="Explain the regulation clearly..."
            />
          </Form.Item>

          <Form.Item
            name="ruleValue"
            label="Rule Value"
            extra={RULE_VALUE_HELP[selectedRuleCode]}
            rules={[{ required: true, message: "Enter the rule value." }]}
          >
            <Input placeholder={RULE_VALUE_HELP[selectedRuleCode]} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Select a status." }]}
          >
            <Select
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={closeForm}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={mutating}>
              {editingRule ? "Update Rule" : "Create Rule"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default BuildingRulesModal;
