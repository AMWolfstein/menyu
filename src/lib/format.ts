/** تنسيق السعر بفواصل الآلاف مع رمز العملة. */
export function formatPrice(value: number, currency: string): string {
  return `${new Intl.NumberFormat("en-US").format(value)} ${currency}`;
}
