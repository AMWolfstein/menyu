/**
 * بيحقن Cloudinary transformation جوه رابط صورة مرفوعة (شعار المحل) عشان
 * نطلّع منه نسخة PNG بمقاس أيقونة محدد، بدل الاعتماد على ملفات ثابتة.
 * `safeZone` بيضيف حشو إضافي حوالين الشعار (للأيقونات القابلة للقص/maskable).
 */
export function cloudinaryIconUrl(url: string, size: number, safeZone = false): string {
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const insertAt = idx + marker.length;
  const inner = Math.round(size * 0.7);
  const transforms = safeZone
    ? `w_${inner},h_${inner},c_pad,b_white,f_png/w_${size},h_${size},c_pad,b_white,f_png`
    : `w_${size},h_${size},c_pad,b_white,f_png`;

  return `${url.slice(0, insertAt)}${transforms}/${url.slice(insertAt)}`;
}

/**
 * بيحقن Cloudinary transformation عشان يطلّع نسخة خفيفة ومربوطة الأبعاد
 * (2:1) من صورة الصنف مخصوصة لصورة الإشعارات (Web Push) — أندرويد بيدّي
 * مهلة قصيرة جدًا لتحميل صورة الإشعار، فالنسخة الأصلية الكبيرة ممكن تفشل
 * تتحمّل في الوقت وتتقلب لأفاتار عام بدل الصورة.
 */
export function cloudinaryNotificationImageUrl(url: string): string {
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const insertAt = idx + marker.length;
  const transforms = "w_640,h_320,c_fill,g_auto,q_auto,f_auto";

  return `${url.slice(0, insertAt)}${transforms}/${url.slice(insertAt)}`;
}
