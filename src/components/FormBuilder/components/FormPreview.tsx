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

  const renderFormTitle = () => {
    const titleElement = elements.find(
      (el) => el.type === "plainText" && el.properties.isTitle,
    );
    if (titleElement) {
      const titleText = titleElement.properties.defaultText;
      const titleContent =
        typeof titleText === "object" ? titleText.text : titleText;
      const titleStyle =
        typeof titleText === "object"
          ? {
              ...(titleText.preview || titleText),
              fontSize: "24px",
              fontWeight: "bold",
            }
          : {};
      return (
        <h2 className={config.styles.form.title} style={titleStyle}>
          {titleContent}
        </h2>
      );
    }
    return <h2 className={config.styles.form.title}>Form Preview</h2>;
  };

  return (
    <form className={config.styles.form.container}>
      {renderFormTitle()}
      <div className={config.styles.form.grid}>
        {sortedRows.map((rowElements, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-12 gap-4">
            {rowElements.map((element) => {
              const colSpan = Math.min(element.w, 12);
              if (!element.properties.showInPreview) return null;
              return (
                <div
                  key={element.i}
                  style={{
                    gridColumn: `span ${colSpan} / span ${colSpan}`,
                  }}
                  className="w-full"
                >
                  <PreviewElement
                    element={element}
                    value={values[element.i]}
                    onChange={(value) => onValueChange(element.i, value)}
                    isPreview={true}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <button type="submit" className={config.styles.form.submitButton}>
          Submit
        </button>
      </div>
    </form>
  );
};
