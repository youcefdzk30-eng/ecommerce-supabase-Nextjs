"use client";

import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, FilterOptions } from "@/hooks/queries";
import { ProductType } from "@/types";
import { ErrorState } from "@/components/ErrorState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProductFilter } from "@/components/ProductFilter";
import { useState, useMemo } from "react";

// Helper functions (moved from hook to component for simplicity)
const getCategoryId = (categoryName: string): number | null => {
  const categoryMap: { [key: string]: number } = {
    electronics: 3,
    clothing: 1,
    accessories: 2,
  };
  return categoryMap[categoryName] || null;
};

// Sort products based on the selected option
const getProductTitle = (product: ProductType): string => {
  const legacyName = (product as { name?: string } | undefined)?.name;
  return product.title || legacyName || "Untitled Product";
};

const sortProducts = (
  products: ProductType[],
  sortBy: FilterOptions["sortBy"],
) => {
  const sorted = [...products];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) =>
        getProductTitle(a).localeCompare(getProductTitle(b)),
      );
    case "name-desc":
      return sorted.sort((a, b) =>
        getProductTitle(b).localeCompare(getProductTitle(a)),
      );
    default:
      return sorted;
  }
};

const filterProducts = (products: ProductType[], filters: FilterOptions) => {
  let filtered = [...products];

  // Filter by stock (only if not 'all')
  if (filters.stockFilter === "in-stock") {
    filtered = filtered.filter((product) => product.stock > 0);
  } else if (filters.stockFilter === "out-of-stock") {
    filtered = filtered.filter((product) => product.stock === 0);
  }
  // When stockFilter is 'all', show all products regardless of stock

  // Filter by category (only if not 'all')
  if (filters.categoryFilter !== "all") {
    const categoryId = getCategoryId(filters.categoryFilter);
    if (categoryId !== null) {
      filtered = filtered.filter(
        (product) => product.category_id === categoryId,
      );
    }
  }
  // When categoryFilter is 'all', show all categories

  return filtered;
};

export default function ClientProducts() {
  // const { user } = useAuth(); // user is not used in this component
  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch: retry,
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "default",
    stockFilter: "all",
    categoryFilter: "all",
  });

  // Process products with search, filters, and sorting
  //useMemo is used to memoize the function
  const processedProducts = useMemo(() => {
    if (!products) return [];

    // Start with all products
    let processed = [...products];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const normalizedSearch = searchTerm.toLowerCase();
      processed = processed.filter((product) => {
        const title = (getProductTitle(product) || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        return title.includes(normalizedSearch) || description.includes(normalizedSearch);
      });
    }

    // Apply filters
    processed = filterProducts(processed, filters);

    // Apply sorting
    processed = sortProducts(processed, filters.sortBy);

    return processed;
  }, [products, searchTerm, filters]);

  return (
    <ErrorBoundary>
      <>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 rounded-[26px] border border-slate-700/80 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
                Curated collection
              </span>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Best sellers and daily essentials
              </h2>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="rounded-full border border-slate-600 bg-slate-800/80 px-3 py-1.5">
                {products?.length || 0} products
              </div>
              <div className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-blue-200">
                New arrivals
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-xl"
        >
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border-slate-700 bg-slate-900/70 text-white placeholder:text-slate-400"
          />
        </motion.div>

        <ProductFilter filters={filters} onFilterChange={setFilters} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900/60 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-700/80 p-4 sm:flex-row"
        >
          <div className="text-slate-300 flex items-center gap-2 text-sm">
            <span>
              Showing {processedProducts.length} of {products?.length || 0}{" "}
              products
            </span>
          </div>

          {/* Reset Filters Button */}
          {(filters.sortBy !== "default" ||
            filters.stockFilter !== "all" ||
            filters.categoryFilter !== "all" ||
            searchTerm.trim() !== "") && (
            <button
              onClick={() => {
                setFilters({
                  sortBy: "default",
                  stockFilter: "all",
                  categoryFilter: "all",
                });
                setSearchTerm("");
              }}
              className="rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
            >
              Reset All Filters
            </button>
          )}
        </motion.div>

        {/* Products grid */}
        <div className="py-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[200px] items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="border-primary h-8 w-8 rounded-full border-t-2 border-b-2"
                />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorState
                  title="Failed to load products"
                  description="We couldn't load the products. Please try again."
                  onRetry={retry}
                  error={error}
                  type="network"
                />
              </motion.div>
            ) : processedProducts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorState
                  title={
                    (products?.length || 0) === 0
                      ? "No products available"
                      : "No products match your filters"
                  }
                  description={
                    (products?.length || 0) === 0
                      ? "No products are currently available. Please check back later."
                      : searchTerm.trim() !== ""
                        ? "Try a different search term or adjust your filters."
                        : "Try adjusting your filters to see more products."
                  }
                  showRetry={false}
                  type="not-found"
                />
                {(products?.length || 0) > 0 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        setFilters({
                          sortBy: "default",
                          stockFilter: "all",
                          categoryFilter: "all",
                        });
                        setSearchTerm("");
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="products"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence>
                  {processedProducts.map((product, index) => (
                    <motion.div
                      key={product.product_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                      }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    </ErrorBoundary>
  );
}
