import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/login", data);
      localStorage.setItem("user", JSON.stringify(res.data));
      window.location.href = "/";
    } catch {
      alert("Invalid login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border">

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Welcome Back
        </h2>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* PASSWORD FIELD WITH ICON */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:scale-105 transition"
        >
          Login
        </button>

        <p className="text-gray-600 text-center mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>

      </div>
    </div>
  );
}