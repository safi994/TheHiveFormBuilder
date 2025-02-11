import React from "react";
import { FormElementProps } from "../../types";

/**
 * Spacer Component
 *
 * A form element that renders a configurable vertical space.
 *
 * @param element - The form element configuration
 * @param isPreview - Whether the spacer is being rendered in preview mode
 */
export const Spacer: React.FC<FormElementProps> = ({ element, isPreview }) => {
  const { properties } = element;

  if (isPreview && !properties.showInPreview) return null;

  return (
    <div
      className={`w-full ${!isPreview ? "border border-dashed border-gray-200/50 rounded-md" : ""}`}
      style={{ height: `${properties.rows * 50}px` }}
    />
  );
};
