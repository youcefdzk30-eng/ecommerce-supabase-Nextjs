"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  Heart,
  ShoppingCart,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem("dmt-store-wishlist") || "[]",
      ) as string[];
      setIsWishlisted(savedWishlist.includes(String(product.product_id)));
    } catch {
      setIsWishlisted(false);
    }
  }, [product.product_id]);

  const handleProductClick = () => {
    router.push(`/products/${product.product_id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted((prev) => {
      const nextValue = !prev;
      try {
        const savedWishlist = JSON.parse(
          localStorage.getItem("dmt-store-wishlist") || "[]",
        ) as string[];
        const productId = String(product.product_id);
        const updatedWishlist = nextValue
          ? [...new Set([...savedWishlist, productId])]
          : savedWishlist.filter((id) => id !== productId);
        localStorage.setItem(
          "dmt-store-wishlist",
          JSON.stringify(updatedWishlist),
        );
      } catch {
        // Ignore storage issues gracefully.
      }
      return nextValue;
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/products/${product.product_id}`);
  };

  const ratingSeed = product.product_id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rating = 4.2 + ((ratingSeed % 8) / 10);
  const reviewCount = 28 + (ratingSeed % 240);
  const originalPrice =
    typeof product.price_before === "number" && product.price_before > product.price
      ? product.price_before
      : null;
  const isOnSale = Boolean(originalPrice);

  const renderStars = () =>
    Array.from({ length: 5 }, (_, index) => {
      const filled = index < Math.round(rating);
      return (
        <Star
          key={index}
          className={`h-3 w-3 ${
            filled ? "fill-amber-400 text-amber-400" : "text-slate-600"
          }`}
        />
      );
    });

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))] shadow-[0_20px_45px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-[0_22px_55px_rgba(59,130,246,0.22)]"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/4.3] overflow-hidden">
        {isOnSale && (
          <div className="absolute top-3 left-3 z-20">
            <div className="flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200 backdrop-blur-sm">
              <Zap className="h-3 w-3" />
              Sale
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={handleWishlist}
            className={`rounded-full border p-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
              isWishlisted
                ? "border-rose-400/40 bg-rose-500/20 text-rose-200"
                : "border-white/10 bg-slate-950/55 text-slate-200 hover:border-sky-400/30 hover:text-sky-200"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>

        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            width={400}
            height={420}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.2),transparent_40%),linear-gradient(135deg,#0f172a,#111827)]">
            <div className="text-center text-slate-300">
              <Sparkles className="mx-auto mb-2 h-7 w-7 text-sky-300" />
              <span className="text-xs font-medium uppercase tracking-[0.2em]">
                No Image
              </span>
            </div>
          </div>
        )}

        <div
          className={`absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent p-4 transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex w-full items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleQuickView}
              className="h-9 rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15"
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              View
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="h-9 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 shadow-lg shadow-sky-500/20 hover:brightness-110"
            >
              <ShoppingCart className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
              {product.stock} left
            </div>
          </div>
        )}
      </div>

      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">{renderStars()}</div>
          <span className="text-[11px] text-slate-400">
            {rating.toFixed(1)} · {reviewCount} reviews
          </span>
        </div>

        <div>
          <h3 className="line-clamp-1 text-base font-bold text-white transition-colors duration-200 group-hover:text-sky-200">
            {product.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">
            {product.description || "Premium quality product with exceptional features."}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white">
              ${product.price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {isOnSale && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Save ${(originalPrice! - product.price).toFixed(0)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200">
            Free Ship
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
            30-Day
          </span>
        </div>

        <Button
          className="mt-1 h-10 w-full rounded-full bg-gradient-to-r from-slate-100 to-sky-200 text-slate-950 shadow-lg shadow-sky-500/10 hover:brightness-110"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? "Out of Stock" : "Add to cart"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
