import { useMemo } from "react";
import config from "../config";

/**
 * Hook to access configuration values with optional overrides
 *
 * @param overrides - Optional configuration overrides
 * @returns The merged configuration object
 */
export const useConfig = (overrides?: Partial<typeof config>) => {
  return useMemo(() => {
    if (!overrides) return config;

    return {
      ...config,
      ...overrides,
      // Deep merge for nested objects
      elements: { ...config.elements, ...overrides.elements },
      styles: { ...config.styles, ...overrides.styles },
      form: { ...config.form, ...overrides.form },
      ui: { ...config.ui, ...overrides.ui },
    };
  }, [overrides]);
};
