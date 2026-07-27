import { useEffect, useState } from "react";
import { Modal, Tabs, Form, Input, Button, Spin, Upload, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getProfileUserRequest } from "../../redux/profileUser/getProfileUserSlice";
import { changePasswordRequest } from "../../redux/changePassword/changePasswordSlice";
import { updateProfileUserRequest } from "../../redux/updateProfileUser/updateProfileUserSlice";
import {
  User,
  ShieldCheck,
  Activity,
  KeyRound,
  Shield,
  Camera,
  Edit2, // Icon dùng cho nút edit
} from "lucide-react";

// Hàm format role
const formatRole = (role) => {
  const roleNames = {
    ROLE_ADMIN: "Admin",
    ROLE_DRIVER: "Driver",
    ROLE_STAFF: "Staff",
    ROLE_MANAGER: "Manager",
  };
  return roleNames[role] || role || "N/A";
};

// Component InfoRow dành cho những field KHÔNG được sửa (Role, Status)
const InfoRowReadOnly = ({ icon: Icon, label, value, isStatus }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 mt-2">
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

  const [passwordForm] = Form.useForm();
  const [profileForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState("1");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // BIẾN CỜ CHO TAB PROFILE
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Quản lý chế độ View/Edit
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false); // Quản lý loading lúc Submit

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const { getProfileUser, loading: profileLoading } = useSelector(
    (state) => state.getProfileUser,
  );

  const { loading: passwordLoading, error: passwordError } = useSelector(
    (state) => state.changePassword,
  );

  // Lấy thêm error từ state update để handle đóng modal chính xác
  const { loading: updateLoading, error: updateError } = useSelector(
    (state) => state.updateProfileUser,
  );

  // 1. Reset Modal khi mở/đóng
  useEffect(() => {
    if (isOpen) {
      dispatch(getProfileUserRequest());
      setTimeout(() => setActiveTab("1"), 0);
      setIsSubmittingPassword(false);
      setIsSubmittingProfile(false);
      setIsEditingProfile(false); // Luôn bắt đầu ở chế độ chỉ xem
      setAvatarFile(null);
      setPreviewAvatar(null);
    } else {
      passwordForm.resetFields();
      profileForm.resetFields();
    }
  }, [isOpen, dispatch, passwordForm, profileForm]);

  // 2. Nạp data cũ vào form
  useEffect(() => {
    if (getProfileUser && isOpen) {
      profileForm.setFieldsValue({
        fullName: getProfileUser.fullName,
        email: getProfileUser.email,
        phoneNumber: getProfileUser.phoneNumber,
        username: getProfileUser.username,
      });
      if (getProfileUser.avatarUrl) {
        setPreviewAvatar(getProfileUser.avatarUrl);
      }
    }
  }, [getProfileUser, isOpen, profileForm]);

  // 3. Logic đóng Modal khi UPDATE PROFILE thành công
  useEffect(() => {
    if (isSubmittingProfile) {
      if (!updateLoading && !updateError) {
        setIsSubmittingProfile(false);
        setIsEditingProfile(false); // Trả về chế độ xem
        onClose(); // Lưu thành công -> Đóng Modal
      } else if (!updateLoading && updateError) {
        setIsSubmittingProfile(false); // Lỗi thì giữ nguyên để người dùng xem lỗi
      }
    }
  }, [isSubmittingProfile, updateLoading, updateError, onClose]);

  // 4. Logic đóng Modal khi CHANGE PASSWORD thành công
  useEffect(() => {
    if (isSubmittingPassword) {
      if (!passwordLoading && !passwordError) {
        passwordForm.resetFields();
        setIsSubmittingPassword(false);
        onClose();
      } else if (!passwordLoading && passwordError) {
        setIsSubmittingPassword(false);
      }
    }
  }, [
    isSubmittingPassword,
    passwordLoading,
    passwordError,
    passwordForm,
    onClose,
  ]);

  const onFinishUpdateProfile = (values) => {
    setIsSubmittingProfile(true); // Bật cờ submit
    const formData = new FormData();

    formData.append("fullName", values.fullName || "");
    formData.append("email", values.email || "");
    formData.append("phoneNumber", values.phoneNumber || "");

    if (avatarFile) {
      formData.append("avatarUrl", avatarFile);
    }

    dispatch(updateProfileUserRequest(formData));
  };

  const onFinishChangePassword = (values) => {
    setIsSubmittingPassword(true);
    dispatch(
      changePasswordRequest({
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
      }),
    );
  };

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewAvatar(objectUrl);
    return false;
  };

  // Hàm Hủy Edit (Khôi phục dữ liệu gốc)
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setAvatarFile(null);
    setPreviewAvatar(getProfileUser?.avatarUrl || null);
    profileForm.setFieldsValue({
      fullName: getProfileUser.fullName,
      email: getProfileUser.email,
      phoneNumber: getProfileUser.phoneNumber,
    });
  };

  const items = [
    {
      key: "1",
      label: <span className="px-2 font-medium">Profile Information</span>,
      children: (
        <Spin spinning={profileLoading || updateLoading}>
          <div className="py-2">
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={onFinishUpdateProfile}
              requiredMark={false}
            >
              <div className="mb-6 flex flex-col items-center justify-center relative">
                <div
                  className={`mb-2 rounded-full p-[3px] shadow-lg relative ${isEditingProfile ? "bg-gradient-to-tr from-indigo-500 to-purple-500 cursor-pointer group" : "bg-slate-200"}`}
                >
                  <Upload
                    name="avatar"
                    showUploadList={false}
                    beforeUpload={handleBeforeUpload}
                    accept="image/*"
                    disabled={!isEditingProfile} // Chặn upload nếu không trong chế độ edit
                  >
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white border-2 border-white relative">
                      {previewAvatar ? (
                        <img
                          src={previewAvatar}
                          alt="avatar"
                          className={`h-full w-full object-cover ${isEditingProfile ? "transition-opacity group-hover:opacity-60" : ""}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                            e.target.className = "hidden";
                            e.target.nextSibling.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <User
                        className={`h-10 w-10 text-indigo-400 ${previewAvatar ? "hidden" : ""} ${isEditingProfile ? "transition-opacity group-hover:opacity-60" : ""}`}
                        strokeWidth={1.5}
                      />
                      {/* Chỉ hiện camera hover khi đang edit */}
                      {isEditingProfile && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                          <Camera className="h-6 w-6 text-gray-800" />
                        </div>
                      )}
                    </div>
                  </Upload>
                </div>
                {/* Ẩn text hướng dẫn nếu đang ở chế độ xem */}
                <div
                  className={`text-xs transition-all ${isEditingProfile ? "text-gray-400" : "text-transparent"}`}
                >
                  Click avatar to change
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2">
                <Form.Item
                  label={
                    <span className="text-xs font-semibold text-gray-500">
                      Full Name
                    </span>
                  }
                  name="fullName"
                  className="mb-3"
                  rules={[
                    { required: true, message: "Please input full name!" },
                  ]}
                >
                  <Input
                    placeholder="Enter full name"
                    readOnly={!isEditingProfile}
                    className={`rounded-lg px-3 py-2 transition-colors ${
                      !isEditingProfile
                        ? "bg-slate-100/70 border-slate-200 text-slate-900 font-medium cursor-default focus:shadow-none hover:border-slate-200"
                        : "bg-white text-slate-800"
                    }`}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-xs font-semibold text-gray-500">
                      Phone Number
                    </span>
                  }
                  name="phoneNumber"
                  className="mb-3"
                >
                  <Input
                    placeholder="Enter phone number"
                    readOnly={!isEditingProfile}
                    className={`rounded-lg px-3 py-2 transition-colors ${
                      !isEditingProfile
                        ? "bg-slate-100/70 border-slate-200 text-slate-900 font-medium cursor-default focus:shadow-none hover:border-slate-200"
                        : "bg-white text-slate-800"
                    }`}
                  />
                </Form.Item>
              </div>

              <Form.Item
                label={
                  <span className="text-xs font-semibold text-gray-500">
                    Email
                  </span>
                }
                name="email"
                className="mb-3"
                rules={[
                  { required: true, message: "Please input email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  placeholder="Enter email"
                  readOnly={!isEditingProfile}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    !isEditingProfile
                      ? "bg-slate-100/70 border-slate-200 text-slate-900 font-medium cursor-default focus:shadow-none hover:border-slate-200"
                      : "bg-white text-slate-800"
                  }`}
                />
              </Form.Item>

              {/* Username: Luôn luôn read-only (Không cho sửa) */}
              <Form.Item
                label={
                  <span className="text-xs font-semibold text-gray-500">
                    Username
                  </span>
                }
                name="username"
                className="mb-2"
              >
                <Input
                  readOnly
                  className="rounded-lg px-3 py-2 bg-slate-100/70 border-slate-200 text-slate-900 font-medium cursor-not-allowed hover:border-slate-200 focus:shadow-none"
                />
              </Form.Item>

              <div className="mb-6 flex flex-col gap-1">
                <InfoRowReadOnly
                  icon={ShieldCheck}
                  label="Role Permission"
                  value={formatRole(getProfileUser?.role)}
                />
                <InfoRowReadOnly
                  icon={Activity}
                  label="Account Status"
                  value={getProfileUser?.status}
                  isStatus
                />
              </div>

              <Form.Item className="mb-0">
                {!isEditingProfile ? (
                  // Nút chuyển sang chế độ EDIT
                  <Button
                    type="primary"
                    onClick={(e) => {
                      e.preventDefault(); // Ngăn submit form
                      setIsEditingProfile(true);
                    }}
                    size="large"
                    icon={<Edit2 size={16} />}
                    className="h-10 w-full rounded-xl border-none bg-slate-800 hover:bg-slate-700 text-[14px] font-semibold shadow-md transition-all"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  // Các nút hành động khi đang ở chế độ EDIT
                  <div className="flex items-center gap-3">
                    <Button
                      size="large"
                      onClick={handleCancelEdit}
                      disabled={updateLoading}
                      className="h-10 flex-1 rounded-xl font-semibold border-slate-200 text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={updateLoading}
                      className="h-10 flex-1 rounded-xl border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-[14px] font-semibold shadow-md transition-all hover:scale-[1.01]"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </Form.Item>
            </Form>
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
            form={passwordForm}
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
      destroyOnHidden
      centered
      width={520}
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
