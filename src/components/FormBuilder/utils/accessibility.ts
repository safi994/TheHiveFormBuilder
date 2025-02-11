import config from "../config";
import { FormElement } from "../types";

/**
 * Generates ARIA attributes for a form element
 *
 * @param element - The form element
 * @param hasError - Whether the element has validation errors
 * @returns Object containing ARIA attributes
 */
export const getAriaAttributes = (element: FormElement, hasError?: boolean) => {
  const { properties } = element;
  const attributes: Record<string, string> = {};

  // Required state
  if (properties.required) {
    attributes["aria-required"] = "true";
    attributes["aria-label"] =
      `${properties.label} ${config.accessibility.aria.labels.required}`;
  } else {
    attributes["aria-label"] =
      `${properties.label} ${config.accessibility.aria.labels.optional}`;
  }

  // Error state
  if (hasError) {
    attributes["aria-invalid"] = "true";
    attributes["aria-errormessage"] = `error-${element.i}`;
  }

  return attributes;
};

/**
 * Generates keyboard event handlers for form elements
 *
 * @param element - The form element
 * @param handlers - Object containing event handlers
 * @returns Object containing keyboard event handlers
 */
export const getKeyboardHandlers = (
  element: FormElement,
  handlers: {
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
  },
) => {
  return {
    onKeyDown: (e: React.KeyboardEvent) => {
      // Delete element
      if (e.key === "Delete" && handlers.onDelete) {
        handlers.onDelete();
      }

      // Move element
      if (e.ctrlKey) {
        if (e.key === "ArrowUp" && handlers.onMoveUp) {
          e.preventDefault();
          handlers.onMoveUp();
        } else if (e.key === "ArrowDown" && handlers.onMoveDown) {
          e.preventDefault();
          handlers.onMoveDown();
        }
      }
    },
  };
};
