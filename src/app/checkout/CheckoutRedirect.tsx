"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPolarCheckout } from "./actions";
import { useCart } from "@/context/CartContext";

const GOVERNORATES = Array.from({ length: 69 }, (_, index) => {
  const id = index + 1;
  const isReal = id <= 14;
  const baseNames = [
    "دمشق",
    "ريف دمشق",
    "حمص",
    "حماة",
    "حلب",
    "اللاذقية",
    "دير الزور",
    "السويداء",
    "درعا",
    "الرقة",
    "إدلب",
    "القنيطرة",
    "المرقب",
    "طرطوس",
  ];

  const name = isReal ? baseNames[index] : `الولاية ${id}`;
  const municipalityCount = Math.max(3, (id % 6) + 2);

  return {
    id,
    name,
    municipalities: Array.from({ length: municipalityCount }, (_, municipalityIndex) =>
      `البلدية ${municipalityIndex + 1}`
    ),
  };
});

export default function CheckoutRedirect() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState("home");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorateId, setGovernorateId] = useState<string>("1");
  const [municipality, setMunicipality] = useState<string>("");

  const selectedGovernorate = useMemo(
    () => GOVERNORATES.find((item) => item.id.toString() === governorateId) ?? GOVERNORATES[0],
    [governorateId]
  );

  const municipalityOptions = selectedGovernorate.municipalities;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!cartItems.length) {
      setError("السلة فارغة، أضف منتجًا قبل إتمام الطلب.");
      toast.error("السلة فارغة");
      return;
    }

    if (!recipientName.trim() || !phone.trim() || !municipality.trim()) {
      setError("يرجى تعبئة الاسم ورقم الهاتف والولاية والبلدية.");
      toast.error("الحقول المطلوبة ناقصة");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createPolarCheckout({
        deliveryType,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        governorate: selectedGovernorate.name,
        municipality,
        city: selectedGovernorate.name,
        state: selectedGovernorate.name,
        country: "Syria",
      });

      if (!result.success || !result.checkoutUrl) {
        throw new Error(result.error || "فشل في إنشاء جلسة الدفع");
      }

      sessionStorage.setItem(
        "checkout-success-summary",
        JSON.stringify({
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          governorate: selectedGovernorate.name,
          municipality,
          deliveryType,
          total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
          items: cartItems.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            product_id: item.product_id,
          })),
        })
      );

      await clearCart();
      toast.success("يتم تجهيز الدفع...");
      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الطلب");
      setIsLoading(false);
      toast.error("فشل في بدء الدفع. حاول مرة أخرى.");
    }
  }

  return (
    <div className="bg-background min-h-screen py-10">
      <Card className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <CardHeader className="border-b border-white/10 pb-5">
          <CardTitle className="text-3xl font-black text-white">إتمام الطلب</CardTitle>
          <p className="mt-2 text-sm text-slate-300">أدخل بيانات التوصيل ثم تابع إلى الدفع الآمن.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">اسم المستلم</label>
                <input
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-violet-500"
                  placeholder="مثال: محمد علي"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">رقم الهاتف</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-violet-500"
                  placeholder="09xxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">الولاية</label>
                <select
                  value={governorateId}
                  onChange={(e) => {
                    setGovernorateId(e.target.value);
                    setMunicipality("");
                  }}
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-violet-500"
                >
                  {GOVERNORATES.map((governorate) => (
                    <option key={governorate.id} value={governorate.id.toString()}>
                      {governorate.id} - {governorate.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">البلدية</label>
                <select
                  required
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-violet-500"
                >
                  <option value="">اختر البلدية</option>
                  {municipalityOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-slate-200">طريقة التوصيل</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: "home", label: "التوصيل للمنزل" },
                  { value: "office", label: "التوصيل للمكتب" },
                  { value: "pickup", label: "استلام من المتجر" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDeliveryType(option.value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      deliveryType === option.value
                        ? "border-violet-500 bg-violet-500/15 text-violet-200"
                        : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => router.push("/cart")} className="cursor-pointer border-slate-700 text-slate-200 hover:bg-slate-800">
                العودة للسلة
              </Button>
              <Button type="submit" disabled={isLoading} className="cursor-pointer bg-violet-600 hover:bg-violet-500">
                {isLoading ? "جاري تجهيز الطلب..." : "إرسال الطلب"}
              </Button>
            </div>

            {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

