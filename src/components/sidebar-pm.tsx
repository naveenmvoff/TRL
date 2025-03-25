"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Simplified props interface - removed unused props

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: true,
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-w-[180px] max-w-[240px] flex-shrink-0 border-r bg-white flex flex-col">
      <div className="p-4 space-y-2">
        <div
          className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
            pathname.startsWith("/productManager/product-details/") ||
            pathname === "/productManager/dashboard"
              ? "bg-primary text-white"
              : "bg-white text-black border hover:bg-secondary"
          }`}
          onClick={() => router.push("/productManager/dashboard")}
        >
          Products
        </div>

        <div
          className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
            pathname.startsWith("/productManager/all-product-overview/") ||
            pathname === "/productManager/all-product-overview"
              ? "bg-primary text-white"
              : "bg-white text-black border hover:bg-secondary"
          }`}
          onClick={() => router.push("/productManager/all-product-overview")}
        >
          Products overview
        </div>

        <div
          className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
            pathname.startsWith("/productManager/all-product-details") ||
            pathname === "/productManager/product-overview"
              ? "bg-primary text-white"
              : "bg-white text-black border hover:bg-secondary"
          }`}
          onClick={() => router.push("/productManager/all-product-details")}
        >
          Products details
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-auto p-4">
        <button
          onClick={() => setShowPopup(true)}
          className="w-full text-center px-3 py-2 text-sm font-medium text-white bg-red1 border hover:bg-red2 rounded-md"
        >
          Log Out
        </button>
      </div>

      {/* Logout Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="flex justify-center text-black pb-4">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red1 text-white rounded-md hover:bg-red2"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
