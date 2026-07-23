import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// بيانات المنيو بتتخزن محليًا (IndexedDB) عشان الزبون يقدر يتصفح آخر نسخة
// شافها حتى لو النت ضعيف/مقطوع — بس ده متاح في المتصفح بس (مفيش IndexedDB
// على السيرفر، وده بيتنفّذ سيرفر-سايد كمان جوه generateMetadata في
// layout.tsx). الـ try/catch بيحمي من initializeFirestore بيرفض يتنفّذ
// تاني على نفس الـ app لو الموديول ده اتحمّل أكتر من مرة (Fast Refresh وقت
// التطوير)، وبيرجع للـ instance الموجودة بدل ما يطلّع error.
function createDb() {
  if (typeof window === "undefined") return getFirestore(app);
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createDb();
export const auth = getAuth(app);
