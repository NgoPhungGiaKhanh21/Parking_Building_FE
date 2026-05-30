import { motion } from "framer-motion";
import { User, Lock, BadgePlus } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerRequest } from "../../redux/auth/authSlice";
import { Link, useNavigate } from "react-router";
import Header from "../Home/Header";

import { Form, Input, Button } from "antd";

import pic10 from "../../assets/pic/pic10.jpg";
import pic11 from "../../assets/pic/pic11.jpg";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, registerSuccess } = useSelector((state) => state.auth);

  const [form] = Form.useForm();

  useEffect(() => {
    if (registerSuccess) {
      navigate("/");
    }
  }, [registerSuccess, navigate]);

  const handleSubmit = (values) => {
    dispatch(registerRequest(values));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden pt-25">
      {/* BACKGROUND */}
      <img
        src={pic11}
        alt=""
        className="fixed inset-0 -z-10 h-full w-full object-cover opacity-70"
      />

      <Header />

      <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-3xl border md:grid md:grid-cols-2">
        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden bg-slate-50 md:block"
        >
          <img
            src={pic10}
            alt="Parking"
            className="h-full w-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center bg-white p-10 md:p-14"
        >
          <div className="mb-10">
            <h1 className="text-center text-4xl font-bold text-slate-900">
              Create Account
            </h1>

            <p className="mt-3 text-center text-slate-500">
              Register your Parking Manager account
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: "Please enter your full name!",
                },
              ]}
            >
              <Input size="large" placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              label="Gmail"
              name="gmail"
              rules={[
                {
                  required: true,
                  message: "Please enter gmail!",
                },
                {
                  type: "email",
                  message: "Invalid gmail format!",
                },
              ]}
            >
              <Input size="large" placeholder="Enter gmail" />
            </Form.Item>
            <div className="flex gap-4">
              <Form.Item
                label="Username"
                name="userName"
                rules={[
                  {
                    required: true,
                    message: "Please enter username!",
                  },
                ]}
                className="w-[50%] "
              >
                <Input size="large" placeholder="Enter username" />
              </Form.Item>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter phone number!",
                  },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Phone must be 10 digits!",
                  },
                ]}
                className="w-[50%] "
              >
                <Input size="large" placeholder="Enter phone number" />
              </Form.Item>
            </div>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter password!",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters!",
                },
              ]}
            >
              <Input.Password size="large" placeholder="Enter password" />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password size="large" placeholder="Confirm password" />
            </Form.Item>

            <Form.Item>
              <Button
                htmlType="submit"
                loading={loading}
                type="primary"
                size="large"
                className="w-full"
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {/* FOOTER */}
          <p className="mt-8 text-center text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
