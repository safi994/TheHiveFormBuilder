import React, { useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import {
  Settings,
  Eye,
  Code,
  Trash2,
  GripVertical,
  FileDown,
} from "lucide-react";
import { ElementPalette } from "./components/ElementPalette";
import { PropertyPanel } from "./components/PropertyPanel";
import { PreviewElement } from "./components/PreviewElement";
import { FormPreview } from "./components/FormPreview";
import { CodeEditor } from "./components/CodeEditor";
import { PDFExport } from "./components/PDFExport";
import { ELEMENT_TYPES } from "./constants";
import { FormElement } from "./types";
import config from "./config";

const ReactGridLayout = WidthProvider(RGL);

const FormBuilder = () => {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null,
  );
  const [draggedElement, setDraggedElement] =
    useState<Partial<FormElement> | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [codeError, setCodeError] = useState("");
  const [showPDF, setShowPDF] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    const elementType = ELEMENT_TYPES.find((t) => t.id === type);
    if (!elementType) return;

    const id = `element-${Date.now()}`;
    setDraggedElement({
      id,
      i: id,
      type,
      properties: JSON.parse(JSON.stringify(elementType.properties)),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / (rect.width / 12));
      const y = Math.floor((e.clientY - rect.top) / 50);

      const newElement = {
        ...draggedElement,
        i: draggedElement.id!,
        x: Math.min(x, 6),
        y,
        w: 6,
        h: 2,
        type: draggedElement.type!,
        properties: { ...draggedElement.properties! },
      } as FormElement;

      setElements([...elements, newElement]);
      setDraggedElement(null);
    }
  };

  const updateElementProperty = (
    elementId: string,
    property: string,
    value: any,
  ) => {
    const newElements = elements.map((el) => {
      if (el.i === elementId) {
        return {
          ...el,
          properties: {
            ...el.properties,
            [property]: value,
          },
        };
      }
      return el;
    });
    setElements(newElements);
    if (selectedElement?.i === elementId) {
      const updatedElement = newElements.find((el) => el.i === elementId);
      setSelectedElement(updatedElement || null);
    }
  };

  const handleCodeChange = (value: string) => {
    setCodeValue(value);
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setCodeError("Invalid format: Must be an array of form elements");
        return;
      }
      setElements(parsed);
      setCodeError("");
    } catch (err) {
      if (value.trim()) {
        setCodeError("Invalid JSON format");
      } else {
        setCodeError("");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ maxWidth: "2500px" }} className="p-4 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Form Builder</h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-md">
              {[
                { id: "editor", icon: Settings, label: "Editor" },
                { id: "preview", icon: Eye, label: "Preview" },
                { id: "code", icon: Code, label: "Code" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-3 py-1.5 rounded ${activeTab === id ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPDF(true)}
              className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <ElementPalette
              elementTypes={ELEMENT_TYPES}
              onDragStart={handleDragStart}
            />
          </div>

          <div className="col-span-6 bg-white rounded-lg border min-h-[calc(100vh-8rem)] w-full">
            <div
              className="p-4 h-full"
              onClick={handleBackgroundClick}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {activeTab === "editor" && (
                <ReactGridLayout
                  className="layout"
                  layout={elements}
                  cols={config.layout.grid.cols}
                  rowHeight={config.layout.grid.rowHeight}
                  width={config.layout.grid.width}
                  onLayoutChange={(newLayout) => {
                    setElements(
                      elements.map((el, i) => ({
                        ...el,
                        ...newLayout[i],
                      })),
                    );
                  }}
                  isDraggable
                  isResizable
                  draggableHandle=".drag-handle"
                >
                  {elements.map((element) => (
                    <div
                      key={element.i}
                      className={`border p-3 rounded-md relative cursor-pointer hover:border-blue-200 transition-colors ${selectedElement?.i === element.i ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement(element);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400 drag-handle cursor-move" />
                        <span className="flex-grow text-sm">
                          {element.properties.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setElements(
                              elements.filter((el) => el.i !== element.i),
                            );
                            if (selectedElement?.i === element.i) {
                              setSelectedElement(null);
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <PreviewElement element={element} />
                      </div>
                    </div>
                  ))}
                </ReactGridLayout>
              )}

              {activeTab === "preview" && (
                <FormPreview
                  elements={elements}
                  onValueChange={(id, value) => {
                    setFormValues((prev) => ({ ...prev, [id]: value }));
                  }}
                  values={formValues}
                />
              )}

              {activeTab === "code" && (
                <CodeEditor
                  elements={elements}
                  codeValue={codeValue}
                  codeError={codeError}
                  onCodeChange={handleCodeChange}
                />
              )}
            </div>
          </div>

          <div className="col-span-3">
            {activeTab === "editor" &&
              (selectedElement ? (
                <PropertyPanel
                  element={selectedElement}
                  onUpdateProperty={updateElementProperty}
                />
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-4">
                  <h3 className="text-lg font-semibold mb-4">Properties</h3>
                  <p className="text-gray-500 text-sm">
                    Select an element to view and edit its properties
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
      {showPDF && (
        <PDFExport
          elements={elements}
          formValues={formValues}
          onClose={() => setShowPDF(false)}
        />
      )}
    </div>
  );
};

export default FormBuilder;
