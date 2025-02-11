import { FormElement } from "../types";
import config from "../config";

/**
 * Validates a single form element value
 *
 * @param element - The form element to validate
 * @param value - The current value of the element
 * @returns An array of validation error messages, empty if valid
 */
export const validateElement = (element: FormElement, value: any): string[] => {
  const errors: string[] = [];
  const { properties } = element;

  // Required field validation
  if (properties.required && !value) {
    errors.push(config.form.messages.validation.required);
    return errors;
  }

  if (!value) return errors;

  switch (element.type) {
    case "text":
    case "textarea":
      if (typeof value === "string") {
        if (properties.minLength && value.length < properties.minLength) {
          errors.push(
            config.form.messages.validation.minLength.replace(
              "{min}",
              properties.minLength,
            ),
          );
        }
        if (properties.maxLength && value.length > properties.maxLength) {
          errors.push(
            config.form.messages.validation.maxLength.replace(
              "{max}",
              properties.maxLength,
            ),
          );
        }
        if (properties.pattern && !new RegExp(properties.pattern).test(value)) {
          errors.push(config.form.messages.validation.pattern);
        }
      }
      break;

    case "number":
      const num = Number(value);
      if (properties.min !== undefined && num < properties.min) {
        errors.push(`Must be at least ${properties.min}`);
      }
      if (properties.max !== undefined && num > properties.max) {
        errors.push(`Must be no more than ${properties.max}`);
      }
      break;

    case "file":
      if (value instanceof File) {
        if (value.size > config.form.validation.file.maxSize) {
          errors.push(
            config.form.messages.validation.fileSize.replace(
              "{size}",
              String(config.form.validation.file.maxSize / 1024 / 1024),
            ),
          );
        }
        if (
          properties.accept &&
          !properties.accept
            .split(",")
            .some((type) => value.type.startsWith(type.trim().replace("*", "")))
        ) {
          errors.push(config.form.messages.validation.fileType);
        }
      }
      break;
  }

  return errors;
};

/**
 * Validates all form elements
 *
 * @param elements - Array of form elements
 * @param values - Object containing form values
 * @returns Object with element IDs as keys and arrays of error messages as values
 */
export const validateForm = (
  elements: FormElement[],
  values: Record<string, any>,
): Record<string, string[]> => {
  return elements.reduce(
    (acc, element) => {
      const errors = validateElement(element, values[element.i]);
      if (errors.length > 0) {
        acc[element.i] = errors;
      }
      return acc;
    },
    {} as Record<string, string[]>,
  );
};
