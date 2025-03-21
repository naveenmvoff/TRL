"use client";

import { useState } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";


export default function LoginForm() {
  const { data: sessionData } = useSession();
  console.log("Session: ", sessionData);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Prevent multiple submissions
    if (isLoading) return;

    setIsLoading(true);

    try {
      
      console.log("Requesting login...");
      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      console.log("Response", res);

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      if (res?.ok) {
        console.log("Response OK");

        // Wait longer and force session refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        const session = await getSession();

        switch (session?.user.role) {
          case "Admin":
            router.push("/admin/product-management");
            break;
          case "Product Manager":
            router.push("/productManager/dashboard");
            break;
          case "Stakeholders":
            router.push("/stakeholder/produ-overview");
            break;
          default:
            setError("Invalid user role");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E7F3] flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] rounded-3xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-center text-2xl font-bold text-blue-600 mb-6">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              placeholder="Email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
