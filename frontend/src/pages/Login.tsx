import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const {setUser} = useAuth();

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL_USER}/login`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Something went wrong!");
        setMessage(data.message || "Something went wrong!");
        setFormData({ username: "", password: "" });
      } else {
        toast.success("Logged in successfully!");
        setUser(data.data.user); // backend returns user in data.data.user
        localStorage.setItem("user", JSON.stringify(data.data.user));
        window.location.href = "/";
      }
    } catch (error) {
      console.error(error);
      setMessage("Network error. Please try again.");
      setFormData({ username: "", password: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-center">🔑 Login</h2>

        {/* Show error/success message */}
        {message && (
          <div className="mt-2 mb-4 text-sm text-center text-red-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
