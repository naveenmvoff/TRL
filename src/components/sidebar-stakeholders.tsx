"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Define prop type for the Sidebar component
interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Sidebar({
  // activeSection = "",
  onSectionChange,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = (path: string, section: string) => {
    router.push(path);
    onSectionChange?.(section);
  };

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
    <div className="w-52 min-h-[calc(100vh-4rem)] border-r flex flex-col">
      <div className="p-4 space-y-2">
        <div
          className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
            pathname === "/stakeholder/produ-overview"
              ? "bg-primary text-white"
              : "bg-white text-black border hover:bg-secondary"
          }`}
          onClick={() => handleClick("/stakeholder/produ-overview", "overview")}
        >
          Product overview
        </div>

        <div
          className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
            pathname.startsWith("/stakeholder/product")
              ? "bg-primary text-white"
              : "bg-white text-black border hover:bg-secondary"
          }`}
          onClick={() => handleClick("/stakeholder/product", "products")}
        >
          Product details
        </div>
      </div>
      <div className="mt-auto p-4 ">
        <button
          onClick={() => setShowPopup(true)}
          className="w-full text-center px-3 py-2 text-sm font-medium text-white bg-red1 border hover:bg-red2 rounded-md"
        >
          Log Out
        </button>
      </div>

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
                {" "}
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
