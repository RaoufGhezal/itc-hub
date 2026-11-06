"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import AuthDialog, { type AuthMode } from "./AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { toast } from "sonner";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
];

const avatarColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
];

const getAvatarColor = (email: string) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { setOpen: setChatOpen } = useChat();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogout = async () => {
    await logout().catch(() => {});
    setChatOpen(false);
    toast.success("Logged out");
    router.push("/");
  };

  const initial = user
    ? (user.fullName?.trim()[0] ?? user.email[0]).toUpperCase()
    : "";

  return (
    <header className="w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex cursor-pointer items-center gap-4 sm:gap-8">
          <Link href="/">
            <Image
              src="/itc-logo-CtU1N5t0.png"
              alt="ITC Logo"
              width={500}
              height={500}
              className="h-auto w-[100px] sm:w-[130px]"
            />
          </Link>

          <ul className="hidden cursor-pointer items-center gap-7 md:flex">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm transition-colors duration-200 hover:text-red-500 ${
                    pathname === href ? "text-red-500" : "text-white"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account"
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-white outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-white/40 ${getAvatarColor(user.email)}`}
              >
                {initial}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-neutral-800 bg-neutral-950 text-white"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate text-sm text-white">
                        {user.fullName}
                      </span>
                      <span className="truncate text-xs text-neutral-500">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-800" />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-500 focus:bg-white/10 focus:text-red-500"
                    onClick={handleLogout}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden cursor-pointer text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                onClick={() => openAuth("login")}
              >
                Login
              </Button>
              <Button
                className="cursor-pointer"
                onClick={() => openAuth("register")}
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </header>
  );
}
