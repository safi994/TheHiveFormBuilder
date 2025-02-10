import elements from "./elements.json";
import styles from "./styles.json";
import pdf from "./pdf.json";
import layout from "./layout.json";
import settings from "./settings.json";

export const config = {
  elements,
  styles,
  pdf,
  layout,
  settings,
} as const;

export type ElementConfig = typeof elements;
export type StyleConfig = typeof styles;
export type PDFConfig = typeof pdf;
export type LayoutConfig = typeof layout;
export type SettingsConfig = typeof settings;

export default config;
