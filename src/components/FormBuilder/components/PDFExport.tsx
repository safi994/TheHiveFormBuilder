import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
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
              <Page size="A4" style={styles.page}>
                {(() => {
                  // Group elements by their y-coordinate
                  const elementsByRow = sortedElements.reduce(
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
                                    element.type === "spacer" ? 0 : undefined,
                                  margin:
                                    element.type === "spacer" ? 0 : undefined,
                                },
                              ]}
                            >
                              {element.type !== "spacer" && (
                                <View
                                  style={{
                                    marginBottom:
                                      element.properties.labelSpacingPDF || 8,
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.label,
                                      getTextStyle(element.properties.label),
                                    ]}
                                  >
                                    {getTextContent(element.properties.label)}
                                    {element.properties.required && (
                                      <Text style={styles.required}> *</Text>
                                    )}
                                  </Text>
                                </View>
                              )}
                              {(() => {
                                if (element.type === "spacer") {
                                  return null;
                                }
                                const value = formValues[element.i];
                                switch (element.type) {
                                  case "plainText":
                                    return (
                                      <View>
                                        <Text
                                          style={[
                                            styles.defaultText,
                                            getTextStyle(
                                              element.properties.defaultText,
                                            ),
                                          ]}
                                        >
                                          {getTextContent(
                                            value ||
                                              element.properties.defaultText,
                                          )}
                                        </Text>
                                      </View>
                                    );
                                  case "textarea":
                                    return (
                                      <View style={styles.input}>
                                        <Text selectable>{value || ""}</Text>
                                      </View>
                                    );
                                  case "date":
                                    return (
                                      <View style={styles.input}>
                                        <Text selectable>
                                          {value
                                            ? new Date(value)
                                                .toLocaleDateString("en-GB", {
                                                  day: "2-digit",
                                                  month: "2-digit",
                                                  year: "numeric",
                                                })
                                                .replace(/\//g, "/")
                                            : "dd/mm/yyyy"}
                                        </Text>
                                      </View>
                                    );
                                  case "time":
                                    return (
                                      <View style={styles.input}>
                                        <Text selectable>{value || ""}</Text>
                                      </View>
                                    );
                                  case "file":
                                    return (
                                      <View style={styles.input}>
                                        <Text selectable>
                                          {value?.name || "No file selected"}
                                        </Text>
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
                                          {element.properties.leftLabel || ""}
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
                                          {element.properties.rightLabel || ""}
                                        </Text>
                                      </View>
                                    );
                                  case "checkbox":
                                    return (
                                      <View style={{ gap: 4 }}>
                                        {(Array.isArray(
                                          element.properties.options,
                                        ) &&
                                        element.properties.options.length > 0
                                          ? element.properties.options
                                          : [element.properties.label]
                                        ).map((option, index) => (
                                          <View
                                            key={index}
                                            style={styles.checkboxContainer}
                                          >
                                            <View style={styles.checkbox}>
                                              {(Array.isArray(value)
                                                ? value[index]
                                                : index === 0 && value) && (
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
                                            <Text style={{ fontSize: 12 }}>
                                              {getTextContent(option)}
                                            </Text>
                                          </View>
                                        ))}
                                      </View>
                                    );
                                  case "select":
                                    return (
                                      <View style={styles.select}>
                                        <Text selectable>{value || ""}</Text>
                                      </View>
                                    );
                                  case "radio":
                                    return (
                                      <View style={{ gap: 4 }}>
                                        {(Array.isArray(
                                          element.properties.options,
                                        ) &&
                                        element.properties.options.length > 0
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
                                              style={styles.checkboxContainer}
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
                                                      backgroundColor: "#000",
                                                    }}
                                                  />
                                                )}
                                              </View>
                                              <Text style={{ fontSize: 12 }}>
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
                                        <Text selectable>{value || ""}</Text>
                                      </View>
                                    );
                                }
                              })()}
                            </View>
                          ),
                        )}
                      </View>
                    ));
                })()}
              </Page>
            </Document>
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};
