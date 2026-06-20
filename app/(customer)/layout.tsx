import { CustomerNav } from "@/components/layout/CustomerNav";
import { requireUser } from "@/lib/auth";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-[100dvh]">
      <CustomerNav user={{ id: user.id, email: user.email, fullName: user.fullName, role: user.role }} />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:pb-12">{children}</main>
    </div>
  );
}
