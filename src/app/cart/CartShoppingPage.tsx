"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ShoppingSkeleton from "@/components/ShoppingSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function CartShoppingPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, isLoading } =
    useCart();
  const { user } = useAuth();

  if (isLoading) {
    return <ShoppingSkeleton />;
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6 flex items-center">
          <Link href="/" className="text-primary flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shopping
          </Link>
          <h1 className="ml-4 text-3xl font-bold">Your Shopping Cart</h1>
        </div>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to be logged in to view your cart.</p>
            <Link href="/signin">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sky-300 transition hover:text-sky-200">
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </span>
          </Link>
        </div>
        <div className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
          DMT STORE
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-300">
            Your cart
          </p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Shopping bag
          </h1>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
          {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-700/80 bg-slate-900/70 p-10 text-center shadow-2xl shadow-slate-950/30">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-sky-500/50 bg-sky-500/10 text-sky-200">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">Your cart is empty</h2>
          <p className="mb-8 text-slate-300">
            Add a few premium essentials and build your order.
          </p>
          <Link href="/">
            <Button className="cursor-pointer rounded-full bg-sky-500 px-6 text-white hover:bg-sky-400">
              <Sparkles className="mr-2 h-4 w-4" />
              Explore products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.product_id} className="overflow-hidden border-slate-700/80 bg-slate-900/75 shadow-xl shadow-slate-950/20">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-4 sm:w-40">
                    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
                      <Image
                        src={item.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"}
                        alt={item.title}
                        width={160}
                        height={160}
                        className="h-32 w-full object-cover sm:h-40"
                      />
                    </div>
                  </div>
                  <CardContent className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="mb-2 text-xl font-bold text-white">
                          {item.title}
                        </CardTitle>
                        <p className="line-clamp-2 text-sm text-slate-300">
                          {item.description}
                        </p>
                      </div>
                      <p className="text-xl font-black text-sky-300">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-full border border-slate-700 bg-slate-950/60 p-1">
                        <Button
                          type="button"
                          className="h-9 w-9 rounded-full border-0 bg-transparent text-slate-200 hover:bg-slate-800"
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(item.product_id, -1);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-10 text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          className="h-9 w-9 rounded-full border-0 bg-transparent text-slate-200 hover:bg-slate-800"
                          onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(item.product_id, 1);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromCart(item.product_id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="border-slate-700/80 bg-slate-900/75 shadow-xl shadow-slate-950/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Shipping</span>
                  <span>$5.99</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-4 text-lg font-bold text-white">
                  <span>Total</span>
                  <span>${(subtotal + 5.99).toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full cursor-pointer rounded-full bg-sky-500 text-white hover:bg-sky-400">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full cursor-pointer border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800">
                    Continue shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
