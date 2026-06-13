import { Navigate, useSearchParams } from "react-router-dom";

export const PaymentSuccessReturn = () => {
  const [searchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);
  params.set("result", "success");
  return <Navigate to={`/driver/payment?${params.toString()}`} replace />;
};

export const PaymentCancelReturn = () => {
  const [searchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);
  params.set("result", "cancel");
  return <Navigate to={`/driver/payment?${params.toString()}`} replace />;
};
