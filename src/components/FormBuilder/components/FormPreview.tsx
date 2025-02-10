import React from "react";
import { FormElement } from "../types";
import { PreviewElement } from "./PreviewElement";
import config from "../config";

interface FormPreviewProps {
  elements: FormElement[];
  onValueChange: (id: string, value: any) => void;
  values: Record<string, any>;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  elements,
  onValueChange,
  values,
}) => {
  // Group elements by their y-coordinate
  const elementsByRow = [...elements].reduce(
    (acc, element) => {
      const row = element.y;
      if (!acc[row]) acc[row] = [];
      acc[row].push(element);
      return acc;
    },
    {} as Record<number, FormElement[]>,
  );

  // Sort rows by y-coordinate and sort elements within each row by x-coordinate
  const sortedRows = Object.entries(elementsByRow)
    .sort(([rowA], [rowB]) => Number(rowA) - Number(rowB))
    .map(([_, rowElements]) => rowElements.sort((a, b) => a.x - b.x));

  return (
    <form className={config.styles.form.container}>
      <h2 className={config.styles.form.title}>Form Preview</h2>
      <div className={config.styles.form.grid}>
        {sortedRows.map((rowElements, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-12 gap-4">
            {rowElements.map((element) => {
              const colSpan = Math.min(element.w, 12);
              return (
                <div
                  key={element.i}
                  style={{
                    gridColumn: `span ${colSpan} / span ${colSpan}`,
                  }}
                  className="w-full"
                >
                  <label className="block text-sm font-medium mb-2">
                    {element.properties.label}
                    {element.properties.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <PreviewElement
                    element={element}
                    value={values[element.i]}
                    onChange={(value) => onValueChange(element.i, value)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </div>
    </form>
  );
};
