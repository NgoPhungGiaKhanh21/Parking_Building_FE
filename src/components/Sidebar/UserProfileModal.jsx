import { useEffect, useState } from "react";
import { Modal, Tabs, Form, Input, Button, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getProfileUserRequest } from "../../redux/profileUser/getProfileUserSlice";
import { changePasswordRequest } from "../../redux/changePassword/changePasswordSlice";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Activity,
  KeyRound,
  Shield,
} from "lucide-react";

const formatRole = (role) => {
  const roleNames = {
    ROLE_ADMIN: "Admin",
    ROLE_DRIVER: "Driver",
    ROLE_STAFF: "Staff",
    ROLE_MANAGER: "Manager",
  };
  return roleNames[role] || role || "N/A";
};

const InfoRow = ({ icon: Icon, label, value, isStatus }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 transition-all hover:bg-gray-50 hover:shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
        <Icon className="h-4 w-4 text-indigo-500" />
      </div>
      <span className="text-[13px] font-medium text-gray-500">{label}</span>
    </div>
    <div className="text-sm font-semibold text-gray-800">
      {isStatus ? (
        <span
          className={`rounded-md px-2.5 py-1 text-xs tracking-wide ${
            value === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {value || "N/A"}
        </span>
      ) : (
        value || "N/A"
      )}
    </div>
  </div>
);

const UserProfileModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");

  // BIẾN CỜ: Xác định xem người dùng có đang thực hiện đổi pass không
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getProfileUser, loading: profileLoading } = useSelector(
    (state) => state.getProfileUser,
  );

  const { loading: passwordLoading, error } = useSelector(
    (state) => state.changePassword,
  );

  useEffect(() => {
    if (isOpen) {
      dispatch(getProfileUserRequest());
      setTimeout(() => setActiveTab("1"), 0);
      setIsSubmitting(false);
    } else {
      form.resetFields();
    }
  }, [isOpen, dispatch, form]);

  // LOGIC ĐÓNG MODAL ĐÃ ĐƯỢC SỬA LẠI
  useEffect(() => {
    if (isSubmitting) {
      if (!passwordLoading && !error) {
        form.resetFields();
        setIsSubmitting(false);
        onClose(); // Đóng Modal
      } else if (!passwordLoading && error) {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, passwordLoading, error, form, onClose]);

  const onFinishChangePassword = (values) => {
    setIsSubmitting(true);
    dispatch(
      changePasswordRequest({
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
      }),
    );
  };

  const items = [
    {
      key: "1",
      label: <span className="px-2 font-medium">Profile Information</span>,
      children: (
        <Spin spinning={profileLoading}>
          <div className="py-2">
            <div className="mb-6 flex flex-col items-center justify-center">
              <div className="mb-3 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[3px] shadow-lg">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border-2 border-white">
                  <User
                    className="h-10 w-10 text-indigo-400"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {getProfileUser?.fullName || "N/A"}
              </h3>
              <span className="mt-1.5 inline-block rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                {formatRole(getProfileUser?.role)}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <InfoRow
                icon={User}
                label="Username"
                value={getProfileUser?.username}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={getProfileUser?.email}
              />
              <InfoRow
                icon={Phone}
                label="Phone Number"
                value={getProfileUser?.phoneNumber}
              />
              <InfoRow
                icon={ShieldCheck}
                label="Role Permission"
                value={formatRole(getProfileUser?.role)}
              />
              <InfoRow
                icon={Activity}
                label="Account Status"
                value={getProfileUser?.status}
                isStatus
              />
            </div>
          </div>
        </Spin>
      ),
    },
    {
      key: "2",
      label: <span className="px-2 font-medium">Change Password</span>,
      children: (
        <div className="py-4">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <KeyRound className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Update Security</h3>
            <p className="text-sm text-gray-500">
              Ensure your account is using a long, random password to stay
              secure.
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinishChangePassword}
            requiredMark={false}
          >
            <Form.Item
              label={
                <span className="text-sm font-semibold text-gray-600">
                  Current Password
                </span>
              }
              name="oldPassword"
              rules={[
                { required: true, message: "Please input current password!" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter current password"
                className="rounded-lg px-3 py-2"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-sm font-semibold text-gray-600">
                  New Password
                </span>
              }
              name="newPassword"
              rules={[
                { required: true, message: "Please input new password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter new password"
                className="rounded-lg px-3 py-2"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-sm font-semibold text-gray-600">
                  Confirm New Password
                </span>
              }
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The new passwords do not match!"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Confirm new password"
                className="rounded-lg px-3 py-2"
              />
            </Form.Item>

            <Form.Item className="mt-8 mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={passwordLoading}
                className="h-11 w-full rounded-xl border-none bg-gradient-to-r from-indigo-500 to-purple-500 text-[15px] font-semibold shadow-md shadow-indigo-200 transition-all hover:scale-[1.01] hover:from-indigo-600 hover:to-purple-600"
              >
                Update Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          <span className="text-lg font-bold text-gray-800">User Settings</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      width={480}
      className="custom-user-modal"
      style={{ top: 20 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={items}
        tabBarStyle={{ marginBottom: 24, borderBottom: "1px solid #f3f4f6" }}
      />
    </Modal>
  );
};

export default UserProfileModal;
