// نموذج بيانات المنيو المشترك بين طبقة البيانات، الواجهة، ولوحة التحكم.

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number; // بالدينار العراقي
  discountPrice?: number; // لازم يكون أقل من price
  badge?: "الأكثر طلباً" | "جديد" | "عادي" | "نباتي" | "حار";
  available?: boolean;
  imageUrl?: string;
  supplierId?: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  icon: string; // اسم رمز توضيحي (نص قصير)
  items: MenuItem[];
};

export type Restaurant = {
  name: string;
  tagline: string;
  currency: string;
  phone: string;
  imageUrl?: string;
  branchesEnabled?: boolean;
  facebookUrl?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  googleMapsUrl?: string;
};

/** عنصر قائمة بسيط (فرع، منطقة توصيل، طريقة دفع) — اسم فقط وترتيب. */
export type SimpleListItem = {
  id: string;
  name: string;
  order: number;
};
