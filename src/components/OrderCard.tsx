import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderItemType, OrderType } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDeleteOrder } from "@/hooks/queries";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface OrderCardProps {
  order: OrderType;
  onDelete?: (orderId: number) => void;
}

export function OrderCard({ order, onDelete }: OrderCardProps) {
  const { user } = useAuth();
  const deleteOrder = useDeleteOrder();

  const statusSteps = ["pending", "processing", "shipped", "delivered"] as const;
  const currentStepIndex = Math.max(
    0,
    statusSteps.indexOf(order.status as (typeof statusSteps)[number]),
  );
  const progressPercent = order.status === "cancelled" ? 0 : ((currentStepIndex + 1) / statusSteps.length) * 100;

  const handleDeleteOrder = async () => {
    try {
      await deleteOrder.mutateAsync({
        orderId: order.id.toString(),
        userId: user?.id,
      });
      toast.success("Order deleted");
      onDelete?.(order.id);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/20">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {order.created_at
                ? format(new Date(order.created_at), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 md:mt-0">
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-800"
                  : order.status === "shipped"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "processing"
                      ? "bg-orange-100 text-orange-800"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {order.status !== "cancelled" && (
              <Button
                variant="destructive"
                size="sm"
                className="ml-2 cursor-pointer"
                onClick={handleDeleteOrder}
                disabled={deleteOrder.isPending}
              >
                {deleteOrder.isPending ? "Deleting..." : "Delete Order"}
              </Button>
            )}
          </div>
        </div>

        {order.status !== "cancelled" && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
              <span>Pending</span>
              <span>Processing</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.order_items?.map((item: OrderItemType) => (
            <div
              key={item.id}
              className="flex flex-col items-start justify-between border-b py-2 last:border-b-0 md:flex-row md:items-center"
            >
              <div className="flex items-center">
                {item.product?.image && (
                  <Image
                    src={item.product.image || ""}
                    alt={item.product.title}
                    width={48}
                    height={48}
                    className="mr-4 h-12 w-12 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {item.product?.title || "Product"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Qty: {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="mt-2 font-medium md:mt-0">
                ${(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
