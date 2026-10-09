"use client";

import { ToastProvider } from "./ToastProvider";
import { UserProvider } from "./UserProvider";

// Start loading the Lottie player right away (used by the loading screen and mascots).
if (typeof window !== "undefined") void import("lottie-react");

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <UserProvider>{children}</UserProvider>
    </ToastProvider>
  );
}
