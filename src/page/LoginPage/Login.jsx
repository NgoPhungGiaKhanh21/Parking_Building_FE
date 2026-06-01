import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "../../redux/auth/authSlice";
import { Link, useNavigate } from "react-router";
import Header from "../Home/Header";
import { jwtDecode } from "jwt-decode";

import { Form, Input, Button } from "antd";

import pic6 from "../../assets/pic/pic7.jpg";
import pic8 from "../../assets/pic/pic9.jpg";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const { token, loading } = useSelector((state) => state.auth);

  const handleLogin = (values) => {
    dispatch(loginRequest(values));
  };

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        const userRole = decodedToken.role;

        switch (userRole) {
          case "ROLE_DRIVER":
            navigate("/driver");
            break;
          case "ROLE_MANAGER":
            navigate("/manager");
            break;
          case "ROLE_STAFF":
            navigate("/staff");
            break;
          case "ROLE_ADMIN":
            navigate("/admin");
            break;
          default:
            navigate("/");
            break;
        }
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        navigate("/");
      }
    }
  }, [token, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      {/* BACKGROUND */}
      <img
        src={pic8}
        alt=""
        className="fixed inset-0 -z-10 h-full w-full object-cover opacity-80"
      />

      <Header />

      {/* CONTAINER */}
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border shadow-2xl md:grid md:grid-cols-2">
        {/* LEFT SIDE - LOGIN FORM */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center bg-white p-10 md:p-14"
        >
          {/* TITLE */}
          <div className="mb-10">
            <h1 className="text-center text-4xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-3 text-center text-slate-500">
              Login to your Parking Manager account
            </p>
          </div>

          {/* FORM */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            requiredMark={false}
          >
            {/* USERNAME */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter your Email!",
                },
              ]}
            >
              <Input
                size="large"
                prefix={<Mail size={18} className="text-slate-400" />}
                placeholder="Enter your Gmail"
                className="rounded-xl py-2"
              />
            </Form.Item>

            {/* PASSWORD */}
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password!",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters!",
                },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<Lock size={18} className="text-slate-400" />}
                placeholder="Enter your password"
                className="rounded-xl py-2"
              />
            </Form.Item>

            {/* BUTTON */}
            <Form.Item className="mb-0 mt-6">
              <Button
                htmlType="submit"
                loading={loading}
                type="primary"
                size="large"
                className="h-14 w-full rounded-xl !bg-blue-600 text-base font-semibold hover:!bg-blue-500"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* FOOTER */}
          <p className="mt-8 text-center text-slate-500">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>

        {/* RIGHT SIDE - IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block"
        >
          <img
            src={pic6}
            alt="Parking"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
