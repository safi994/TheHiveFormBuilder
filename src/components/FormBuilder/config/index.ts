import elements from "./elements.json";
import styles from "./styles.json";
import pdf from "./pdf.json";
import layout from "./layout.json";

export const config = {
  elements,
  styles,
  pdf,
  layout,
} as const;

export type ElementConfig = typeof elements;
export type StyleConfig = typeof styles;
export type PDFConfig = typeof pdf;
export type LayoutConfig = typeof layout;

export default config;
