import { Suspense } from "react";
import ClientProducts from "@/components/ClientProducts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Sparkles, Star } from "lucide-react";

const highlights = [
  { label: "Free Shipping", value: "On orders +$50" },
  { label: "Secure Payments", value: "Protected checkout" },
  { label: "Top Rated", value: "4.9/5 customer reviews" },
];

const categories = [
  "Electronics",
  "Clothing",
  "Accessories",
  "New Collections",
];

const featureCollections = [
  {
    name: "Audio & Tech",
    description: "Premium sound, smart gear, and everyday productivity upgrades.",
    accent: "from-sky-500/25 to-blue-600/10",
    cta: "Shop gadgets",
  },
  {
    name: "Style Essentials",
    description: "Clean silhouettes and elevated basics built for modern routines.",
    accent: "from-violet-500/25 to-fuchsia-600/10",
    cta: "View fashion",
  },
  {
    name: "Travel Picks",
    description: "Compact, useful accessories to keep your setup organized and ready.",
    accent: "from-cyan-500/25 to-emerald-500/10",
    cta: "Explore accessories",
  },
];

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <section className="hero-shell rounded-[28px] border border-white/10 p-6 shadow-2xl shadow-violet-950/30 sm:p-8 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium Shopping
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                    Elevate your lifestyle with <span className="gradient-text">DMT STORE</span>
                  </h1>
                  <p className="max-w-xl text-base text-slate-300 sm:text-lg">
                    Discover curated essentials in electronics, fashion, and accessories designed for performance, comfort, and style.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#products"
                    className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-slate-950"
                  >
                    Shop now
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/signin"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-violet-400/40 hover:bg-white/10"
                  >
                    Sign in
                  </a>
                </div>

                <div className="grid gap-3 pt-2 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.label} className="stat-card rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                      <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-blue-500/25 via-slate-500/20 to-transparent blur-3xl" />
                <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
                  <div className="rounded-[22px] bg-gradient-to-br from-blue-500 via-sky-500 to-slate-300 p-[1px] shadow-2xl shadow-blue-900/30">
                    <div className="rounded-[22px] bg-slate-950/90 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Featured</div>
                          <div className="mt-1 text-lg font-semibold text-white">Smart Deals</div>
                        </div>
                        <div className="rounded-full bg-blue-500/15 p-2 text-blue-200">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-slate-300">This week</div>
                              <div className="mt-1 text-3xl font-black text-white">30% OFF</div>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-3 text-sky-200">
                              <Star className="h-6 w-6 fill-current" />
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <Truck className="mb-2 h-5 w-5 text-sky-300" />
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Delivery</div>
                            <div className="mt-1 text-sm font-medium text-white">Fast & secure</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <ShieldCheck className="mb-2 h-5 w-5 text-blue-300" />
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Trust</div>
                            <div className="mt-1 text-sm font-medium text-white">Protected checkout</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 flex flex-wrap items-center gap-3">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-200 shadow-sm"
              >
                {category}
              </span>
            ))}
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {featureCollections.map((collection) => (
              <Link
                key={collection.name}
                href="#products"
                className={`group block rounded-[28px] border border-white/10 bg-gradient-to-br ${collection.accent} p-[1px] shadow-xl shadow-slate-950/20 transition hover:-translate-y-1`}
              >
                <div className="flex h-full flex-col justify-between rounded-[27px] bg-slate-950/85 p-5">
                  <div>
                    <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                      Featured
                    </div>
                    <h3 className="text-2xl font-bold text-white">{collection.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {collection.description}
                    </p>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-300">
                    {collection.cta}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </section>

          <div id="products" className="mt-8 space-y-4 py-4">
            <Suspense
              fallback={
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
                </div>
              }
            >
              <ClientProducts />
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
