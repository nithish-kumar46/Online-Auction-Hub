import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [data, setData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/api/register", data);
      alert("Registered successfully!");
      window.location.href = "/login";
    } catch {
      alert("Error registering");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border">

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Create Account
        </h2>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded-lg border focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded-lg border focus:ring-2 focus:ring-purple-400 outline-none"
        />

        {/* PASSWORD FIELD WITH ICON */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-400 outline-none"
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
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:scale-105 transition"
        >
          Register
        </button>

        <p className="text-gray-600 text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-purple-500 hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}