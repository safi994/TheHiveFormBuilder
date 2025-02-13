import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Svg,
  Path,
  Font,
} from "@react-pdf/renderer";

// Register fonts
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf",
      fontStyle: "italic",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700italic.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormElement } from "../types";
import config from "../config";

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: "Open Sans",
  },
  ...config.pdf.styles,
  checkbox: {
    ...config.pdf.styles.elements.checkbox,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  select: config.pdf.styles.elements.select,
  input: config.pdf.styles.elements.input,
  label: {
    fontSize: 11,
    marginBottom: 4,
    color: "rgb(59, 53, 53)",
    fontWeight: "medium",
    lineHeight: 1,
  },
});

interface PDFExportProps {
  elements: FormElement[];
  formValues: Record<string, any>;
  onClose: () => void;
}

export const PDFExport: React.FC<PDFExportProps> = ({
  elements,
  formValues,
  onClose,
}) => {
  // Sort elements by y position first, then x position
  const sortedElements = [...elements].sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });

  const getTextStyle = (textObj: any) => {
    if (!textObj || typeof textObj !== "object") return {};

    // Use print styles if available, otherwise fallback to regular styles
    const styles = textObj.print || textObj;

    // Convert pixel values to numbers and remove 'px' suffix
    const fontSize = parseInt(styles.fontSize) || 14;
    const padding = parseInt(styles.padding) || 0;
    const lineHeight = parseFloat(styles.lineHeight) || 1.5;
    const letterSpacing = parseInt(styles.letterSpacing) || 0;

    return {
      fontSize,
      color: styles.textColor || "#000000",
      backgroundColor:
        styles.backgroundColor === "transparent"
          ? undefined
          : styles.backgroundColor,
      fontWeight: styles.fontWeight || "normal",
      fontStyle: styles.fontStyle || "normal",
      textAlign: styles.textAlign || "left",
      textDecoration:
        styles.textDecoration === "none" ? undefined : styles.textDecoration,
      lineHeight,
      letterSpacing,
      padding,
    };
  };

  const getTextContent = (textObj: any) => {
    if (!textObj) return "";
    return typeof textObj === "object" ? textObj.text : textObj;
  };

  const renderLabel = (element: FormElement) => {
    if (!element.properties.label) return null;
    const labelProps = element.properties.label;
    const labelText =
      typeof labelProps === "object" ? labelProps.text : labelProps;
    if (!labelText) return null;

    // Get print styles if available, otherwise use preview styles
    const labelStyle =
      typeof labelProps === "object"
        ? {
            fontSize: parseInt(
              labelProps.print?.fontSize || labelProps.fontSize || "11",
            ),
            color:
              labelProps.print?.textColor ||
              labelProps.textColor ||
              "rgb(59, 53, 53)",
            backgroundColor:
              labelProps.print?.backgroundColor ||
              labelProps.backgroundColor ||
              "transparent",
            fontWeight:
              labelProps.print?.fontWeight || labelProps.fontWeight || "normal",
            fontStyle:
              labelProps.print?.fontStyle || labelProps.fontStyle || "normal",
            textAlign:
              labelProps.print?.textAlign || labelProps.textAlign || "left",
            textDecoration:
              labelProps.print?.textDecoration ||
              labelProps.textDecoration ||
              "none",
            lineHeight: parseFloat(
              labelProps.print?.lineHeight || labelProps.lineHeight || "1",
            ),
            letterSpacing: parseInt(
              labelProps.print?.letterSpacing ||
                labelProps.letterSpacing ||
                "0",
            ),
            padding: parseInt(
              labelProps.print?.padding || labelProps.padding || "0",
            ),
            marginBottom: 4,
          }
        : styles.label;

    return (
      <Text style={labelStyle}>
        {labelText}
        {element.properties.required && (
          <Text style={{ color: "#dc2626" }}> *</Text>
        )}
      </Text>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-[85vw] h-[85vh] flex flex-col shadow-2xl border">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">PDF Preview</h2>
            <Button
              onClick={() => {
                // This is just a placeholder since PDFDownloadLink will handle the actual download
                const link = document.createElement("a");
                link.click();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 p-6 bg-gray-50 m-6 rounded-xl">
          <PDFViewer
            width="100%"
            height="100%"
            className="rounded-lg overflow-hidden"
          >
            <Document>
              {(() => {
                // Split elements into pages based on page breaks
                const pages = sortedElements.reduce((acc, element) => {
                  if (element.type === "pageBreak") {
                    acc.push([]);
                  } else {
                    if (acc.length === 0) acc.push([]);
                    acc[acc.length - 1].push(element);
                  }
                  return acc;
                }, [] as FormElement[][]);

                return pages.map((pageElements, pageIndex) => (
                  <Page key={pageIndex} size="A4" style={styles.page}>
                    {(() => {
                      // Group elements by their y-coordinate
                      const elementsByRow = pageElements.reduce(
                        (acc, element) => {
                          const row = element.y;
                          if (!acc[row]) acc[row] = [];
                          acc[row].push(element);
                          return acc;
                        },
                        {},
                      );

                      // Sort rows by y-coordinate and sort elements within each row by x-coordinate
                      return Object.entries(elementsByRow)
                        .sort(([rowA], [rowB]) => Number(rowA) - Number(rowB))
                        .map(([_, rowElements]) =>
                          rowElements.sort((a, b) => a.x - b.x),
                        )
                        .map((rowElements, rowIndex) => (
                          <View key={rowIndex} style={styles.row}>
                            {rowElements.map((element) =>
                              !element.properties.showInPDF ? null : (
                                <View
                                  key={element.i}
                                  style={[
                                    styles.section,
                                    {
                                      width: `${(element.w / 12) * 100}%`,
                                      paddingRight: 8,
                                      height:
                                        element.type === "spacer" &&
                                        element.properties.showInPDF
                                          ? element.properties.rows * 20
                                          : undefined,
                                      padding:
                                        element.type === "spacer"
                                          ? 0
                                          : undefined,
                                      margin:
                                        element.type === "spacer"
                                          ? 0
                                          : undefined,
                                    },
                                  ]}
                                >
                                  {(() => {
                                    if (element.type === "spacer") {
                                      return null;
                                    }
                                    const value = formValues[element.i];

                                    // Render label for all elements except plainText
                                    const label =
                                      element.type !== "plainText"
                                        ? renderLabel(element)
                                        : null;

                                    const content = (() => {
                                      switch (element.type) {
                                        case "plainText":
                                          return (
                                            <Text
                                              style={[
                                                styles.defaultText,
                                                getTextStyle(
                                                  element.properties
                                                    .defaultText,
                                                ),
                                              ]}
                                            >
                                              {getTextContent(
                                                value ||
                                                  element.properties
                                                    .defaultText,
                                              )}
                                            </Text>
                                          );
                                        case "textarea":
                                          return (
                                            <View style={styles.input}>
                                              <Text selectable>
                                                {value || ""}
                                              </Text>
                                            </View>
                                          );
                                        case "date":
                                          return (
                                            <View style={styles.input}>
                                              <Text selectable>
                                                {value
                                                  ? new Date(value)
                                                      .toLocaleDateString(
                                                        "en-GB",
                                                        {
                                                          day: "2-digit",
                                                          month: "2-digit",
                                                          year: "numeric",
                                                        },
                                                      )
                                                      .replace(/\//g, "/")
                                                  : "dd/mm/yyyy"}
                                              </Text>
                                            </View>
                                          );
                                        case "time":
                                          return (
                                            <View style={styles.input}>
                                              <Text selectable>
                                                {value || ""}
                                              </Text>
                                            </View>
                                          );
                                        case "file":
                                          return (
                                            <View style={styles.input}>
                                              <Text selectable>
                                                {value?.name ||
                                                  "No file selected"}
                                              </Text>
                                            </View>
                                          );
                                        case "image":
                                          return value?.url ? (
                                            <View style={{ marginTop: 4 }}>
                                              <Image
                                                src={value.url}
                                                style={{
                                                  width: "100%",
                                                  maxHeight: 300,
                                                }}
                                              />
                                            </View>
                                          ) : (
                                            <View style={styles.input}>
                                              <Text>No image uploaded</Text>
                                            </View>
                                          );
                                        case "toggle":
                                          return (
                                            <View
                                              style={{
                                                flexDirection: "row",
                                                gap: 8,
                                                alignItems: "center",
                                              }}
                                            >
                                              <Text style={{ fontSize: 12 }}>
                                                {element.properties.leftLabel ||
                                                  ""}
                                              </Text>
                                              <View
                                                style={{
                                                  borderWidth: 1,
                                                  borderColor: value
                                                    ? "#bfdbfe"
                                                    : "#fecaca",
                                                  borderRadius: 4,
                                                  padding: "2 4",
                                                }}
                                              >
                                                <Text
                                                  style={{
                                                    fontSize: 10,
                                                    color: value
                                                      ? "#2563eb"
                                                      : "#dc2626",
                                                  }}
                                                >
                                                  {value ? "ON" : "OFF"}
                                                </Text>
                                              </View>
                                              <Text style={{ fontSize: 12 }}>
                                                {element.properties
                                                  .rightLabel || ""}
                                              </Text>
                                            </View>
                                          );
                                        case "checkbox":
                                          return (
                                            <View style={{ gap: 4 }}>
                                              {(Array.isArray(
                                                element.properties.options,
                                              ) &&
                                              element.properties.options
                                                .length > 0
                                                ? element.properties.options
                                                : [element.properties.label]
                                              ).map((option, index) => (
                                                <View
                                                  key={index}
                                                  style={
                                                    styles.checkboxContainer
                                                  }
                                                >
                                                  <View style={styles.checkbox}>
                                                    {(Array.isArray(value)
                                                      ? value[index]
                                                      : index === 0 &&
                                                        value) && (
                                                      <Svg
                                                        width="10"
                                                        height="10"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <Path
                                                          d="M20 6L9 17L4 12"
                                                          stroke="#000"
                                                          strokeWidth="2"
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          fill="none"
                                                        />
                                                      </Svg>
                                                    )}
                                                  </View>
                                                  <Text
                                                    style={{ fontSize: 12 }}
                                                  >
                                                    {getTextContent(option)}
                                                  </Text>
                                                </View>
                                              ))}
                                            </View>
                                          );
                                        case "select":
                                          return (
                                            <View style={styles.select}>
                                              <Text selectable>
                                                {value || ""}
                                              </Text>
                                            </View>
                                          );
                                        case "radio":
                                          return (
                                            <View style={{ gap: 4 }}>
                                              {(Array.isArray(
                                                element.properties.options,
                                              ) &&
                                              element.properties.options
                                                .length > 0
                                                ? element.properties.options
                                                : [element.properties.label]
                                              ).map((option, index) => {
                                                const optionText =
                                                  typeof option === "object"
                                                    ? option.text
                                                    : option;
                                                return (
                                                  <View
                                                    key={index}
                                                    style={
                                                      styles.checkboxContainer
                                                    }
                                                  >
                                                    <View
                                                      style={[
                                                        styles.checkbox,
                                                        { borderRadius: 6 },
                                                      ]}
                                                    >
                                                      {value === optionText && (
                                                        <View
                                                          style={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor:
                                                              "#000",
                                                          }}
                                                        />
                                                      )}
                                                    </View>
                                                    <Text
                                                      style={{ fontSize: 12 }}
                                                    >
                                                      {optionText}
                                                    </Text>
                                                  </View>
                                                );
                                              })}
                                            </View>
                                          );
                                        default:
                                          return (
                                            <View style={styles.input}>
                                              <Text selectable>
                                                {value || ""}
                                              </Text>
                                            </View>
                                          );
                                      }
                                    })();

                                    const labelSpacing =
                                      element.properties.labelSpacingPDF ||
                                      element.properties.labelSpacing ||
                                      8;
                                    return (
                                      <View>
                                        {label}
                                        <View
                                          style={{ marginTop: labelSpacing }}
                                        >
                                          {content}
                                        </View>
                                      </View>
                                    );
                                  })()}
                                </View>
                              ),
                            )}
                          </View>
                        ));
                    })()}
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
