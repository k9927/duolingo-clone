import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
