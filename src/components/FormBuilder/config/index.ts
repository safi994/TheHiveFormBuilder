import elements from "./elements.json";
import styles from "./styles.json";
import pdf from "./pdf.json";
import layout from "./layout.json";
import settings from "./settings.json";
import form from "./form.json";
import ui from "./ui.json";
import accessibility from "./accessibility.json";
import editor from "./editor.json";
import theme from "./theme.json";
import constants from "./constants.json";

/**
 * Central configuration object that combines all settings
 * and provides type-safe access to configuration values.
 */
export const config = {
  elements,
  styles,
  pdf,
  layout,
  settings,
  form,
  ui,
  accessibility,
  editor,
  theme,
  constants,
} as const;

// Type exports for configuration objects
export type ElementConfig = typeof elements;
export type StyleConfig = typeof styles;
export type PDFConfig = typeof pdf;
export type LayoutConfig = typeof layout;
export type SettingsConfig = typeof settings;
export type FormConfig = typeof form;
export type UIConfig = typeof ui;
export type AccessibilityConfig = typeof accessibility;
export type EditorConfig = typeof editor;
export type ThemeConfig = typeof theme;
export type ConstantsConfig = typeof constants;

export default config;
