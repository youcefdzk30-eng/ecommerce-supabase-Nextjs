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

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  return (
    <nav className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/60 z-60 w-full border-b backdrop-blur-xl">
      <div className="mx-4 flex h-20 items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="hover:bg-muted/50 rounded-full transition-colors duration-200" />
          <Link href="/" className="flex cursor-pointer items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-sky-500 to-slate-300 text-lg font-black text-white shadow-lg shadow-blue-500/20">
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
              <span className="sr-only">{user ? "Profile" : "Sign in"}</span>
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
              className="relative h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              <ShoppingCart className="h-[1.1rem] w-[1.1rem]" />
              {totalItems > 0 && (
                <span className="bg-gradient-to-r from-blue-500 to-slate-300 text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
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
