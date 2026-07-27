import { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";

// Đảm bảo đường dẫn import action này chính xác với project của bạn
import { updateVehicleTypeRequest } from "../../../redux/manager/Vehicle/updateVehicleType/updateVehicleTypeSlice";
import { getVehicleTypeListRequest } from "../../../redux/manager/Building/getVehicleTypeList/getVehicleTypeListSlice";

const UpdateVehicleTypeModal = ({ visible, onClose, initialData }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Lấy trạng thái loading từ store
  const { loading } = useSelector((state) => state.updateVehicleType || {});

  // Tự động điền dữ liệu cũ vào form mỗi khi Modal mở lên (dựa vào initialData)
  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        typeName: initialData.typeName,
        sizeCategory: initialData.sizeCategory,
        description: initialData.description,
      });
    } else {
      form.resetFields();
    }
  }, [visible, initialData, form]);

  const handleFinish = (values) => {
    // values chứa { typeName, sizeCategory, description }
    // initialData chứa vehicleTypeId cũ
    const payload = {
      vehicleTypeId: initialData.vehicleTypeId,
      ...values,
    };

    // Gọi action update
    dispatch(updateVehicleTypeRequest(payload));

    // Đóng modal
    onClose();

    // Làm mới danh sách sau nửa giây (để chờ API update chạy xong)
    setTimeout(() => {
      dispatch(getVehicleTypeListRequest());
    }, 500);
  };

  return (
    <Modal
      title="Update Vehicle Type"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <Form.Item
          label="Type Name"
          name="typeName"
          rules={[
            { required: true, message: "Please input the vehicle type name!" },
          ]}
        >
          <Input placeholder="e.g., SUV, Sedan, Motorbike..." />
        </Form.Item>

        <Form.Item
          label="Size Category"
          name="sizeCategory"
          rules={[
            { required: true, message: "Please select a size category!" },
          ]}
        >
          <Select placeholder="Select size category">
            <Select.Option value="SMALL">SMALL</Select.Option>
            <Select.Option value="MEDIUM">MEDIUM</Select.Option>
            <Select.Option value="LARGE">LARGE</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input a description!" }]}
        >
          <Input.TextArea rows={3} placeholder="e.g., 7-seat SUV" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateVehicleTypeModal;
