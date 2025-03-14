"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function SidebarPM() {
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

  // Regex patterns for path matching
  const isDashboard = /^\/productManager\/dashboard$/.test(pathname);
  const isProductDetails = /^\/productManager\/product-details\/\w+$/.test(
    pathname
  );
  const isTRLLevel = /^\/productManager\/product-details\/\w+\/\w+$/.test(
    pathname
  );

  // Extract product ID from the path (for TRL Level navigation)
  const pathSegments = pathname.split("/");
  const productId = pathSegments[pathSegments.length - 2];

  const handleGoToProductDetails = () => {
    if (isTRLLevel && productId) {
      // Go back to product details using product ID
      router.push(`/productManager/product-details/${productId}`);
    } else {
      // Navigate normally if already in product details
      router.push(`/productManager/product-details/${productId || "default-id"}`);
    }
  };

  return (
    <div className="min-w-[180px] max-w-[240px] flex-shrink-0 border-r bg-white flex flex-col">
      <div className="p-4 space-y-2">
        {/* Dashboard */}
        {(isDashboard || isProductDetails || isTRLLevel) && (
          <div
            className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
              pathname === "/productManager/dashboard"
                ? "bg-primary text-white"
                : "bg-white text-black border hover:bg-secondary"
            }`}
            onClick={() => router.push("/productManager/dashboard")}
          >
            Dashboard
          </div>
        )}

        {/* Product Details */}
        {(isProductDetails || isTRLLevel) && (
          <div
            className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
              /^\/productManager\/product-details\/\w+$/.test(pathname)
                ? "bg-primary text-white"
                : "bg-white text-black border hover:bg-secondary"
            }`}
            onClick={handleGoToProductDetails}
            // onClick={() =>
            //   router.push(`/productManager/product-details/${"id"}`)
            // } // Replace `"id"` with actual ID if needed
          >
            Product Details
          </div>
        )}

        {/* TRL Levels */}
        {isTRLLevel && (
          <div
            className="px-3 py-2 text-sm text-center rounded-md cursor-pointer bg-primary text-white"
            onClick={() =>
              router.push(`/productManager/product-details/${"id"}/${"trl-id"}`)
            } // Replace `"id"` and `"trl-id"` with actual IDs if needed
          >
            TRL Level
          </div>
        )}
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
