import { Modal, Form, DatePicker, Button, Typography } from "antd";
import { CalendarDays, Clock, AlertCircle } from "lucide-react";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const BookingModal = ({
    open,
    onClose,
    selectedVehicle,
    selectedSlot,
    form,
    createLoading,
    onSubmit,
    operatingStartTime,
    operatingEndTime,
    operatingHoursDisplay,
}) => {
    // Format operating times for display (e.g. "06:00:00" -> "06:00")
    const startDisplay = operatingStartTime?.slice(0, 5);
    const endDisplay = operatingEndTime?.slice(0, 5);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={520}
            destroyOnHidden
            title={
                <div className="border-b pb-4 mb-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <CalendarDays size={16} />
                        </div>
                        <Title level={4} className="!mb-0 !text-slate-800">
                            Book Parking Slot
                        </Title>
                    </div>
                    <Text className="text-slate-500 text-sm font-normal">
                        Confirm your vehicle details and select your reservation period.
                    </Text>
                </div>
            }
        >
            {/* Vehicle Info */}
            {selectedVehicle && selectedSlot && (
                <div className="mb-5 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Reservation Details
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Slot */}
                        <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Slot</p>
                            <p className="text-lg font-extrabold text-blue-600">
                                {selectedSlot.slotName}
                            </p>
                            <p className="text-xs text-slate-500">{selectedSlot.zoneName} · {selectedSlot.floorName}</p>
                        </div>

                        {/* Vehicle plate */}
                        <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Plate Number</p>
                            <p className="text-sm font-extrabold font-mono text-slate-800">
                                {selectedVehicle.plateNumber}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">{selectedVehicle.vehicleColor} · {selectedVehicle.vehicleTypeName}</p>
                        </div>

                        {/* Brand & Model */}
                        <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Vehicle</p>
                            <p className="text-sm font-bold text-slate-800">
                                {selectedVehicle.brand} {selectedVehicle.model}
                            </p>
                        </div>

                        {/* Building */}
                        <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Building</p>
                            <p className="text-xs font-semibold text-slate-700 leading-snug">
                                {selectedSlot.buildingName}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Operating Hours Notice */}
            {operatingStartTime && operatingEndTime && (
                <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <Clock size={16} className="text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-amber-700">
                            Operating Hours: {operatingHoursDisplay || `${startDisplay} - ${endDisplay}`}
                        </p>
                        <p className="text-[11px] text-amber-600 mt-0.5">
                            Reservations must start within building operating hours.
                        </p>
                    </div>
                </div>
            )}

            {/* Date Form */}
            <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
                <Form.Item
                    name="reservationStart"
                    label={
                        <div className="flex items-center justify-between w-full">
                            <span className="font-semibold text-slate-700">
                                Start Time <span className="text-red-500">*</span>
                            </span>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                    form.setFieldsValue({
                                        reservationStart: dayjs(),
                                    });
                                }}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 p-0 h-auto"
                            >
                                <Clock size={12} /> Set to Now
                            </Button>
                        </div>
                    }
                    rules={[
                        { required: true, message: "Please select reservation start time!" },
                        {
                            validator(_, value) {
                                if (!value) return Promise.resolve();
                                if (value.isBefore(dayjs().subtract(5, "minute"))) {
                                    return Promise.reject("Start time cannot be in the past.");
                                }
                                // Validate against building operating hours
                                if (operatingStartTime && operatingEndTime) {
                                    const [startH, startM] = operatingStartTime.split(":").map(Number);
                                    const [endH, endM] = operatingEndTime.split(":").map(Number);
                                    const selectedMinutes = value.hour() * 60 + value.minute();
                                    const opStart = startH * 60 + startM;
                                    const opEnd = endH * 60 + endM;

                                    if (selectedMinutes < opStart || selectedMinutes >= opEnd) {
                                        return Promise.reject(
                                            `Start time must be within operating hours (${startDisplay} - ${endDisplay}).`
                                        );
                                    }
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <DatePicker
                        showTime={{ format: "HH:mm" }}
                        format="YYYY-MM-DD HH:mm"
                        className="w-full"
                        size="large"
                        disabledDate={(current) => current && current < dayjs().startOf("day")}
                        placeholder="Select start date & time"
                    />
                </Form.Item>

                <div className="flex justify-end gap-3 pt-2 border-t mt-4">
                    <Button
                        size="large"
                        onClick={onClose}
                        className="rounded-xl font-medium px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={createLoading}
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl font-medium px-6 shadow-md"
                    >
                        Confirm Reservation
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default BookingModal;
