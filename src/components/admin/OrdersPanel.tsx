"use client";

import { useEffect, useState } from "react";
import { subscribeOrders } from "@/lib/firestore";
import type { Order } from "@/types/order";
import { formatPrice } from "@/lib/format";

export default function OrdersPanel({ currency }: { currency: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => subscribeOrders(setOrders), []);

  const list = orders ?? [];
  const totalRevenue = list.reduce((sum, o) => sum + o.total, 0);
  const todayCount = list.filter((o) => {
    const d = o.createdAt?.toDate();
    if (!d) return false;
    return d.toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-surface/60 p-4 text-center">
          <p className="font-display text-2xl font-extrabold text-gold">{list.length}</p>
          <p className="mt-1 text-xs text-muted">إجمالي الطلبات</p>
        </div>
        <div className="rounded-xl border border-line bg-surface/60 p-4 text-center">
          <p className="font-display text-2xl font-extrabold text-gold">
            {formatPrice(totalRevenue, currency)}
          </p>
          <p className="mt-1 text-xs text-muted">إجمالي المبيعات</p>
        </div>
        <div className="rounded-xl border border-line bg-surface/60 p-4 text-center">
          <p className="font-display text-2xl font-extrabold text-gold">{todayCount}</p>
          <p className="mt-1 text-xs text-muted">طلبات اليوم</p>
        </div>
      </div>

      {orders === null ? (
        <p className="text-center text-sm text-muted">جارٍ التحميل...</p>
      ) : list.length === 0 ? (
        <p className="text-center text-sm text-muted">لسه مفيش طلبات.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((order) => (
            <li key={order.id} className="rounded-xl border border-line bg-surface/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-cream">{order.customerName}</p>
                  <p dir="ltr" className="text-xs text-muted">
                    {order.customerPhone}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-display text-sm font-bold text-gold">
                    {formatPrice(order.total, currency)}
                  </p>
                  <p className="text-xs text-muted">
                    {order.createdAt
                      ?.toDate()
                      .toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" }) ??
                      "..."}
                  </p>
                </div>
              </div>

              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-muted">
                {order.items.map((line, i) => (
                  <li key={i}>
                    {line.qty} × {line.name}
                    {line.variantLabel ? ` (${line.variantLabel})` : ""} —{" "}
                    {formatPrice(line.price * line.qty, currency)}
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-xs text-muted">
                {order.orderType === "pickup" ? "استلام من الفرع" : "توصيل"}
                {order.branchName ? ` · ${order.branchName}` : ""}
                {order.zoneName ? ` · ${order.zoneName}` : ""}
                {order.paymentMethodName ? ` · ${order.paymentMethodName}` : ""}
              </p>

              {order.notes && order.notes !== "-" && (
                <p className="mt-1 text-xs text-muted">ملاحظات: {order.notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
