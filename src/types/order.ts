import type { Timestamp } from "firebase/firestore";

export type OrderLineItem = {
  /** معرّف صنف Firestore الحقيقي — يُستخدم لتحديث عدّاد الطلبات، مش مفتاح فريد للسلة. */
  itemId: string;
  name: string;
  variantLabel?: string;
  price: number;
  originalPrice?: number;
  qty: number;
};

export type Order = {
  id: string;
  items: OrderLineItem[];
  total: number;
  savings: number;
  orderType: "pickup" | "delivery";
  branchName?: string;
  zoneName?: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  paymentMethodName?: string;
  notes: string;
  createdAt?: Timestamp;
};
