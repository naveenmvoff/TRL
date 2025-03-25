"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Default role is Admin
  const role = "Admin";

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
        role, // Always Admin
      });

      console.log("Signup Success: ", res.data);
      router.push("/"); // Redirect to login after signup
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Signup error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E7F3] flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] rounded-3xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-center text-2xl font-bold text-blue-600 mb-6">
          Admin Signup
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              name="name"
              placeholder="Full Name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <button
          onClick={() => router.push("/")}
          className="mt-4 w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-400 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}
