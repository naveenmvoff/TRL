import toast from "react-hot-toast";

type NotifyType = "success" | "error" | "info" | "warning";

import { ToastPosition } from "react-hot-toast";

interface NotifyOptions {
  duration?: number;
  position?: ToastPosition;
}

export default function notify(
  message: string,
  type: NotifyType = "info",
  options?: NotifyOptions
) {

  const defaultOptions: NotifyOptions = {
    duration: 4000,
    position: "top-center",
  };

  const configs = {
    success: { icon: "✅" },
    error: { icon: "❌" },
    info: { icon: "ℹ️" },
    warning: { icon: "⚠️" },
  };

  return toast(message, {
    ...defaultOptions,
    ...options,
    ...configs[type],
    style: {
      background: type === "error" ? "#FEE2E2" : "#FFFFFF",
      color: type === "error" ? "#DC2626" : "#000000",
    },
  });
}

// Usage example:
// notify("Operation successful!", "success");
// notify("Something went wrong!", "error");
// notify("Please wait...", "info");