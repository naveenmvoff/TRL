"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function admin() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>ProductManager</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}
