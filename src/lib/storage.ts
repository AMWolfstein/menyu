import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const path = `${folder}/${crypto.randomUUID()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
