// نموذج بيانات المنيو المشترك بين طبقة البيانات، الواجهة، ولوحة التحكم.

/** وزن/حجم بديل اختياري للصنف (1 كيلو، نص كيلو...) — بسعره الخاص، وخصمه
 * الخاص لو موجود (تاريخ الانتهاء مشترك مع باقي الصنف عبر discountEndsAt). */
export type MenuItemVariant = {
  id: string;
  label: string;
  price: number;
  discountPrice?: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number; // بالدينار العراقي — أو سعر الوزن الافتراضي لو فيه variants
  discountPrice?: number; // لازم يكون أقل من price؛ النسبة المحسوبة منه بتتطبق على كل الأوزان
  variants?: MenuItemVariant[]; // اختياري — لو فاضي، الصنف بسعر واحد زي المعتاد
  badge?: "الأكثر طلباً" | "جديد" | "عادي" | "نباتي" | "حار";
  available?: boolean;
  imageUrl?: string;
  supplierId?: string;
  orderCount?: number; // عدد مرات الطلب — بيتحدث تلقائي، معلوماتي بس للأدمن
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
  themeColor?: string; // اللون الأساسي (theme_color) لتطبيق الـ PWA — hex
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
