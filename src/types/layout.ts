export type GridLayoutConfig = {
  /** عدد أعمدة كروت المنتجات على شاشات الموبايل (أقل من 1024px). */
  mobileColumns: number;
  /** عدد أعمدة كروت المنتجات على الشاشات الكبيرة (1024px فأكتر). */
  desktopColumns: number;
};

export const DEFAULT_GRID_LAYOUT: GridLayoutConfig = {
  mobileColumns: 2,
  desktopColumns: 3,
};
