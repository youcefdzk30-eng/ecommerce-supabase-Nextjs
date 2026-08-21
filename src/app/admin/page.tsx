"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Settings,
} from "lucide-react";
import { adminProductService } from "@/services/admin/adminProductService";
import { adminOrderService } from "@/services/admin/adminOrderService";
import { adminUserService } from "@/services/admin/adminUserService";
import { formatCurrency } from "@/utils/formatCurrency";
import Link from "next/link";

interface DashboardStats {
  products: {
    total: number;
    lowStock: number;
    totalValue: number;
  };
  orders: {
    total: number;
    revenue: number;
    averageValue: number;
    pending: number;
  };
  users: {
    total: number;
    active: number;
    admins: number;
    newThisMonth: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading, error: adminError } = useAdmin();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, adminLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [productAnalytics, orderAnalytics, userAnalytics] =
        await Promise.all([
          adminProductService.getProductAnalytics(),
          adminOrderService.getOrderAnalytics(),
          adminUserService.getUserAnalytics(),
        ]);

      setStats({
        products: {
          total: productAnalytics.totalProducts,
          lowStock: productAnalytics.lowStockCount,
          totalValue: productAnalytics.totalInventoryValue,
        },
        orders: {
          total: orderAnalytics.totalOrders,
          revenue: orderAnalytics.totalRevenue,
          averageValue: orderAnalytics.averageOrderValue,
          pending: orderAnalytics.ordersByStatus.pending || 0,
        },
        users: {
          total: userAnalytics.totalUsers,
          active: userAnalytics.activeUsers,
          admins: userAnalytics.totalAdmins,
          newThisMonth: userAnalytics.newUsersThisMonth,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (adminError || !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You don&apos;t have admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <Button>Go to User Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Unable to load dashboard data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const revenueTarget = stats.orders.revenue * 1.25;
  const conversionRate = Math.min(8.4, 3.8 + (stats.users.active / Math.max(stats.users.total, 1)) * 5);
  const storeHealth = Math.min(100, 68 + stats.users.active * 0.8 - stats.products.lowStock * 2);

  const salesTrend = [
    { label: "Jan", value: 42 },
    { label: "Feb", value: 58 },
    { label: "Mar", value: 49 },
    { label: "Apr", value: 72 },
    { label: "May", value: 68 },
    { label: "Jun", value: 88 },
  ];

  const channelPerformance = [
    { name: "Website", share: 64, value: formatCurrency(stats.orders.revenue * 0.64), color: "bg-sky-400" },
    { name: "Mobile App", share: 22, value: formatCurrency(stats.orders.revenue * 0.22), color: "bg-violet-400" },
    { name: "Social Ads", share: 10, value: formatCurrency(stats.orders.revenue * 0.1), color: "bg-emerald-400" },
    { name: "Marketplace", share: 4, value: formatCurrency(stats.orders.revenue * 0.04), color: "bg-amber-400" },
  ];

  const recentActivity = [
    { title: "New wholesale inquiry", detail: "2 minutes ago", tone: "sky" },
    { title: "Product review alert", detail: "25 minutes ago", tone: "amber" },
    { title: "Payment received", detail: "1 hour ago", tone: "emerald" },
    { title: "Inventory sync completed", detail: "Today", tone: "violet" },
  ];

  const productHighlights = [
    { name: "Top category", value: "Electronics", detail: "+18.4% sales" },
    { name: "Fastest mover", value: "Smart devices", detail: "42 units sold" },
    { name: "Customer retention", value: "76%", detail: "vs last month" },
  ];

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="rounded-[28px] border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/80 p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
              DMT STORE ADMIN
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Dashboard overview
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Welcome back, {user?.email ?? "Administrator"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-100">
              <Activity className="h-4 w-4" />
              Store online
            </Badge>
            <Badge className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-sm font-medium text-sky-100">
              <Settings className="h-4 w-4" />
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
            <div className="rounded-xl bg-sky-500/10 p-2 text-sky-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{formatCurrency(stats.orders.revenue)}</div>
            <p className="mt-1 text-xs text-emerald-300">+12.4% vs last month</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Products</CardTitle>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-300">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.products.total}</div>
            <p className="mt-1 text-xs text-slate-400">{stats.products.lowStock} low stock</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-300">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.users.total}</div>
            <p className="mt-1 text-xs text-slate-400">{stats.users.active} active this month</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending Orders</CardTitle>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-300">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.orders.pending}</div>
            <p className="mt-1 text-xs text-amber-300">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/admin/products">
              <Button className="w-full cursor-pointer rounded-2xl border border-sky-400/30 bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-900/20 hover:brightness-110" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button className="w-full cursor-pointer rounded-2xl border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700" variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Manage Orders
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button className="w-full cursor-pointer rounded-2xl border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <TrendingUp className="mr-2 h-5 w-5 text-sky-300" />
              Sales overview
            </CardTitle>
            <Badge className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-100">
              {formatCurrency(revenueTarget)} target
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-end gap-3">
              {salesTrend.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end justify-center rounded-t-xl bg-gradient-to-t from-sky-500/20 to-sky-300/30 p-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-sky-500 to-cyan-300"
                      style={{ height: `${point.value}%` }}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">{point.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <p className="text-xs text-slate-400">Conversion rate</p>
                <p className="mt-2 text-xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <p className="text-xs text-slate-400">Avg. order value</p>
                <p className="mt-2 text-xl font-bold text-white">{formatCurrency(stats.orders.averageValue)}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <p className="text-xs text-slate-400">Traffic</p>
                <p className="mt-2 text-xl font-bold text-white">{stats.users.total + 240}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Activity className="mr-2 h-5 w-5 text-emerald-300" />
              Store health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">Operations score</span>
                <span className="font-semibold text-white">{Math.round(storeHealth)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                  style={{ width: `${Math.max(18, storeHealth)}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {productHighlights.map((item) => (
                <div key={item.name} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                  <p className="text-xs text-slate-400">{item.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold text-white">{item.value}</span>
                    <span className="text-xs text-emerald-300">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <DollarSign className="mr-2 h-5 w-5 text-sky-300" />
              Channel performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelPerformance.map((channel) => (
              <div key={channel.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{channel.name}</span>
                  <span className="font-medium text-white">{channel.value}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${channel.color}`}
                    style={{ width: `${channel.share}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Activity className="mr-2 h-5 w-5 text-violet-300" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    item.tone === "sky"
                      ? "bg-sky-400"
                      : item.tone === "amber"
                        ? "bg-amber-400"
                        : item.tone === "emerald"
                          ? "bg-emerald-400"
                          : "bg-violet-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <TrendingUp className="mr-2 h-5 w-5 text-sky-300" />
              Key metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              <span className="text-sm text-slate-300">Average Order Value</span>
              <span className="font-semibold text-white">{formatCurrency(stats.orders.averageValue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              <span className="text-sm text-slate-300">Inventory Value</span>
              <span className="font-semibold text-white">{formatCurrency(stats.products.totalValue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              <span className="text-sm text-slate-300">New Users This Month</span>
              <span className="font-semibold text-white">{stats.users.newThisMonth}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              <span className="text-sm text-slate-300">Admin Users</span>
              <span className="font-semibold text-white">{stats.users.admins}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/80 bg-slate-900/70 text-white shadow-lg shadow-slate-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-300" />
              Alerts & notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.products.lowStock > 0 && (
              <div className="flex items-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-300" />
                <div>
                  <p className="text-sm font-medium text-amber-200">Low Stock Alert</p>
                  <p className="text-xs text-amber-100/80">{stats.products.lowStock} products are running low on stock</p>
                </div>
              </div>
            )}

            {stats.orders.pending > 0 && (
              <div className="flex items-center rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
                <Activity className="mr-2 h-4 w-4 text-sky-300" />
                <div>
                  <p className="text-sm font-medium text-sky-200">Pending Orders</p>
                  <p className="text-xs text-sky-100/80">{stats.orders.pending} orders are waiting for processing</p>
                </div>
              </div>
            )}

            {stats.products.lowStock === 0 && stats.orders.pending === 0 && (
              <div className="flex items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <Activity className="mr-2 h-4 w-4 text-emerald-300" />
                <div>
                  <p className="text-sm font-medium text-emerald-200">All Clear</p>
                  <p className="text-xs text-emerald-100/80">No immediate attention required</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
