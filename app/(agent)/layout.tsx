import { AgentNav } from "@/components/layout/AgentNav";
import { requireAgent } from "@/lib/auth";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAgent();
  return (
    <div className="min-h-[100dvh]">
      <AgentNav user={{ id: user.id, email: user.email, fullName: user.fullName, role: user.role }} />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">{children}</main>
    </div>
  );
}
