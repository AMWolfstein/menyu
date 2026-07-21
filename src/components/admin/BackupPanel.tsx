"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeBackupConfig, saveBackupConfig } from "@/lib/firestore";
import {
  runBackup,
  restoreBackup,
  restoreSnapshot,
  deleteBackup,
  subscribeBackups,
  downloadBackupFile,
  isValidBackupSnapshot,
} from "@/lib/backup";
import type { BackupConfig, BackupFrequency, BackupRecord, BackupSnapshot } from "@/types/backup";

const inputClass =
  "rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-muted";

const FREQUENCY_LABELS: Record<BackupFrequency, string> = {
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
};

const WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatHour(hour: number): string {
  const period = hour < 12 ? "ص" : "م";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}:٠٠ ${period}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const RESTORE_CONFIRM_PHRASE = "استرجاع";

function ConfirmRestoreRow({
  backup,
  onConfirm,
  restoring,
}: {
  backup: BackupRecord;
  onConfirm: () => void;
  restoring: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const canConfirm = confirmText.trim() === RESTORE_CONFIRM_PHRASE;

  return (
    <div className="mt-2 rounded-lg border border-chili/40 bg-chili/5 p-3">
      <p className="text-xs text-chili">
        هيتم استبدال كل إعدادات لوحة التحكم الحالية (الفئات، الأصناف، الموردين،
        الفروع، مناطق التوصيل، طرق الدفع، روابط صور المشاركة، صور البانر،
        وبيانات المطعم) بالكامل بنسخة{" "}
        {backup.createdAt?.toDate().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
        . الإجراء ده نهائي ومينفعش يتراجع فيه. اكتب &quot;{RESTORE_CONFIRM_PHRASE}&quot; للتأكيد.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <input
          className={inputClass}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={RESTORE_CONFIRM_PHRASE}
        />
        <button
          type="button"
          disabled={!canConfirm || restoring}
          onClick={onConfirm}
          className="shrink-0 rounded-lg bg-chili px-3 py-2 text-xs font-bold text-white transition-colors hover:opacity-90 disabled:opacity-40"
        >
          {restoring ? "جارٍ الاسترجاع..." : "تنفيذ الاسترجاع"}
        </button>
      </div>
    </div>
  );
}

function ScheduleForm({ config }: { config: BackupConfig | null }) {
  const [frequency, setFrequency] = useState<BackupFrequency>(config?.frequency ?? "daily");
  const [dayOfWeek, setDayOfWeek] = useState(config?.dayOfWeek ?? 0);
  const [dayOfMonth, setDayOfMonth] = useState(config?.dayOfMonth ?? 1);
  const [preferredHour, setPreferredHour] = useState(config?.preferredHour ?? 3);
  const [savingConfig, setSavingConfig] = useState(false);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    await saveBackupConfig({
      frequency,
      preferredHour,
      ...(frequency === "weekly" && { dayOfWeek }),
      ...(frequency === "monthly" && { dayOfMonth }),
    });
    setSavingConfig(false);
  };

  return (
    <>
      <form onSubmit={handleSaveSchedule} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className={labelClass}>التكرار</label>
          <select
            className={inputClass}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as BackupFrequency)}
          >
            {(Object.keys(FREQUENCY_LABELS) as BackupFrequency[]).map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        {frequency === "weekly" && (
          <div>
            <label className={labelClass}>اليوم</label>
            <select
              className={inputClass}
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
            >
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {frequency === "monthly" && (
          <div>
            <label className={labelClass}>يوم الشهر</label>
            <input
              className={inputClass}
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Number(e.target.value))}
            />
          </div>
        )}

        <div>
          <label className={labelClass}>الساعة المفضّلة</label>
          <select
            className={inputClass}
            value={preferredHour}
            onChange={(e) => setPreferredHour(Number(e.target.value))}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {formatHour(h)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={savingConfig}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
        >
          {savingConfig ? "جارٍ الحفظ..." : "حفظ الجدول"}
        </button>
      </form>

      <p className="mt-3 text-xs text-muted">
        ملحوظة: &quot;الساعة المفضّلة&quot; دي معلوماتية بس عشان تفضل متسجّلة في
        إعداداتك — الفحص الفعلي بيحصل يوميًا الساعة 5 صباحًا بتوقيت القاهرة
        بالظبط (وقت ثابت في إعدادات الاستضافة، ومحتاج تعديل كود وديبلوي جديد
        عشان يتغير).
      </p>

      {config?.lastRunAt && (
        <p className="mt-1 text-xs text-muted">
          آخر نسخة تلقائية:{" "}
          {config.lastRunAt.toDate().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      )}
    </>
  );
}

function RestoreFromFileSection() {
  const [pending, setPending] = useState<BackupSnapshot | null>(null);
  const [fileName, setFileName] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canConfirm = confirmText.trim() === RESTORE_CONFIRM_PHRASE;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidBackupSnapshot(parsed)) {
        window.alert("الملف ده مش نسخة احتياطية صالحة");
        return;
      }
      setPending(parsed);
      setFileName(file.name);
      setConfirmText("");
    } catch {
      window.alert("تعذّرت قراءة الملف، تأكد إنه ملف JSON صالح");
    }
  };

  const handleConfirm = async () => {
    if (!pending) return;
    setRestoring(true);
    try {
      await restoreSnapshot(pending);
      window.alert("تم الاسترجاع بنجاح");
      setPending(null);
      setFileName("");
      setConfirmText("");
    } catch {
      window.alert("فشل الاسترجاع، حاول تاني");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">استرجاع نسخة من الكمبيوتر</h2>
      <p className="mt-1 text-xs text-muted">
        اختار ملف نسخة احتياطية (JSON) اتحمّل قبل كده من هنا عشان تسترجعه.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="mt-3 w-full max-w-full text-xs text-muted file:ml-2 file:rounded-lg file:border file:border-line file:bg-base/60 file:px-3 file:py-2 file:text-xs file:text-cream"
      />

      {pending && (
        <div className="mt-3 rounded-lg border border-chili/40 bg-chili/5 p-3">
          <p className="text-xs text-cream">
            الملف: <span className="font-bold">{fileName}</span> — {pending.categories.length} فئة ·{" "}
            {pending.items.length} صنف · {pending.suppliers.length} مورد · {pending.branches.length} فرع
          </p>
          <p className="mt-2 text-xs text-chili">
            هيتم استبدال كل إعدادات لوحة التحكم الحالية بمحتوى الملف ده بالكامل. الإجراء
            ده نهائي ومينفعش يتراجع فيه. اكتب &quot;{RESTORE_CONFIRM_PHRASE}&quot; للتأكيد.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              className={inputClass}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={RESTORE_CONFIRM_PHRASE}
            />
            <button
              type="button"
              disabled={!canConfirm || restoring}
              onClick={handleConfirm}
              className="shrink-0 rounded-lg bg-chili px-3 py-2 text-xs font-bold text-white transition-colors hover:opacity-90 disabled:opacity-40"
            >
              {restoring ? "جارٍ الاسترجاع..." : "تنفيذ الاسترجاع"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BackupPanel() {
  const [config, setConfig] = useState<BackupConfig | null | undefined>(undefined);
  const [backups, setBackups] = useState<BackupRecord[] | null>(null);
  const [backingUpNow, setBackingUpNow] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => subscribeBackupConfig(setConfig), []);
  useEffect(() => subscribeBackups(setBackups), []);

  const handleBackupNow = async () => {
    setBackingUpNow(true);
    try {
      await runBackup();
    } catch {
      window.alert("فشل عمل النسخة الاحتياطية، حاول تاني");
    } finally {
      setBackingUpNow(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("حذف النسخة الاحتياطية دي؟")) return;
    setDeletingId(id);
    try {
      await deleteBackup(id);
    } catch {
      window.alert("فشل الحذف، حاول تاني");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await restoreBackup(id);
      setConfirmingId(null);
      window.alert("تم الاسترجاع بنجاح");
    } catch {
      window.alert("فشل الاسترجاع، حاول تاني");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface/60 p-5">
        <h2 className="font-display text-lg font-bold text-cream">جدولة النسخ التلقائي</h2>
        <p className="mt-1 text-xs text-muted">
          بيتفحص يوميًا الساعة 5 صباحًا بتوقيت القاهرة، وبينفذ نسخة جديدة لو النهارده معاده حسب الجدول ده.
        </p>

        {config !== undefined && (
          <ScheduleForm config={config} key={config ? "ready" : "empty"} />
        )}
      </div>

      <div className="rounded-xl border border-line bg-surface/60 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-cream">النسخ الاحتياطية</h2>
          <button
            type="button"
            onClick={handleBackupNow}
            disabled={backingUpNow}
            className="shrink-0 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
          >
            {backingUpNow ? "جارٍ النسخ..." : "نسخ احتياطي الآن"}
          </button>
        </div>

        {backups === null ? (
          <p className="mt-4 text-center text-sm text-muted">جارٍ التحميل...</p>
        ) : backups.length === 0 ? (
          <p className="mt-4 text-center text-sm text-muted">لسه مفيش نسخ احتياطية.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {backups.map((backup) => (
              <li
                key={backup.id}
                className="rounded-lg border border-line bg-base/40 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm">
                    <p className="font-bold text-cream">
                      {backup.createdAt
                        ?.toDate()
                        .toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <p className="text-xs text-muted">
                      {backup.data.categories.length} فئة · {backup.data.items.length} صنف ·{" "}
                      {backup.data.suppliers.length} مورد · {backup.data.branches.length} فرع
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => downloadBackupFile(backup)}
                      className="text-xs font-bold text-muted hover:text-cream"
                    >
                      تحميل
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmingId(confirmingId === backup.id ? null : backup.id)
                      }
                      className="text-xs font-bold text-chili hover:opacity-80"
                    >
                      استرجاع
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(backup.id)}
                      disabled={deletingId === backup.id}
                      className="text-xs font-bold text-muted hover:text-cream disabled:opacity-40"
                    >
                      {deletingId === backup.id ? "جارٍ الحذف..." : "حذف"}
                    </button>
                  </div>
                </div>

                {confirmingId === backup.id && (
                  <ConfirmRestoreRow
                    backup={backup}
                    restoring={restoringId === backup.id}
                    onConfirm={() => handleRestore(backup.id)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <RestoreFromFileSection />
    </div>
  );
}
