"use client";

import { Suspense } from "react";
import LoginForm from "@/components/login";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
