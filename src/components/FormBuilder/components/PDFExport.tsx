import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { FormElement } from "../types";

const styles = StyleSheet.create({
  checkbox: {
    width: 12,
    height: 12,
    border: "1px solid #000",
    marginRight: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  select: {
    padding: 4,
    marginTop: 2,
    minHeight: 14,
    border: "1px solid #000",
    fontSize: 12,
  },
  input: {
    padding: 4,
    marginTop: 2,
    minHeight: 14,
    border: "1px solid #000",
    fontSize: 12,
  },
  page: {
    backgroundColor: "#ffffff",
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 15,
    flexWrap: "wrap",
  },
  section: {
    padding: 10,
    marginRight: 10,
    flex: 1,
    minWidth: 200,
  },
  label: {
    fontSize: 10,
    marginBottom: 5,
    color: "#374151",
  },
  value: {
    fontSize: 12,
    color: "#111827",
  },
  required: {
    color: "#EF4444",
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-[800px] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Form PDF Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        <div className="flex-1">
          <PDFViewer width="100%" height="100%" className="rounded">
            <Document>
              <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Form Details</Text>
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
                        {rowElements.map((element) => (
                          <View
                            key={element.i}
                            style={[styles.section, { flex: element.w / 12 }]}
                          >
                            <Text style={styles.label}>
                              {element.properties.label}
                              {element.properties.required && (
                                <Text style={styles.required}> *</Text>
                              )}
                            </Text>
                            {(() => {
                              const value = formValues[element.i];
                              switch (element.type) {
                                case "checkbox":
                                  return (
                                    <View style={styles.checkboxContainer}>
                                      <View style={styles.checkbox}>
                                        {value && (
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
                                        {element.properties.label}
                                      </Text>
                                    </View>
                                  );
                                case "select":
                                  return (
                                    <View style={styles.select}>
                                      <Text selectable>{value || ""}</Text>
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
                        ))}
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
