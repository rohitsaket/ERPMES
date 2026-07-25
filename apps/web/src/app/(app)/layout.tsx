export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceView } from "@/components/workspace/workspace-view";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // We ignore Next.js page children completely to enforce a Single-Page App
  // WorkspaceView handles rendering the appropriate components in tabs based on the URL.
  return (
    <AppShell>
      <WorkspaceView />
    </AppShell>
  );
}
