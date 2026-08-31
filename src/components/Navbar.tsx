"use client";
import { ShoppingCart, Moon, Sun, User, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
      <div className="mx-4 flex h-20 items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10" />
          <Link href="/" className="flex cursor-pointer items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-sky-500 to-slate-300 text-lg font-black text-white shadow-lg shadow-blue-500/25">
              D
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">DMT STORE</h1>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">premium market</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.1rem] w-[1.1rem]" />
            ) : (
              <Moon className="h-[1.1rem] w-[1.1rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              onClick={() => router.push("/profile")}
            >
              <User className="h-[1.1rem] w-[1.1rem]" />
              <span className="sr-only">Profile</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              onClick={() => router.push("/signup")}
            >
              <LogIn className="h-[1.1rem] w-[1.1rem]" />
              <span className="sr-only">Sign in</span>
            </Button>
          )}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-gradient-to-r from-sky-500/15 to-blue-500/10 text-slate-100 hover:border-sky-400/40 hover:bg-sky-500/10"
            >
              <ShoppingCart className="h-[1.1rem] w-[1.1rem]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-[10px] font-bold text-slate-950 shadow-md shadow-blue-500/30">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
