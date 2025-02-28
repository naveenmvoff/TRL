"use client";

import { signOut } from "next-auth/react";

export default function admin() {
  
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
    <div>
      <h1>ProductManager</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}
