import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AppNav from "@/components/AppNav";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <AppNav />
    </div>
  );
}
