import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  PDFViewer,
  Font,
} from "@react-pdf/renderer";
import { FormElement } from "../types"; // Adjust if needed

/**
 * 1) Register custom fonts so that different weights & styles actually work.
 *    Make sure these .ttf files exist at the specified paths or URLs.
 */
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://kfzkiel.de/wp-content/uploads/Roboto-Regular.ttf", // or a public URL
      fontWeight: "normal",
      fontStyle: "normal",
    },
    {
      src: "https://kfzkiel.de/wp-content/uploads/Roboto-Italic.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
    {
      src: "https://kfzkiel.de/wp-content/uploads/Roboto-Bold.ttf",
      fontWeight: "bold",
      fontStyle: "normal",
    },
    {
      src: "https://kfzkiel.de/wp-content/uploads/Roboto-BoldItalic.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
    // If you need extra weights (e.g., 300, 500, 900), register them here.
  ],
});

/**
 * 2) Create an interface for our PDFExport component props.
 */
interface PDFExportProps {
  elements: FormElement[];
  formValues: Record<string, any>;
  onClose: () => void;
}

/**
 * 3) Utility to check if a table cell should be skipped (because of colspan).
 */
const isSkippedCell = (cellKey: string, cells: any, columns: number) => {
  const [row, col] = cellKey.split("-").map(Number);

  // Check right colspan
  for (let i = 1; i <= columns; i++) {
    const prevCell = `${row}-${col - i}`;
    if (cells[prevCell]?.style?.colspanRight >= i) return true;
  }

  // Check left colspan
  for (let i = 1; i <= columns; i++) {
    const nextCell = `${row}-${col + i}`;
    if (cells[nextCell]?.style?.colspanLeft >= i) return true;
  }

  return false;
};

/**
 * 4) Global styles used by default. You can tweak these if you want
 *    different base colors, spacing, etc.
 */
const baseStyles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: "#ffffff",
  },
  section: {
    padding: 8,
    marginBottom: 8,
  },
  label: {
    fontFamily: "Roboto",
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  required: {
    color: "#f00",
  },
  value: {
    fontFamily: "Roboto",
    fontSize: 10,
    fontWeight: "normal",
    color: "#000",
  },
});

/**
 * 5) The main PDFExport component
 */
export const PDFExport: React.FC<PDFExportProps> = ({
  elements,
  formValues,
  onClose,
}) => {
  // Helper to render the label (if any)
  const renderLabel = (element: FormElement) => {
    const labelProps = element.properties?.label;
    if (!labelProps) return null;

    // The user might have a string label or an object with styling info
    const labelText =
      typeof labelProps === "object" ? labelProps.text : labelProps;
    if (!labelText) return null;

    // If labelProps is an object, we can read extra styling
    if (typeof labelProps === "object") {
      // Convert to numeric or default
      const fontSize = labelProps.print?.fontSize
        ? parseFloat(labelProps.print.fontSize)
        : labelProps.fontSize
          ? parseFloat(labelProps.fontSize)
          : 10;
      const color =
        labelProps.print?.textColor || labelProps.textColor || "#000";
      const bgColor =
        labelProps.print?.backgroundColor ||
        labelProps.backgroundColor ||
        "transparent";
      const fontWeight =
        (labelProps.print?.fontWeight || labelProps.fontWeight) ?? "bold";
      const fontStyle =
        labelProps.print?.fontStyle || labelProps.fontStyle || "normal";
      const textAlign =
        labelProps.print?.textAlign || labelProps.textAlign || "left";
      const textDecoration =
        labelProps.print?.textDecoration || labelProps.textDecoration || "none";
      const lineHeight =
        Number(labelProps.print?.lineHeight || labelProps.lineHeight) || 1.2;
      const letterSpacing =
        Number(labelProps.print?.letterSpacing || labelProps.letterSpacing) ||
        0;
      const padding =
        Number(labelProps.print?.padding || labelProps.padding) || 0;

      return (
        <Text
          style={{
            fontFamily: "Roboto",
            fontSize,
            fontWeight,
            fontStyle,
            color,
            backgroundColor: bgColor,
            textAlign,
            textDecoration,
            lineHeight,
            letterSpacing,
            padding,
            marginBottom: 4,
          }}
        >
          {labelText}
          {element.properties.required && (
            <Text style={baseStyles.required}>*</Text>
          )}
        </Text>
      );
    } else {
      // Plain string label
      return (
        <Text style={baseStyles.label}>
          {labelText}
          {element.properties.required && (
            <Text style={baseStyles.required}>*</Text>
          )}
        </Text>
      );
    }
  };

  // The main function to render each form element's "content" (i.e., input, checkbox, etc.)
  const renderElementContent = (element: FormElement, value: any) => {
    // If property says "no PDF rendering," skip:
    if (element.properties?.showInPDF === false) return null;

    switch (element.type) {
      case "text":
      case "textarea":
      case "number":
      case "select":
      case "date":
      case "time": {
        // We'll unify these input-based elements for brevity
        // Example: read some PDF-specific props
        const pdfInputBorderColor =
          element.properties.inputBorderColorPDF || "#ccc";
        const pdfInputBorderRadius =
          Number(element.properties.inputBorderRadiusPDF) || 4;
        const pdfInputTextAlign =
          element.properties.inputTextAlignPDF || "left";
        const pdfInputFontSize =
          Number(element.properties.inputFontSizePDF) || 10;
        const pdfInputFontStyle =
          element.properties.inputFontStylePDF || "normal";
        const pdfInputFontWeight =
          element.properties.inputFontWeightPDF || "normal";
        const pdfInputFontColor =
          element.properties.inputFontColorPDF || "#000";
        const pdfInputBorderStyle =
          element.properties.inputBorderStylePDF || "solid";
        const pdfInputBorderWidth =
          Number(element.properties.inputBorderWidthPDF) || 1;
        const pdfInputHeight = Number(element.properties.inputHeightPDF) || 20;

        // If it's a "date", you might want to format it:
        let displayValue = value || "";
        if (element.type === "date" && value) {
          const dateObj = new Date(value);
          if (!isNaN(dateObj.getTime())) {
            const day = ("0" + dateObj.getDate()).slice(-2);
            const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
            const year = dateObj.getFullYear();
            displayValue = `${day}/${month}/${year}`;
          }
        } else {
          displayValue = value || "";
        }

        return (
          <View
            style={{
              minHeight: pdfInputHeight,
              padding: 4,
              borderWidth: pdfInputBorderWidth,
              borderColor: pdfInputBorderColor,
              borderStyle: pdfInputBorderStyle,
              borderRadius: pdfInputBorderRadius,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Roboto",
                fontSize: pdfInputFontSize,
                fontWeight: pdfInputFontWeight,
                fontStyle: pdfInputFontStyle,
                color: pdfInputFontColor,
                textAlign: pdfInputTextAlign,
              }}
            >
              {displayValue}
            </Text>
          </View>
        );
      }

      case "radio": {
        const options = element.properties.options || [];
        return (
          <View>
            {options.map((option: any, idx: number) => {
              const optionText =
                typeof option === "object" ? option.text : option;
              const isSelected = value === optionText;

              // If option is an object, read styling:
              let optionStyle = baseStyles.value;
              if (typeof option === "object") {
                const fontSize =
                  Number(option.print?.fontSize || option.fontSize) || 10;
                const color =
                  option.print?.textColor || option.textColor || "#000";
                const fontWeight =
                  option.print?.fontWeight || option.fontWeight || "normal";
                const fontStyle =
                  option.print?.fontStyle || option.fontStyle || "normal";

                optionStyle = {
                  fontFamily: "Roboto",
                  fontSize,
                  fontWeight,
                  fontStyle,
                  color,
                };
              }

              return (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  {/* Circle for radio */}
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderWidth: 1,
                      borderColor: "#000",
                      borderRadius: 6,
                      marginRight: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fff",
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#000",
                        }}
                      />
                    )}
                  </View>
                  <Text style={optionStyle}>{optionText}</Text>
                </View>
              );
            })}
          </View>
        );
      }

      case "checkbox": {
        const options = element.properties.options || [];
        return (
          <View>
            {options.map((option: any, idx: number) => {
              const optionText =
                typeof option === "object" ? option.text : option;
              // For checkboxes, "value" might be an array of booleans or something else
              const isChecked = Array.isArray(value)
                ? value[idx]
                : idx === 0 && value;

              // If option is an object, read styling:
              let optionStyle = baseStyles.value;
              if (typeof option === "object") {
                const fontSize =
                  Number(option.print?.fontSize || option.fontSize) || 10;
                const color =
                  option.print?.textColor || option.textColor || "#000";
                const fontWeight =
                  option.print?.fontWeight || option.fontWeight || "normal";
                const fontStyle =
                  option.print?.fontStyle || option.fontStyle || "normal";

                optionStyle = {
                  fontFamily: "Roboto",
                  fontSize,
                  fontWeight,
                  fontStyle,
                  color,
                };
              }

              return (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  {/* Square for checkbox */}
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderWidth: 1,
                      borderColor: "#666",
                      marginRight: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fff",
                    }}
                  >
                    {isChecked && (
                      <Text
                        style={{
                          fontFamily: "Roboto",
                          fontSize: 10,
                          color: "#000",
                          position: "absolute",
                          top: -2,
                          left: 3,
                        }}
                      >
                        X
                      </Text>
                    )}
                  </View>
                  <Text style={optionStyle}>{optionText}</Text>
                </View>
              );
            })}
          </View>
        );
      }

      case "toggle": {
        // Simple ON/OFF
        const isOn = Boolean(value);
        const leftLabel = element.properties.leftLabel || "";
        const rightLabel = element.properties.rightLabel || "";

        return (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {leftLabel && (
              <Text style={[baseStyles.value, { marginRight: 8 }]}>
                {leftLabel}
              </Text>
            )}
            <View
              style={{
                padding: 4,
                backgroundColor: isOn ? "#dbeafe" : "#fee2e2",
                borderRadius: 4,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Roboto",
                  fontSize: 10,
                  color: isOn ? "#2563eb" : "#dc2626",
                }}
              >
                {isOn ? "ON" : "OFF"}
              </Text>
            </View>
            {rightLabel && <Text style={baseStyles.value}>{rightLabel}</Text>}
          </View>
        );
      }

      case "plainText": {
        const defaultText = element.properties.defaultText;
        const textContent =
          typeof defaultText === "object" ? defaultText.text : defaultText;
        if (!textContent) return null;

        if (typeof defaultText === "object") {
          const fontSize = defaultText.print?.fontSize
            ? parseFloat(defaultText.print.fontSize)
            : defaultText.fontSize
              ? parseFloat(defaultText.fontSize)
              : 10;
          const color =
            defaultText.print?.textColor || defaultText.textColor || "#000";
          const fontWeight =
            defaultText.print?.fontWeight || defaultText.fontWeight || "normal";
          const fontStyle =
            defaultText.print?.fontStyle || defaultText.fontStyle || "normal";
          const bgColor =
            defaultText.print?.backgroundColor ||
            defaultText.backgroundColor ||
            "transparent";

          const textDecoration =
            defaultText.print?.textDecoration ||
            defaultText.textDecoration ||
            "none";
          return (
            <Text
              style={{
                fontFamily: "Roboto",
                fontSize,
                fontWeight,
                fontStyle,
                color,
                backgroundColor: bgColor,
                textDecoration,
              }}
            >
              {textContent}
            </Text>
          );
        } else {
          // plain string
          return <Text style={baseStyles.value}>{textContent}</Text>;
        }
      }

      case "image": {
        // If an image has a value with `.url`, display
        if (!value?.url) return null;
        return (
          <View style={{ width: "100%", height: 140 }}>
            <Image
              src={value.url}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </View>
        );
      }

      case "spacer":
        // Let user specify how many rows to space
        return <View style={{ height: (element.properties.rows || 1) * 10 }} />;

      case "pageBreak":
        // Force new page
        return <View break />;

      case "table": {
        // Render a table with the given rows/columns
        const {
          rows = 1,
          columns = 1,
          borderWidth = 1,
          borderColor = "#666",
          borderStyle = "solid",
          borderRadius = 0,
          cells = {},
        } = element.properties;

        return (
          <View
            style={{
              width: "100%",
              borderWidth,
              borderColor,
              borderStyle,
              borderRadius,
            }}
          >
            {Array.from({ length: rows }).map((_, rowIndex) => {
              // For each row, figure out the cell keys
              const rowCells = Array.from({ length: columns }).map(
                (_, colIndex) => `${rowIndex}-${colIndex}`,
              );
              // Figure out column sizing
              const rowCellsWithSize = rowCells.filter(
                (key) => cells[key]?.style?.size,
              );
              const totalExplicitSize = rowCellsWithSize.reduce(
                (sum, key) => sum + (cells[key]?.style?.size || 0),
                0,
              );
              const remainingSpace = 12 - totalExplicitSize;
              const remainingCells = rowCells.length - rowCellsWithSize.length;
              const defaultSize =
                remainingCells > 0
                  ? remainingSpace / remainingCells
                  : 12 / columns;

              return (
                <View
                  key={rowIndex}
                  style={{ flexDirection: "row", width: "100%" }}
                >
                  {Array.from({ length: columns }).map((_, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`;
                    const cell = cells[cellKey];

                    // If this cell is within a colspan, skip rendering
                    if (isSkippedCell(cellKey, cells, columns)) return null;

                    const cellSize = cell?.style?.size || defaultSize;

                    return (
                      <View
                        key={cellKey}
                        style={{
                          width: `${(cellSize / 12) * 100}%`,
                          padding: cell?.style?.padding || 8,
                          backgroundColor:
                            cell?.style?.backgroundColor || "transparent",
                          borderRightWidth:
                            colIndex === columns - 1 ? 0 : borderWidth,
                          borderBottomWidth:
                            rowIndex === rows - 1 ? 0 : borderWidth,
                          borderLeftWidth: 0,
                          borderTopWidth: 0,
                          borderColor,
                          borderStyle,
                        }}
                      >
                        {cell && (
                          <>
                            {cell.type !== "plainText" && renderLabel(cell)}
                            {renderElementContent(cell, value?.[cellKey])}
                          </>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        );
      }

      default:
        // If element type not recognized, just show value
        return <Text style={baseStyles.value}>{value || ""}</Text>;
    }
  };

  /**
   * 6) Main return: a modal-like overlay with PDFViewer
   *    that splits elements into rows -> pages -> etc.
   */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">PDF Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <PDFViewer width="100%" height="100%">
            <Document>
              {(() => {
                // Group elements by row (y coordinate)
                const elementsByRow = elements.reduce<
                  Record<number, FormElement[]>
                >((acc, el) => {
                  const rowKey = el.y;
                  if (!acc[rowKey]) acc[rowKey] = [];
                  acc[rowKey].push(el);
                  return acc;
                }, {});

                // Sort rows by y, then sort each row's elements by x
                const sortedRowArrays = Object.keys(elementsByRow)
                  .map((k) => Number(k))
                  .sort((a, b) => a - b)
                  .map((rowKey) =>
                    elementsByRow[rowKey].sort((a, b) => a.x - b.x),
                  );

                // Split into pages where we encounter "pageBreak"
                const pages: FormElement[][][] = [];
                let currentPageRows: FormElement[][] = [];

                sortedRowArrays.forEach((row) => {
                  currentPageRows.push(row);
                  // If this row has a pageBreak element, start a new page after it
                  if (row.some((r) => r.type === "pageBreak")) {
                    pages.push(currentPageRows);
                    currentPageRows = [];
                  }
                });
                // Push remaining rows if any
                if (currentPageRows.length) {
                  pages.push(currentPageRows);
                }

                // Now map over pages
                return pages.map((pageRows, pageIndex) => (
                  <Page key={pageIndex} size="A4" style={baseStyles.page}>
                    {pageRows.map((row, rowIndex) => (
                      <View
                        key={rowIndex}
                        style={{
                          flexDirection: "row",
                          width: "100%",
                          marginBottom: 16,
                        }}
                      >
                        {row.map((element) => (
                          <View
                            key={element.i}
                            style={{
                              ...baseStyles.section,
                              // convert element.w (grid width, out of 12) to %
                              width: `${((element.w || 12) / 12) * 100}%`,
                            }}
                          >
                            {renderLabel(element)}
                            <View style={{ marginTop: 8 }}>
                              {renderElementContent(
                                element,
                                formValues[element.i],
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    ))}
                  </Page>
                ));
              })()}
            </Document>
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};
