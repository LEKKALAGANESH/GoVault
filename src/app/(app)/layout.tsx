import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("[GoVault] Failed to get user in app layout:", error instanceof Error ? error.message : error);
    redirect("/login?error=service_unavailable&message=Unable+to+verify+authentication");
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <AppHeader user={user} />
      <main className="pb-20">{children}</main>
    </div>
  );
}
