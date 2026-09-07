"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

type CheckoutSummary = {
  recipientName: string;
  phone: string;
  governorate: string;
  municipality: string;
  deliveryType: string;
  total: number;
  items: Array<{ title: string; quantity: number; price: number; product_id: string }>;
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const orderId = searchParams.get("order_id");
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);

  useEffect(() => {
    const savedSummary = sessionStorage.getItem("checkout-success-summary");
    if (savedSummary) {
      try {
        setSummary(JSON.parse(savedSummary));
      } catch {
        setSummary(null);
      }
    }

    void clearCart();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [clearCart]);

  const totalLabel = useMemo(
    () =>
      summary?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? summary?.total ?? 0,
    [summary]
  );

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen py-12">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>جاري تجهيز طلبك...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-4">
              يرجى الانتظار ريثما نجهز تفاصيل طلب الدفع عند الاستلام.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <Card className="mx-auto max-w-3xl rounded-3xl border border-emerald-500/20 bg-slate-950/80 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <CardTitle className="text-3xl text-white">تمت عملية الطلب بنجاح!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-slate-200">
          <div className="text-center">
            <p className="text-slate-300">شكرًا لك على طلبك، تم استلام الطلب بنجاح وسيتم تجهيز مشترياتك قريبًا.</p>
            {orderId && <p className="mt-2 text-sm text-slate-400">رقم الطلب: {orderId}</p>}
            <p className="mt-2 text-sm font-medium text-emerald-300">طريقة الدفع: الدفع عند الاستلام</p>
          </div>

          {summary && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h3 className="mb-3 text-lg font-bold text-white">بيانات المستلم</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li><span className="text-slate-500">الاسم:</span> {summary.recipientName}</li>
                  <li><span className="text-slate-500">رقم الهاتف:</span> {summary.phone}</li>
                  <li><span className="text-slate-500">الولاية:</span> {summary.governorate}</li>
                  <li><span className="text-slate-500">البلدية:</span> {summary.municipality}</li>
                  <li><span className="text-slate-500">طريقة التوصيل:</span> {summary.deliveryType === "home" ? "التوصيل للمنزل" : summary.deliveryType === "office" ? "التوصيل للمكتب" : "استلام من المتجر"}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h3 className="mb-3 text-lg font-bold text-white">ملخص الطلب</h3>
                <div className="space-y-3">
                  {summary.items.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between gap-3 text-sm text-slate-300">
                      <span>{item.title} × {item.quantity}</span>
                      <span>{(item.price * item.quantity).toFixed(2)} $</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700 pt-3 text-base font-bold text-white">
                    الإجمالي: {totalLabel.toFixed(2)} $
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => router.push("/profile")} variant="outline" className="cursor-pointer border-slate-700 text-slate-200 hover:bg-slate-800">
              عرض الطلبات
            </Button>
            <Button onClick={() => router.push("/")} className="cursor-pointer bg-violet-600 hover:bg-violet-500">
              متابعة التسوق
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-background min-h-screen py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>جاري التحميل...</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
