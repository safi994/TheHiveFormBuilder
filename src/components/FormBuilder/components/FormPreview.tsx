import React from "react";
import { FormElement } from "../types";
import { PreviewElement } from "./PreviewElement";

interface FormPreviewProps {
  elements: FormElement[];
}

export const FormPreview: React.FC<FormPreviewProps> = ({ elements }) => {
  return (
    <form className="w-full bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Form Preview</h2>
      <div className="grid grid-cols-12 gap-4">
        {[...elements]
          .sort((a, b) => {
            // First sort by y-coordinate
            if (a.y !== b.y) return a.y - b.y;
            // If y-coordinates are equal, sort by x-coordinate
            return a.x - b.x;
          })
          .map((element) => {
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
                <PreviewElement element={element} />
              </div>
            );
          })}
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
