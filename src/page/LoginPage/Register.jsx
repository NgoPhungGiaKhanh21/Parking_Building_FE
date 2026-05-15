import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerRequest } from "../../redux/auth/authSlice";
import { useNavigate } from "react-router";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, registerSuccess } = useSelector((state) => state.auth);
  useEffect(() => {
    if (registerSuccess) {
      navigate("/");
    }
  }, [registerSuccess, navigate]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(registerRequest(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-[400px] bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Username</label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Full Name</label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
