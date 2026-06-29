import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Tag, Upload, message, Input, Button } from "antd";
import {
    CheckCircle2,
    CreditCard,
    Hash,
    ImageIcon,
    LogOut,
    Search,
    Upload as UploadIcon,
    UserRound,
} from "lucide-react";
import dayjs from "dayjs";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
    getSessionByPlateNumberRequest,
    getSessionByPlateNumberReset,
} from "../../../redux/staff/guest_parking/getSessionByPlateNumber/getSessionByPlateNumberSlice";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import {
    createCheckoutRequest,
    resetCheckout,
} from "../../../redux/staff/parking_session/checkout/createCheckoutSlice";
import {
    GUEST_EXIT_CHECKOUT_DONE_KEY,
    GUEST_EXIT_PAID_KEY,
    GUEST_EXIT_PLATE_KEY,
    isGuestSessionPaid,
    resolveGuestSessionAmount,
} from "../../../utils/guestExitUtils";
import {
    normalizeReservation,
    resolveImageUrl,
} from "../../../utils/reservationSessionUtils";

const formatCurrency = (value) =>
    value != null ? `${Number(value).toLocaleString("vi-VN")}đ` : "—";

const formatDateTime = (value) =>
    value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";

const DetailItem = ({ label, value }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
            {label}
        </p>
        <p className="text-sm font-bold text-slate-800 break-all">{value ?? "—"}</p>
    </div>
);

const SessionImagePanel = ({ label, src, emptyText = "No image" }) => (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
            <ImageIcon size={14} />
            {label}
        </p>
        {src ? (
            <img
                src={src}
                alt={label}
                className="h-52 w-full rounded-lg border border-slate-200 bg-white object-contain"
            />
        ) : (
            <div className="flex h-52 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400">
                {emptyText}
            </div>
        )}
    </div>
);

const VehicleExitGuest = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [plateInput, setPlateInput] = useState("");
    const [checkoutImageUrl, setCheckoutImageUrl] = useState("");
    const [checkoutImageFile, setCheckoutImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [checkoutDone, setCheckoutDone] = useState(
        () => sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) === "true",
    );

    const {
        getSessionByPlateNumber: session,
        loading: sessionLoading,
        error: sessionError,
    } = useSelector((state) => state.getSessionByPlateNumber);
    const { payments } = useSelector((state) => state.getAllPayments);
    const {
        loading: checkoutLoading,
        error: checkoutError,
        checkoutResult,
    } = useSelector((state) => state.createCheckout);

    const showCheckout = searchParams.get("checkout") === "1";
    const isPaid = isGuestSessionPaid(session, payments);
    const amount = resolveGuestSessionAmount(session);

    const normalizedSession = useMemo(
        () => (session ? normalizeReservation(session) : null),
        [session],
    );

    useEffect(() => {
        dispatch(getAllPaymentsRequest());
        if (sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) === "true") {
            dispatch(getSessionByPlateNumberReset());
        }
        return () => {
            dispatch(resetCheckout());
        };
    }, [dispatch]);

    useEffect(() => {
        if (checkoutDone || searchParams.get("checkout") !== "1") return;

        const storedPlate = sessionStorage.getItem(GUEST_EXIT_PLATE_KEY);
        if (!storedPlate) return;

        setPlateInput(storedPlate);
        dispatch(getSessionByPlateNumberRequest({ plateNumber: storedPlate }));
    }, [checkoutDone, dispatch, searchParams]);

    useEffect(() => {
        if (!checkoutResult) return;

        setCheckoutDone(true);
        dispatch(getSessionByPlateNumberReset());
        sessionStorage.setItem(GUEST_EXIT_CHECKOUT_DONE_KEY, "true");
        sessionStorage.removeItem(GUEST_EXIT_PLATE_KEY);
        sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
        setPlateInput("");
        setCheckoutImageUrl("");
        setCheckoutImageFile(null);
        message.success(
            checkoutResult.message || "Guest vehicle checked out successfully.",
        );
        navigate("/staff/guest-checkout", { replace: true });
    }, [checkoutResult, dispatch, navigate]);

    const handleSearch = useCallback(() => {
        const plate = plateInput.trim();
        if (!plate) {
            message.warning("Please enter a license plate number.");
            return;
        }
        dispatch(resetCheckout());
        dispatch(getSessionByPlateNumberReset());
        sessionStorage.removeItem(GUEST_EXIT_CHECKOUT_DONE_KEY);
        sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
        setCheckoutDone(false);
        sessionStorage.setItem(GUEST_EXIT_PLATE_KEY, plate);
        dispatch(getSessionByPlateNumberRequest({ plateNumber: plate }));
    }, [dispatch, plateInput]);

    const handleGoPayment = useCallback(() => {
        if (!session) return;
        sessionStorage.setItem(GUEST_EXIT_PLATE_KEY, session.vehiclePlate || plateInput);
        navigate("/staff/guest-checkout/payment");
    }, [navigate, session, plateInput]);

    const handleConfirmCheckout = useCallback(() => {
        if (!normalizedSession?.ticketCode) return;
        if (!checkoutImageFile) {
            message.error("Please upload check-out image before confirming.");
            return;
        }
        dispatch(
            createCheckoutRequest({
                ticketCode: normalizedSession.ticketCode,
                paymentMethod: "PAYOS",
                checkoutImage: checkoutImageFile,
            }),
        );
    }, [checkoutImageFile, dispatch, normalizedSession]);

    const handleResetAfterCheckout = useCallback(() => {
        dispatch(resetCheckout());
        dispatch(getSessionByPlateNumberReset());
        sessionStorage.removeItem(GUEST_EXIT_CHECKOUT_DONE_KEY);
        sessionStorage.removeItem(GUEST_EXIT_PLATE_KEY);
        sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
        setCheckoutDone(false);
        setPlateInput("");
        setCheckoutImageUrl("");
        setCheckoutImageFile(null);
        navigate("/staff/guest-checkout", { replace: true });
    }, [dispatch, navigate]);

    const sessionErrorMessage =
        typeof sessionError === "string"
            ? sessionError
            : sessionError?.message || null;

    return (
        <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Staff" page="guest-checkout" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600">
            <UserRound size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Guest Vehicle Check Out
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              Search by plate, collect payment, and check out walk-in guests.
            </p>
          </div>
        </div>
      </div>

            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Search size={14} />
                    Search by License Plate
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                        size="large"
                        prefix={<Hash size={16} className="text-slate-400" />}
                        placeholder="e.g. 60A - 14593"
                        value={plateInput}
                        onChange={(e) => setPlateInput(e.target.value)}
                        onPressEnter={handleSearch}
                        className="!font-mono"
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<Search size={16} />}
                        loading={sessionLoading}
                        onClick={handleSearch}
                        className="!font-bold sm:min-w-[140px]"
                    >
                        Search
                    </Button>
                </div>
                {sessionErrorMessage && !checkoutDone && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {sessionErrorMessage}
                    </div>
                )}
            </div>

            {checkoutDone && (
                <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        Check Out Successful
                    </h3>
                    <p className="text-slate-500 mb-6">
                        Guest session completed. You can process the next vehicle.
                    </p>
                    <button
                        type="button"
                        onClick={handleResetAfterCheckout}
                        className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white cursor-pointer"
                    >
                        New Guest Exit
                    </button>
                </div>
            )}

            {!checkoutDone && sessionLoading && !session && (
                <div className="flex justify-center py-16">
                    <Spin size="large" />
                </div>
            )}

            {!checkoutDone && normalizedSession && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                                    Ticket
                                </p>
                                <p className="font-mono text-xl font-black text-emerald-700">
                                    {normalizedSession.ticketCode}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Tag color="blue">{normalizedSession.vehicleTypeName || "Vehicle"}</Tag>
                                <Tag color={isPaid ? "green" : "gold"}>
                                    {isPaid ? "Paid" : "Unpaid"}
                                </Tag>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white mb-5">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">
                                Estimated Fee
                            </p>
                            <p className="text-3xl font-black">{formatCurrency(amount)}</p>
                            <p className="text-xs text-emerald-200 mt-2">
                                Check-in: {formatDateTime(normalizedSession.checkinTime)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                            <DetailItem label="Plate" value={normalizedSession.vehiclePlate} />
                            <DetailItem label="Slot" value={normalizedSession.slotName} />
                            <DetailItem
                                label="Location"
                                value={[normalizedSession.zoneName, normalizedSession.floorName]
                                    .filter(Boolean)
                                    .join(" · ")}
                            />
                            <DetailItem label="Building" value={normalizedSession.buildingName} />
                            {/* <DetailItem label="Guest Name" value={normalizedSession.guestName} />
              <DetailItem label="Guest Phone" value={normalizedSession.guestPhone} />
              <DetailItem label="Brand" value={normalizedSession.brand} />
              <DetailItem label="Model" value={normalizedSession.model} /> */}
                        </div>

                        <SessionImagePanel
                            label="Check-in Image"
                            src={resolveImageUrl(normalizedSession.checkinImageUrl)}
                        />

                        {!isPaid && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleGoPayment}
                                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700 cursor-pointer"
                                >
                                    <CreditCard size={16} />
                                    Payment
                                </button>
                            </div>
                        )}
                    </div>

                    {isPaid && showCheckout && (
                        <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
                                    <LogOut size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        Confirm Check Out
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Upload check-out image and complete guest session.
                                    </p>
                                </div>
                            </div>

                            {checkoutError && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {checkoutError}
                                </div>
                            )}

                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4 grid grid-cols-2 gap-3">
                                <DetailItem label="Guest" value={normalizedSession.guestName || "Walk-in"} />
                                <DetailItem label="Building" value={normalizedSession.buildingName} />
                                <DetailItem label="Slot" value={normalizedSession.slotName} />
                                <DetailItem label="Vehicle Type" value={normalizedSession.vehicleTypeName} />
                                <DetailItem label="Plate" value={normalizedSession.vehiclePlate} />
                                <DetailItem
                                    label="Check-in Time"
                                    value={formatDateTime(normalizedSession.checkinTime)}
                                />
                                <DetailItem label="Total Fee" value={formatCurrency(amount)} />
                                <div className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                                        Payment
                                    </p>
                                    <Tag color="blue">PayOS</Tag>
                                </div>
                            </div>

                            <div className="rounded-xl bg-white border border-slate-200 p-4 mb-5">
                                <p className="text-xs font-semibold uppercase text-slate-500 mb-3">
                                    Session Images
                                </p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
                                    <SessionImagePanel
                                        label="Check-in Image"
                                        src={resolveImageUrl(normalizedSession.checkinImageUrl)}
                                    />

                                    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="mb-2 flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
                                            <UploadIcon size={14} />
                                            Check-out Image <span className="text-red-500">*</span>
                                        </p>
                                        <Upload
                                            name="file"
                                            className="checkout-uploader block w-full [&_.ant-upload]:!block [&_.ant-upload]:!w-full"
                                            showUploadList={false}
                                            customRequest={({ file, onSuccess, onError }) => {
                                                setIsUploading(true);
                                                try {
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        setCheckoutImageUrl(e.target.result);
                                                        setCheckoutImageFile(file);
                                                        setIsUploading(false);
                                                        onSuccess("Ok");
                                                        message.success("Check-out image added");
                                                    };
                                                    reader.onerror = () => {
                                                        setIsUploading(false);
                                                        onError(new Error("Failed to read image"));
                                                        message.error("Failed to add image");
                                                    };
                                                    reader.readAsDataURL(file);
                                                } catch (err) {
                                                    setIsUploading(false);
                                                    onError(err);
                                                    message.error("Failed to add image");
                                                }
                                            }}
                                            beforeUpload={(file) => {
                                                const isImage = file.type.startsWith("image/");
                                                if (!isImage) message.error("You can only upload image files!");
                                                return isImage;
                                            }}
                                        >
                                            {checkoutImageUrl ? (
                                                <img
                                                    src={checkoutImageUrl}
                                                    alt="Vehicle Check-out"
                                                    className="h-52 w-full rounded-lg border border-slate-200 bg-white object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white text-slate-400 transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                                                    {isUploading ? (
                                                        <Spin size="small" />
                                                    ) : (
                                                        <UploadIcon size={22} />
                                                    )}
                                                    <div className="text-xs font-semibold">Click to Upload</div>
                                                    <div className="text-[11px] text-slate-400">JPG, PNG, WEBP</div>
                                                </div>
                                            )}
                                        </Upload>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleConfirmCheckout}
                                    disabled={checkoutLoading || isUploading || !checkoutImageFile}
                                    className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
                                >
                                    {checkoutLoading && <Spin size="small" />}
                                    Confirm Check Out
                                </button>
                            </div>
                        </div>
                    )}

                    {isPaid && !showCheckout && (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-600" size={24} />
                                <div>
                                    <p className="font-bold text-emerald-800">Payment completed</p>
                                    <p className="text-sm text-emerald-600">
                                        Proceed to upload check-out image and complete session.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<LogOut size={16} />}
                                onClick={() => navigate("/staff/guest-checkout?checkout=1")}
                                className="!bg-orange-600 hover:!bg-orange-700 !font-bold"
                            >
                                Start Check Out
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VehicleExitGuest;
