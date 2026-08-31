"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import {
  adminCategoryService,
  CreateCategoryData,
  UpdateCategoryData,
} from "@/services/admin/adminCategoryService";
import { CategoryType } from "@/types";
import {
  Edit,
  FolderPlus,
  Layers3,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const cardGradients = [
  "from-sky-500/15 via-blue-500/10 to-cyan-400/5",
  "from-violet-500/15 via-purple-500/10 to-fuchsia-400/5",
  "from-emerald-500/15 via-teal-500/10 to-cyan-400/5",
  "from-amber-500/15 via-orange-500/10 to-yellow-400/5",
  "from-pink-500/15 via-rose-500/10 to-red-400/5",
  "from-indigo-500/15 via-sky-500/10 to-blue-400/5",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminCategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const handleCreate = async (data: CreateCategoryData) => {
    try {
      await adminCategoryService.createCategory(data);
      toast.success("Category created");
      await fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async (data: CreateCategoryData) => {
    if (!editingCategory) return;

    try {
      await adminCategoryService.updateCategory(
        editingCategory.id,
        data as UpdateCategoryData,
      );
      toast.success("Category updated");
      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (category: CategoryType) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;

    try {
      await adminCategoryService.deleteCategory(category.id);
      toast.success("Category deleted");
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(9,12,24,0.96))] p-6 shadow-2xl shadow-slate-950/25 sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_40%,rgba(255,255,255,0.02))]" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              store structure
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Categories
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
                Create and manage all storefront sections with a premium, organized catalog system.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</span>
              <Layers3 className="h-4 w-4 text-sky-300" />
            </div>
            <div className="mt-3 text-3xl font-black text-white">{categories.length}</div>
            <p className="mt-1 text-sm text-slate-300">Active sections</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</span>
              <FolderPlus className="h-4 w-4 text-violet-300" />
            </div>
            <div className="mt-3 text-3xl font-black text-white">{categories.length > 0 ? "Live" : "New"}</div>
            <p className="mt-1 text-sm text-slate-300">Catalog visibility</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Layout</span>
              <PencilLine className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-3 text-3xl font-black text-white">Premium</div>
            <p className="mt-1 text-sm text-slate-300">Admin experience</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category, index) => (
          <Card
            key={category.id}
            className={`group relative overflow-hidden border border-white/10 bg-gradient-to-br ${cardGradients[index % cardGradients.length]} p-[1px] shadow-xl shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:shadow-sky-500/10`}
          >
            <div className="h-full rounded-[22px] bg-slate-950/85 p-5 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                  <p className="mt-1 text-sm text-sky-200/90">
                    /{category.slug || category.name.toLowerCase().replace(/\s+/g, "-")}
                  </p>
                </div>
                <Badge className="rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-200">
                  #{category.id}
                </Badge>
              </div>

              <p className="mt-4 min-h-12 text-sm leading-6 text-slate-300">
                {category.description || "No description provided."}
              </p>

              <div className="mt-5 flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                  className="flex-1 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => void handleDelete(category)}
                  className="flex-1 rounded-xl bg-red-500/20 text-red-100 hover:bg-red-500/30"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="border border-dashed border-sky-500/30 bg-slate-950/80">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-slate-300">
            <div className="mb-4 rounded-full bg-sky-500/10 p-4 text-sky-300">
              <FolderPlus className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white">No categories yet</h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Start building your storefront structure by creating the first category.
            </p>
          </CardContent>
        </Card>
      )}

      <CategoryFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        title="Create category"
      />

      <CategoryFormModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdate}
        category={editingCategory}
        title="Edit category"
      />
    </div>
  );
}
