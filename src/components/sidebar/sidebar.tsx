"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";


export default function Sidebar() {
  
  const { data: session, status } = useSession();


  const router = useRouter();
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
        router.replace("/");
    }
}, [status, router]);


  const handleSignOut = async () => {
          try {
              await signOut({
                  redirect: true,
                  // callbackUrl: "/"
              });
          } catch (error) {
              console.error("Error signing out:", error);
          }
      };



  return (
    <div className="w-50 min-h-[calc(100vh-4rem)] border-r flex flex-col">
      <div className="p-4 space-y-2">
        <div
          className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
            pathname === "/admin/product-management" ? "bg-primary text-white" : "bg-white text-black border hover:bg-secondary"
          }`}
          onClick={() => router.push("/admin/product-management")}
        >
          Product Management
        </div>

        <div
          className={`px-3 py-2 text-sm text-center rounded-md cursor-pointer ${
            pathname === "/admin/user-management" ? "bg-primary text-white" : "bg-white text-black border hover:bg-secondary"
          }`}
          onClick={() => router.push("/admin/user-management")}
        >
          User Management
        </div>
      </div>
      <div className="mt-auto p-4 ">
        <button onClick={() => setShowPopup(true)}
        className="w-2/3 text-center px-3 py-2 text-sm font-medium text-white bg-red1 border hover:bg-red2 rounded-md"  >
          Log Out
        </button>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p className="flex justify-center text-black pb-4">Are you sure you want to logout?</p>
                <div className="flex justify-center gap-4">
                    <button 
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary2"
                    > Cancel
                    </button>
                    <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red1 text-white rounded-md hover:bg-red2"
                    >Log Out</button>
                </div>
            </div>
        </div>
      )}



    </div>
  );
}