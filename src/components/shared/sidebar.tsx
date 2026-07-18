"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Radar,
  ShieldAlert,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = React.memo(function Sidebar({ className, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Privacy Scan", href: "/dashboard/scan", icon: Radar },
    { label: "Removal Center", href: "/dashboard/removal", icon: ShieldAlert },
    { label: "Reports Archive", href: "/dashboard/reports", icon: FileText },
    { label: "Feedback Admin", href: "/dashboard/admin", icon: MessageSquare },
    { label: "MYRAH AI & Roadmap", href: "/dashboard/roadmap", icon: Sparkles },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "fixed md:sticky top-0 left-0 z-30 h-screen border-r border-border bg-card flex flex-col justify-between py-6 px-4 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Shield className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight text-foreground transition-opacity duration-200">
                privora
              </span>
            )}
          </Link>

          {/* Desktop Toggle Arrow */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5 pt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className={cn(isActive && "text-primary")} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="space-y-4">
        <div className="border-t border-border pt-4">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : "PR"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="truncate flex-1">
                <p className="text-sm font-semibold text-foreground leading-none">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Ashwak"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  {user?.email || "ashwak@gmail.com"}
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
          }}
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg justify-start px-3 cursor-pointer",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="ml-3 text-sm">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
