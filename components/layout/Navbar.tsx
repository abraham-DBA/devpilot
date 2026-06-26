"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { GitBranch, LogOut, User, FolderGit2 } from "lucide-react";

type Props = {
  userName: string;
  userRole: string;
};

export function Navbar({ userName, userRole }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.refresh();
      router.replace("/");
    } catch (err) {
      console.error("Sign out failure:", err);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Projects", href: "/dashboard" }, // In Phase 1, Projects list resides on dashboard
    { name: "Profile", href: "/dashboard" }, // Fallback mappings for Phase 1
  ];

  const getRoleLabel = (role: string) => {
    if (role === "developer") return "Developer";
    if (role === "team_lead") return "Team Lead";
    if (role === "project_manager") return "Manager";
    return "";
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-surface border-b border-border flex items-center justify-between px-6 md:px-12">
      {/* Brand logo */}
      <Link href="/dashboard" className="flex items-center gap-3 group">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/15 group-hover:scale-105 transition-transform">
          <GitBranch className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-text-black group-hover:text-accent transition-colors">
          DevFlow
        </span>
      </Link>

      {/* Navigation center items */}
      <nav className="flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* User Info tag */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-text-primary">{userName}</span>
          {userRole && (
            <span className="text-[10px] font-bold text-accent bg-accent-muted border border-accent-light px-1.5 py-0.25 rounded-md mt-0.5 uppercase tracking-wide">
              {getRoleLabel(userRole)}
            </span>
          )}
        </div>

        {/* Separator line */}
        <div className="h-8 w-px bg-border hidden sm:block"></div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="h-9 w-9 rounded-lg border border-border bg-surface text-text-secondary hover:text-error hover:bg-error-light hover:border-error-light flex items-center justify-center transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
