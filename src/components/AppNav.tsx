"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, MessageCircleHeart, Send, LogOut } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/ucapan", label: "Ucapan", icon: MessageCircleHeart },
  { href: "/sebar", label: "Sebar", icon: Send },
] as const;

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-[var(--red)] bg-black">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 px-2 py-3 text-sm transition ${
                active ? "bg-[var(--red)] font-semibold text-white" : "text-white/70 hover:text-white"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              {tab.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center gap-1 px-2 py-3 text-sm text-white/70 transition hover:text-white"
        >
          <LogOut size={20} strokeWidth={1.75} />
          Keluar
        </button>
      </div>
    </nav>
  );
}
