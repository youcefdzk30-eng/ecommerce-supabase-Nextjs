import { supabase } from "@/lib/supabase/client";
import { ProductType } from "@/types";

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  price_before?: number;
  image?: string;
  images?: string[];
  colors?: string[];
  stock: number;
  sku?: string;
  category_id?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  updated_at?: string;
}

export interface ProductWithDetails extends ProductType {
  category?: {
    id: number;
    name: string;
  };
  total_reviews?: number;
  average_rating?: number;
}

/**
 * Admin service for product management
 * Requires admin privileges for all operations
 */
const buildProductPayload = (productData: Partial<CreateProductData> | UpdateProductData) => {
  const payload: Record<string, unknown> = {
    ...(productData.title !== undefined ? { title: productData.title } : {}),
    ...(productData.description !== undefined ? { description: productData.description } : {}),
    ...(productData.price !== undefined ? { price: productData.price } : {}),
    ...(productData.price_before !== undefined ? { price_before: productData.price_before } : {}),
    ...(productData.image !== undefined ? { image: productData.image } : {}),
    ...(productData.images !== undefined ? { images: productData.images } : {}),
    ...(productData.colors !== undefined ? { colors: productData.colors } : {}),
    ...(productData.stock !== undefined ? { stock: productData.stock } : {}),
    ...(productData.sku !== undefined ? { sku: productData.sku } : {}),
    ...(productData.category_id !== undefined ? { category_id: productData.category_id } : {}),
    updated_at: new Date().toISOString(),
  };

  return payload;
};

const runReviewsQuery = async (product: any) => {
  const reviewCandidateFields: Array<"product_id" | "id"> = ["product_id", "id"];

  for (const field of reviewCandidateFields) {
    const productId = product?.[field] ?? product?.product_id ?? product?.id;
    if (!productId) continue;

    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq(field === "id" ? "product_id" : "product_id", productId);

    if (!error) return data || [];
    if (error.code !== "42703") break;
  }

  return [];
};

export const adminProductService = {
  /**
   * Get all products with additional details for admin view
   */
  async getAllProducts(): Promise<ProductWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
					*,
					categories!products_category_id_fkey (
						id,
						name
					)
				`,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }

      const productsWithStats = await Promise.all(
        (data || []).map(async (product) => {
          const reviewStats = await runReviewsQuery(product);
          const totalReviews = reviewStats.length;
          const averageRating =
            totalReviews > 0
              ? reviewStats.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          return {
            ...product,
            category: product.categories,
            total_reviews: totalReviews,
            average_rating: Number(averageRating.toFixed(1)),
          };
        }),
      );

      return productsWithStats;
    } catch (err) {
      console.error("Failed to get all products:", err);
      throw err;
    }
  },

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductData): Promise<ProductType> {
    try {
      const payload = {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        ...(productData.price_before !== undefined ? { price_before: productData.price_before } : {}),
        ...(productData.image ? { image: productData.image } : {}),
        ...(productData.images && productData.images.length > 0 ? { images: productData.images } : {}),
        ...(productData.colors && productData.colors.length > 0 ? { colors: productData.colors } : {}),
        stock: productData.stock,
        ...(productData.sku ? { sku: productData.sku } : {}),
        ...(productData.category_id !== undefined ? { category_id: productData.category_id } : {}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create product:", err);
      throw err;
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    productId: string,
    productData: UpdateProductData,
  ): Promise<ProductType> {
    try {
      const payload = buildProductPayload(productData);
      const attempts: Array<"product_id" | "id"> = ["product_id", "id"];

      for (const field of attempts) {
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq(field, productId)
          .select()
          .single();

        if (!error) return data;
        if (error.code !== "42703" && error.code !== "42P01") {
          throw error;
        }
      }

      throw new Error("Failed to update product: product identifier not found");
    } catch (err) {
      console.error("Failed to update product:", err);
      throw err;
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const attempts: Array<"product_id" | "id"> = ["product_id", "id"];

      for (const field of attempts) {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq(field, productId);

        if (!error) return true;
        if (error.code !== "42703" && error.code !== "42P01") {
          throw error;
        }
      }

      return false;
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw err;
    }
  },

  /**
   * Update product stock
   */
  async updateStock(productId: string, newStock: number): Promise<ProductType> {
    try {
      const payload = {
        stock: newStock,
        updated_at: new Date().toISOString(),
      };

      const attempts: Array<"product_id" | "id"> = ["product_id", "id"];

      for (const field of attempts) {
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq(field, productId)
          .select()
          .single();

        if (!error) return data;
        if (error.code !== "42703" && error.code !== "42P01") {
          throw error;
        }
      }

      throw new Error("Failed to update product stock: product identifier not found");
    } catch (err) {
      console.error("Failed to update product stock:", err);
      throw err;
    }
  },

  /**
   * Get products with low stock (below threshold)
   */
  async getLowStockProducts(threshold: number = 10): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lt("stock", threshold)
        .order("stock", { ascending: true });

      if (error) {
        console.error("Error fetching low stock products:", error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get low stock products:", err);
      return [];
    }
  },

  /**
   * Get product analytics data
   */
  async getProductAnalytics() {
    try {
      // Get total products count
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Get products by category
      const { data: categoryCounts } = await supabase.from("products").select(`
					category_id,
					categories!products_category_id_fkey (
						name
					)
				`);

      // Count products by category
      const categoryStats = (categoryCounts || []).reduce<
        Record<string, number>
      >((acc, product) => {
        const categoryName = (() => {
          const cat = (product as { categories?: unknown }).categories;
          if (Array.isArray(cat)) {
            return (cat[0] as { name?: string }).name ?? "Uncategorized";
          }
          return (cat as { name?: string } | null)?.name ?? "Uncategorized";
        })();

        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      // Get low stock count
      const { count: lowStockCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("stock", 10);

      // Get total inventory value
      const { data: products } = await supabase
        .from("products")
        .select("price, stock");

      const totalInventoryValue = (products || []).reduce(
        (sum, product) => sum + product.price * product.stock,
        0,
      );

      return {
        totalProducts: totalProducts || 0,
        categoryStats,
        lowStockCount: lowStockCount || 0,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      };
    } catch (err) {
      console.error("Failed to get product analytics:", err);
      return {
        totalProducts: 0,
        categoryStats: {},
        lowStockCount: 0,
        totalInventoryValue: 0,
      };
    }
  },

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    updates: Array<{ productId: string; data: UpdateProductData }>,
  ): Promise<boolean> {
    try {
      const promises = updates.map(({ productId, data }) =>
        this.updateProduct(productId, data),
      );

      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error("Failed to bulk update products:", err);
      throw err;
    }
  },
};
