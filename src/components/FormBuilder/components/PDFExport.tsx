import React from "react";
import { FormElement } from "../types";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import config from "../config";

interface PDFExportProps {
  elements: FormElement[];
  formValues: Record<string, any>;
  onClose: () => void;
}

// Helper function to check if a cell should be skipped (part of colspan)
const isSkippedCell = (cellKey: string, cells: any, columns: number) => {
  const [row, col] = cellKey.split("-").map(Number);

  // Check if cell is part of a right colspan
  for (let i = 1; i <= columns; i++) {
    const prevCell = `${row}-${col - i}`;
    if (cells[prevCell]?.style?.colspanRight >= i) return true;
  }

  // Check if cell is part of a left colspan
  for (let i = 1; i <= columns; i++) {
    const nextCell = `${row}-${col + i}`;
    if (cells[nextCell]?.style?.colspanLeft >= i) return true;
  }

  return false;
};

export const PDFExport: React.FC<PDFExportProps> = ({
  elements,
  formValues,
  onClose,
}) => {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: config.pdf.styles.page.backgroundColor,
      padding:
        typeof config.pdf.styles.page.padding === "string"
          ? parseFloat(config.pdf.styles.page.padding)
          : config.pdf.styles.page.padding,
      color: config.pdf.styles.page.color,
      maxWidth:
        typeof config.pdf.styles.page.maxWidth === "string"
          ? parseFloat(config.pdf.styles.page.maxWidth)
          : config.pdf.styles.page.maxWidth,
    },
    title: {
      fontSize:
        typeof config.pdf.styles.title.fontSize === "string"
          ? parseFloat(config.pdf.styles.title.fontSize)
          : config.pdf.styles.title.fontSize,
      marginBottom:
        typeof config.pdf.styles.title.marginBottom === "string"
          ? parseFloat(config.pdf.styles.title.marginBottom)
          : config.pdf.styles.title.marginBottom,
      fontWeight: config.pdf.styles.title.fontWeight as
        | "normal"
        | "bold"
        | "medium"
        | "thin"
        | "hairline"
        | "ultralight"
        | "extralight"
        | "light"
        | "semibold"
        | "demibold"
        | "ultrabold"
        | "extrabold"
        | "heavy"
        | "black",
      color: config.pdf.styles.title.color,
      textAlign: config.pdf.styles.title.textAlign as
        | "left"
        | "center"
        | "right"
        | "justify",
    },
    row: {
      flexDirection: config.pdf.styles.row.flexDirection as
        | "row"
        | "row-reverse"
        | "column"
        | "column-reverse",
      marginBottom:
        typeof config.pdf.styles.row.marginBottom === "string"
          ? parseFloat(config.pdf.styles.row.marginBottom)
          : config.pdf.styles.row.marginBottom,
      width:
        typeof config.pdf.styles.row.width === "string"
          ? parseFloat(config.pdf.styles.row.width)
          : config.pdf.styles.row.width,
      gap:
        typeof config.pdf.styles.row.gap === "string"
          ? parseFloat(config.pdf.styles.row.gap)
          : config.pdf.styles.row.gap,
    },
    section: {
      padding:
        typeof config.pdf.styles.section.padding === "string"
          ? parseFloat(config.pdf.styles.section.padding)
          : config.pdf.styles.section.padding,
      marginRight:
        typeof config.pdf.styles.section.marginRight === "string"
          ? parseFloat(config.pdf.styles.section.marginRight)
          : config.pdf.styles.section.marginRight,
      marginBottom:
        typeof config.pdf.styles.section.marginBottom === "string"
          ? parseFloat(config.pdf.styles.section.marginBottom)
          : config.pdf.styles.section.marginBottom,
      marginLeft:
        typeof config.pdf.styles.section.marginLeft === "string"
          ? parseFloat(config.pdf.styles.section.marginLeft)
          : config.pdf.styles.section.marginLeft,
    },
    label: {
      fontSize:
        typeof config.pdf.styles.label.fontSize === "string"
          ? parseFloat(config.pdf.styles.label.fontSize)
          : config.pdf.styles.label.fontSize,
      marginBottom:
        typeof config.pdf.styles.label.marginBottom === "string"
          ? parseFloat(config.pdf.styles.label.marginBottom)
          : config.pdf.styles.label.marginBottom,
      color: config.pdf.styles.label.color,
      fontWeight: config.pdf.styles.label.fontWeight as
        | "normal"
        | "bold"
        | "medium"
        | "thin"
        | "hairline"
        | "ultralight"
        | "extralight"
        | "light"
        | "semibold"
        | "demibold"
        | "ultrabold"
        | "extrabold"
        | "heavy"
        | "black",
      lineHeight:
        typeof config.pdf.styles.label.lineHeight === "string"
          ? parseFloat(config.pdf.styles.label.lineHeight)
          : config.pdf.styles.label.lineHeight,
    },
    value: {
      fontSize:
        typeof config.pdf.styles.value.fontSize === "string"
          ? parseFloat(config.pdf.styles.value.fontSize)
          : config.pdf.styles.value.fontSize,
      color: config.pdf.styles.value.color,
    },
    required: {
      color: config.pdf.styles.required.color,
    },
  });

  // Add helper functions after styles declaration
  const mapFontWeight = (
    weight: string | number,
  ):
    | number
    | "normal"
    | "bold"
    | "medium"
    | "thin"
    | "hairline"
    | "ultralight"
    | "extralight"
    | "light"
    | "semibold"
    | "demibold"
    | "ultrabold"
    | "extrabold"
    | "heavy"
    | "black" => {
    if (typeof weight === "number") return weight;
    switch (weight) {
      case "normal":
      case "bold":
      case "medium":
      case "thin":
      case "hairline":
      case "ultralight":
      case "extralight":
      case "light":
      case "semibold":
      case "demibold":
      case "ultrabold":
      case "extrabold":
      case "heavy":
      case "black":
        return weight;
      case "bolder":
        return 800;
      case "lighter":
        return 300;
      default:
        return "normal";
    }
  };

  const mapFontStyle = (style: string): "normal" | "italic" => {
    return style === "oblique" || style === "italic" ? "italic" : "normal";
  };

  const getFontFamily = (weight: string, style: string): string => {
    const normalizedWeight = weight.toLowerCase();
    const normalizedStyle = style.toLowerCase();
    if (normalizedWeight === "bold" && normalizedStyle === "italic") {
      return "Helvetica-BoldOblique";
    } else if (normalizedWeight === "bold") {
      return "Helvetica-Bold";
    } else if (normalizedStyle === "italic") {
      return "Helvetica-Oblique";
    } else {
      return "Helvetica";
    }
  };

  const renderLabel = (element: FormElement) => {
    if (!element?.properties?.label) return null;
    const labelProps = element.properties.label;
    const labelText =
      typeof labelProps === "object" ? labelProps.text : labelProps;
    if (!labelText) return null;

    const labelStyle =
      typeof labelProps === "object"
        ? {
            ...styles.label,
            fontSize:
              parseFloat(
                labelProps.print?.fontSize ||
                  labelProps.fontSize ||
                  styles.label.fontSize,
              ) || 11,
            color:
              labelProps.print?.textColor ||
              labelProps.textColor ||
              styles.label.color,
            backgroundColor:
              labelProps.print?.backgroundColor ||
              labelProps.backgroundColor ||
              "transparent",
            fontWeight:
              labelProps.print?.fontWeight ||
              labelProps.fontWeight ||
              styles.label.fontWeight,
            fontStyle:
              labelProps.print?.fontStyle || labelProps.fontStyle || "normal",
            textAlign:
              labelProps.print?.textAlign || labelProps.textAlign || "left",
            textDecoration:
              labelProps.print?.textDecoration ||
              labelProps.textDecoration ||
              "none",
            lineHeight:
              parseFloat(
                labelProps.print?.lineHeight ||
                  labelProps.lineHeight ||
                  styles.label.lineHeight,
              ) || 1.2,
            letterSpacing: parseFloat(
              labelProps.print?.letterSpacing || labelProps.letterSpacing || 0,
            ),
            padding: parseInt(
              labelProps.print?.padding || labelProps.padding || 0,
            ),
          }
        : styles.label;

    return (
      <Text style={labelStyle}>
        {labelText}
        {element.properties.required && <Text style={styles.required}>*</Text>}
      </Text>
    );
  };

  const renderElementContent = (element: FormElement, value: any) => {
    if (element?.properties?.showInPDF === false) return null;

    switch (element.type) {
      case "date":
      case "time": {
        const pdfInputBorderColor =
          element.properties.inputBorderColorPDF || "#d1d5db";
        const pdfInputBorderRadius =
          typeof element.properties.inputBorderRadiusPDF === "number"
            ? element.properties.inputBorderRadiusPDF
            : 4;
        const pdfInputTextAlign =
          element.properties.inputTextAlignPDF || "left";
        const pdfInputFontSize = element.properties.inputFontSizePDF || 14;
        const pdfInputFontStyle =
          element.properties.inputFontStylePDF || "normal";
        const pdfInputFontWeight =
          element.properties.inputFontWeightPDF || "normal";
        const pdfInputFontColor =
          element.properties.inputFontColorPDF || "#000000";
        const pdfInputBorderStyle =
          element.properties.inputBorderStylePDF || "solid";
        const pdfInputHeight = element.properties.inputHeightPDF || 40;
        const pdfInputBorderWidth = element.properties.inputBorderWidthPDF || 1;
        const iconSize = 16;
        let iconSrc = "";
        if (element.type === "date") {
          // Calendar icon (base64 encoded SVG)
          iconSrc =
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iMyIgeT0iNCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcng9IjIiIC8+PGxpbmUgeDE9IjE2IiB5MT0iMiIgeDI9IjE2IiB5Mj0iNiIgLz48bGluZSB4MT0iOCIgeTE9IjIiIHgyPSI4IiB5Mj0iNiIgLz48bGluZSB4MT0iMyIgeTE9IjEwIiB4Mj0iMjEiIHkyPSIxMCIgLz48L3N2Zz4=";
        } else if (element.type === "time") {
          // Clock icon (base64 encoded SVG)
          iconSrc =
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIC8+PHBvbHlsaW5lIHBvaW50cz0iMTIgNiAxMiAxMiAxNiAxNCIgLz48L3N2Zz4=";
        }
        let displayValue = value || "";
        if (element.type === "date" && value) {
          const dateObj = new Date(value);
          if (!isNaN(dateObj.getTime())) {
            const day = ("0" + dateObj.getDate()).slice(-2);
            const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
            const year = dateObj.getFullYear();
            displayValue = `${day}/${month}/${year}`;
          }
        }
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 4,
              minHeight: pdfInputHeight,
              borderWidth: pdfInputBorderWidth,
              borderColor: pdfInputBorderColor,
              borderStyle: pdfInputBorderStyle,
              borderRadius: pdfInputBorderRadius,
            }}
          >
            <Text
              style={{
                ...styles.value,
                flex: 1,
                textAlign: pdfInputTextAlign,
                fontSize: pdfInputFontSize + "px",
                fontFamily: getFontFamily(
                  pdfInputFontWeight,
                  pdfInputFontStyle,
                ),
                color: pdfInputFontColor,
              }}
            >
              {displayValue}
            </Text>
            {iconSrc && (
              <Image
                src={iconSrc}
                style={{ width: iconSize, height: iconSize, marginLeft: 4 }}
              />
            )}
          </View>
        );
      }
      case "text":
      case "textarea":
      case "number":
      case "select": {
        const pdfInputBorderColor =
          element.properties.inputBorderColorPDF || "#d1d5db";
        const pdfInputBorderRadius =
          typeof element.properties.inputBorderRadiusPDF === "number"
            ? element.properties.inputBorderRadiusPDF
            : 4;
        const pdfInputTextAlign =
          element.properties.inputTextAlignPDF || "left";
        const pdfInputFontSize = element.properties.inputFontSizePDF || 14;
        const pdfInputFontStyle =
          element.properties.inputFontStylePDF || "normal";
        const pdfInputFontWeight =
          element.properties.inputFontWeightPDF || "normal";
        const pdfInputFontColor =
          element.properties.inputFontColorPDF || "#000000";
        const pdfInputBorderStyle =
          element.properties.inputBorderStylePDF || "solid";
        const pdfInputHeight = element.properties.inputHeightPDF || 40;
        const pdfInputBorderWidth = element.properties.inputBorderWidthPDF || 1;
        return (
          <View
            style={{
              padding: 4,
              minHeight: pdfInputHeight,
              borderWidth: pdfInputBorderWidth,
              borderColor: pdfInputBorderColor,
              borderStyle: pdfInputBorderStyle,
              borderRadius: pdfInputBorderRadius,
            }}
          >
            <Text
              style={{
                ...styles.value,
                textAlign: pdfInputTextAlign,
                fontSize: pdfInputFontSize + "px",
                fontFamily: getFontFamily(
                  pdfInputFontWeight,
                  pdfInputFontStyle,
                ),
                color: pdfInputFontColor,
              }}
            >
              {value || ""}
            </Text>
          </View>
        );
      }
      case "radio":
        return (
          <View style={{ flexDirection: "column", gap: 4 }}>
            {element.properties.options?.map((option, index) => {
              const optionText =
                typeof option === "object" ? option.text : option;
              const isSelected = value === optionText;
              return (
                <View
                  key={index}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderWidth: 1,
                      borderColor: "#000000",
                      borderRadius: 6,
                      backgroundColor: "white",
                      position: "relative",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#000000",
                        }}
                      />
                    )}
                  </View>
                  <Text style={styles.value}>{optionText}</Text>
                </View>
              );
            })}
          </View>
        );
      case "checkbox":
        return (
          <View style={{ flexDirection: "column", gap: 4 }}>
            {element.properties.options?.map((option, index) => {
              const optionText =
                typeof option === "object" ? option.text : option;
              const isSelected = Array.isArray(value)
                ? value[index]
                : index === 0 && value;
              return (
                <View
                  key={index}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderWidth: 1,
                      borderColor: "#6b7280",
                      backgroundColor: "white",
                      position: "relative",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#000000",
                          position: "absolute",
                          top: 0,
                          left: 3,
                        }}
                      >
                        X
                      </Text>
                    )}
                  </View>
                  <Text style={styles.value}>{optionText}</Text>
                </View>
              );
            })}
          </View>
        );
      case "toggle":
        return (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {element.properties.leftLabel && (
              <Text style={styles.value}>{element.properties.leftLabel}</Text>
            )}
            <View
              style={{
                padding: 4,
                backgroundColor: value ? "#dbeafe" : "#fee2e2",
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: value ? "#2563eb" : "#dc2626",
                }}
              >
                {value ? "ON" : "OFF"}
              </Text>
            </View>
            {element.properties.rightLabel && (
              <Text style={styles.value}>{element.properties.rightLabel}</Text>
            )}
          </View>
        );
      case "plainText":
        const defaultText = element.properties.defaultText;
        const textContent =
          typeof defaultText === "object" ? defaultText.text : defaultText;
        const textStyle =
          typeof defaultText === "object"
            ? {
                ...styles.value,
                fontSize:
                  parseFloat(
                    defaultText.print?.fontSize ||
                      defaultText.fontSize ||
                      styles.value.fontSize,
                  ) || 11,
                color:
                  defaultText.print?.textColor ||
                  defaultText.textColor ||
                  styles.value.color,
                backgroundColor:
                  defaultText.print?.backgroundColor ||
                  defaultText.backgroundColor ||
                  "transparent",
                fontWeight:
                  defaultText.print?.fontWeight ||
                  defaultText.fontWeight ||
                  "normal",
                fontStyle:
                  defaultText.print?.fontStyle ||
                  defaultText.fontStyle ||
                  "normal",
                textAlign:
                  defaultText.print?.textAlign ||
                  defaultText.textAlign ||
                  "left",
                textDecoration:
                  defaultText.print?.textDecoration ||
                  defaultText.textDecoration ||
                  "none",
                lineHeight:
                  parseFloat(
                    defaultText.print?.lineHeight ||
                      defaultText.lineHeight ||
                      "1.2",
                  ) || 1.2,
                letterSpacing: parseFloat(
                  defaultText.print?.letterSpacing ||
                    defaultText.letterSpacing ||
                    0,
                ),
                padding: parseInt(
                  defaultText.print?.padding || defaultText.padding || 0,
                ),
              }
            : styles.value;
        return <Text style={textStyle}>{textContent}</Text>;
      case "image":
        if (!value?.url) return null;
        return (
          <View style={{ width: "100%", height: 140 }}>
            <Image
              src={value.url}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </View>
        );
      case "spacer":
        return <View style={{ height: element.properties.rows * 10 }} />;
      case "pageBreak":
        return <View break />;
      case "table":
        return (
          <View
            style={{
              width: "100%",
              borderWidth: element.properties.borderWidth || 1,
              borderColor: element.properties.borderColor || "#6b7280",
              borderStyle: element.properties.borderStyle || "solid",
              borderRadius: element.properties.borderRadius || 0,
            }}
          >
            {Array.from({ length: element.properties.rows || 1 }).map(
              (_, rowIndex) => {
                const rowCells = Array.from({
                  length: element.properties.columns || 1,
                }).map((_, col) => `${rowIndex}-${col}`);
                const rowCellsWithSize = rowCells.filter(
                  (key) => element.properties.cells?.[key]?.style?.size,
                );
                const totalExplicitSize = rowCellsWithSize.reduce(
                  (sum, key) =>
                    sum + (element.properties.cells[key]?.style?.size || 0),
                  0,
                );
                const remainingSpace = 12 - totalExplicitSize;
                const remainingCells =
                  rowCells.length - rowCellsWithSize.length;
                const defaultSize =
                  remainingCells > 0
                    ? remainingSpace / remainingCells
                    : 12 / (element.properties.columns || 1);

                return (
                  <View
                    key={rowIndex}
                    style={{ flexDirection: "row", width: "100%" }}
                  >
                    {Array.from({
                      length: element.properties.columns || 1,
                    }).map((_, colIndex) => {
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const cell = element.properties.cells?.[cellKey];
                      const colspanRight = cell?.style?.colspanRight || 0;
                      const colspanLeft = cell?.style?.colspanLeft || 0;
                      const colspan = colspanRight + colspanLeft + 1;
                      const cellSize = cell?.style?.size || defaultSize;

                      // Skip cells that are part of a colspan
                      if (
                        isSkippedCell(
                          cellKey,
                          element.properties.cells,
                          element.properties.columns,
                        )
                      ) {
                        return null;
                      }

                      return (
                        <View
                          key={cellKey}
                          style={{
                            width: `${(cellSize / 12) * 100}%`,
                            padding: cell?.style?.padding || 8,
                            backgroundColor:
                              cell?.style?.backgroundColor || "transparent",
                            borderRightWidth:
                              colIndex === (element.properties.columns || 1) - 1
                                ? 0
                                : element.properties.borderWidth || 1,
                            borderBottomWidth:
                              rowIndex === (element.properties.rows || 1) - 1
                                ? 0
                                : element.properties.borderWidth || 1,
                            borderLeftWidth: 0,
                            borderTopWidth: 0,
                            borderColor:
                              element.properties.borderColor || "#6b7280",
                            borderStyle:
                              element.properties.borderStyle || "solid",
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
              },
            )}
          </View>
        );
      default:
        return <Text style={styles.value}>{value || ""}</Text>;
    }
  };

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
                  Record<string, FormElement[]>
                >((acc, element) => {
                  const row = element.y.toString();
                  if (!acc[row]) acc[row] = [];
                  acc[row].push(element);
                  return acc;
                }, {});

                // Sort rows by y coordinate and within each row by x coordinate
                const sortedRows = Object.entries(elementsByRow)
                  .sort(([rowA], [rowB]) => Number(rowA) - Number(rowB))
                  .map(([_, rowElements]) =>
                    rowElements.sort((a, b) => a.x - b.x),
                  );

                // Split rows into pages using a row that contains a pageBreak element as a divider
                const pages: FormElement[][][] = [];
                let currentPageRows: FormElement[][] = [];
                sortedRows.forEach((row) => {
                  currentPageRows.push(row);
                  if (row.some((el) => el.type === "pageBreak")) {
                    pages.push(currentPageRows);
                    currentPageRows = [];
                  }
                });
                if (currentPageRows.length > 0) {
                  pages.push(currentPageRows);
                }

                return pages.map((pageRows, pageIndex) => (
                  <Page key={pageIndex} size="A4" style={styles.page}>
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
                              ...styles.section,
                              width: `${((element.w || 12) / 12) * 100}%`,
                              paddingHorizontal: 8,
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
