"use client";

import { useEffect, useState } from "react";
import { subscribeBackupConfig, saveBackupConfig } from "@/lib/firestore";
import { runBackup, restoreBackup, subscribeBackups } from "@/lib/backup";
import type { BackupConfig, BackupFrequency, BackupRecord } from "@/types/backup";

const inputClass =
  "rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-muted";

const FREQUENCY_LABELS: Record<BackupFrequency, string> = {
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
};

const WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

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
        هيتم استبدال كل الفئات والأصناف والموردين وبيانات المطعم الحالية بالكامل بنسخة{" "}
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
  const [savingConfig, setSavingConfig] = useState(false);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    await saveBackupConfig({
      frequency,
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

        <button
          type="submit"
          disabled={savingConfig}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
        >
          {savingConfig ? "جارٍ الحفظ..." : "حفظ الجدول"}
        </button>
      </form>

      {config?.lastRunAt && (
        <p className="mt-3 text-xs text-muted">
          آخر نسخة تلقائية:{" "}
          {config.lastRunAt.toDate().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      )}
    </>
  );
}

export default function BackupPanel() {
  const [config, setConfig] = useState<BackupConfig | null | undefined>(undefined);
  const [backups, setBackups] = useState<BackupRecord[] | null>(null);
  const [backingUpNow, setBackingUpNow] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
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
          بيتفحص يوميًا الساعة 3 صباحًا، وبينفذ نسخة جديدة لو النهارده معاده حسب الجدول ده.
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
                      {backup.data.suppliers.length} مورد
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmingId(confirmingId === backup.id ? null : backup.id)
                    }
                    className="shrink-0 text-xs font-bold text-chili hover:opacity-80"
                  >
                    استرجاع
                  </button>
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
    </div>
  );
}
