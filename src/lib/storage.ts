// رفع الصور عبر Cloudinary (unsigned upload) بدل Firebase Storage — الأخير
// بقى يتطلب خطة Blaze (بطاقة دفع) حتى لضمن الحصة المجانية، وده مش مطلوب هنا.

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(
  file: File,
  folder: "items" | "restaurant"
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("الملف المختار ليس صورة");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم الصورة أكبر من 5 ميجابايت");
  }
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("إعدادات رفع الصور غير مكتملة (Cloudinary)");
  }

  // مجلد الرفع (menyu_uploads) متضبط جوه إعدادات الـ upload preset نفسه على
  // Cloudinary، فمش محتاجين نبعت "folder" هنا — تفاديًا لأي تعارض مع الـ preset.
  // بنستخدم "tags" بدلها للتمييز بين صور الأصناف وصورة المحل داخل مكتبة الوسائط.
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("tags", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("فشل رفع الصورة، حاول مرة أخرى");
  }

  const data: { secure_url: string } = await res.json();
  return data.secure_url;
}
