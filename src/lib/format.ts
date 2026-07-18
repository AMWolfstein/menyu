const CURRENCY_ABBREVIATIONS: Record<string, string> = {
  "جنيه مصري": "ج.م",
  "جنية مصري": "ج.م",
};

/** تنسيق السعر بفواصل الآلاف مع رمز العملة (مختصر لو كانت عملة معروفة). */
export function formatPrice(value: number, currency: string): string {
  const short = CURRENCY_ABBREVIATIONS[currency.trim()] ?? currency;
  return `${new Intl.NumberFormat("en-US").format(value)} ${short}`;
}
