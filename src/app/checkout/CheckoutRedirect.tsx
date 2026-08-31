"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPolarCheckout } from "./actions";

export default function CheckoutRedirect() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple checkout form to collect delivery info before creating checkout
  const [deliveryType, setDeliveryType] = useState('home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createPolarCheckout({
        deliveryType,
        recipientName,
        phone,
        addressLine,
        city,
        state: stateVal,
        postalCode,
        country,
      });

      if (!result.success || !result.checkoutUrl) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      // Redirect to Polar hosted checkout
      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
      toast.error('Failed to start checkout. Please try again.');
    }
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Recipient name</label>
              <input required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-1 block w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium">Delivery type</label>
              <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} className="mt-1 block w-full">
                <option value="home">Home delivery</option>
                <option value="office">Office delivery</option>
                <option value="pickup">Pick up from store</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Address</label>
              <input required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="mt-1 block w-full" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium">State</label>
                <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="mt-1 block w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">Postal code</label>
                <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1 block w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium">Country</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 block w-full" />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push('/cart')}>Back to cart</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Processing...' : 'Proceed to payment'}</Button>
            </div>

            {error && <p className="text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

