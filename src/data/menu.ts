// نموذج بيانات المنيو — مصمم ليكون قابلاً لإعادة الاستخدام لأي مطعم أو كافيه.
// عدّل هذا الملف فقط لتغيير محتوى المنيو بالكامل.

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number; // بالدينار العراقي
  badge?: "الأكثر طلباً" | "جديد" | "نباتي" | "حار";
  available?: boolean;
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
  address: string;
  hours: string;
  instagram?: string;
};

export const restaurant: Restaurant = {
  name: "مقهى الواحة",
  tagline: "قهوة مختصة ومأكولات طازجة في قلب المدينة",
  currency: "د.ع",
  phone: "+964 770 000 0000",
  address: "بغداد - شارع الرشيد",
  hours: "يومياً من 9 صباحاً حتى 12 منتصف الليل",
  instagram: "@alwaha.cafe",
};

export const categories: MenuCategory[] = [
  {
    id: "hot-drinks",
    name: "مشروبات ساخنة",
    icon: "قهوة",
    items: [
      {
        id: "espresso",
        name: "إسبريسو",
        description: "جرعة مركّزة من حبوب مختصة محمّصة طازجة",
        price: 2000,
        badge: "الأكثر طلباً",
      },
      {
        id: "cappuccino",
        name: "كابتشينو",
        description: "إسبريسو مع حليب مبخّر ورغوة حريرية",
        price: 3000,
      },
      {
        id: "spanish-latte",
        name: "سبانيش لاتيه",
        description: "لاتيه بالحليب المكثّف المحلّى وطبقة كريمية",
        price: 4000,
        badge: "جديد",
      },
      {
        id: "tea",
        name: "شاي عراقي",
        description: "شاي أحمر مخدّر يُقدّم في إستكان",
        price: 1000,
      },
    ],
  },
  {
    id: "cold-drinks",
    name: "مشروبات باردة",
    icon: "مثلج",
    items: [
      {
        id: "iced-latte",
        name: "آيس لاتيه",
        description: "إسبريسو وحليب بارد فوق ثلج مجروش",
        price: 4000,
        badge: "الأكثر طلباً",
      },
      {
        id: "mojito",
        name: "موهيتو ليمون ونعناع",
        description: "منعش بالليمون الطازج والنعناع والصودا",
        price: 3500,
      },
      {
        id: "frappe",
        name: "فرابيه كراميل",
        description: "قهوة مخفوقة مثلجة بصوص الكراميل",
        price: 4500,
        badge: "جديد",
      },
    ],
  },
  {
    id: "breakfast",
    name: "فطور",
    icon: "فطور",
    items: [
      {
        id: "shakshuka",
        name: "شكشوكة",
        description: "بيض مطهو بصلصة الطماطم والفلفل مع خبز ساخن",
        price: 6000,
      },
      {
        id: "halloumi-plate",
        name: "طبق حلوم مشوي",
        description: "جبن حلوم مشوي مع خضار وزيتون وخبز",
        price: 7000,
        badge: "نباتي",
      },
      {
        id: "pancakes",
        name: "بان كيك بالعسل",
        description: "ثلاث قطع هشّة مع عسل وزبدة وفواكه",
        price: 5500,
      },
    ],
  },
  {
    id: "main",
    name: "أطباق رئيسية",
    icon: "طبق",
    items: [
      {
        id: "chicken-burger",
        name: "برغر دجاج مقرمش",
        description: "صدر دجاج مقرمش مع صلصة خاصة وبطاطا",
        price: 8000,
        badge: "الأكثر طلباً",
      },
      {
        id: "beef-burger",
        name: "برغر لحم أنغوس",
        description: "لحم أنغوس مشوي مع جبن شيدر وخضار طازجة",
        price: 9500,
      },
      {
        id: "spicy-wrap",
        name: "راب دجاج حار",
        description: "شرائح دجاج متبّلة بصلصة حارة مع خضار",
        price: 7000,
        badge: "حار",
      },
    ],
  },
  {
    id: "desserts",
    name: "حلويات",
    icon: "حلوى",
    items: [
      {
        id: "cheesecake",
        name: "تشيز كيك",
        description: "قطعة كلاسيكية بطبقة بسكويت وصوص توت",
        price: 5000,
        badge: "الأكثر طلباً",
      },
      {
        id: "lava-cake",
        name: "كيكة الشوكولاتة السائلة",
        description: "كيكة دافئة بقلب شوكولاتة ذائب مع آيس كريم",
        price: 5500,
      },
      {
        id: "kunafa",
        name: "كنافة نابلسية",
        description: "كنافة بالجبن والقطر تُقدّم ساخنة",
        price: 4500,
      },
    ],
  },
];
