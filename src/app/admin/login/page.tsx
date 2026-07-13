"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch {
      setError("بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-line bg-surface/60 p-8"
      >
        <h1 className="text-center font-display text-2xl font-extrabold text-cream">
          لوحة التحكم
        </h1>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">البريد الإلكتروني</label>
            <input
              type="email"
              dir="ltr"
              className="w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">كلمة المرور</label>
            <input
              type="password"
              dir="ltr"
              className="w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-chili">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-gold py-2.5 font-display text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
        >
          {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </main>
  );
}
