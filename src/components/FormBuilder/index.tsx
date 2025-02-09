import React, { useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import { Settings, Eye, Code, Trash2, GripVertical } from "lucide-react";
import { ElementPalette } from "./components/ElementPalette";
import { PropertyPanel } from "./components/PropertyPanel";
import { PreviewElement } from "./components/PreviewElement";
import { FormPreview } from "./components/FormPreview";
import { CodeEditor } from "./components/CodeEditor";
import { ELEMENT_TYPES } from "./constants";
import { FormElement } from "./types";

const ReactGridLayout = WidthProvider(RGL);

const FormBuilder = () => {
  const [elements, setElements] = useState<FormElement[]>([]);
  // Handle clicking outside elements to deselect
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const [activeTab, setActiveTab] = useState("editor");
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null,
  );
  const [draggedElement, setDraggedElement] =
    useState<Partial<FormElement> | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [codeError, setCodeError] = useState("");

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
    <div
      className="min-h-screen bg-gray-100"
      onAuxClick={(e) => {
        if (e.button === 1) {
          // Middle mouse button
          e.preventDefault();
          setSelectedElement(null);
        }
      }}
    >
      <div className="container mx-auto p-4">
        <header className="bg-white p-4 rounded-lg shadow mb-4">
          <h1 className="text-2xl font-bold">Form Builder</h1>
          <div className="flex space-x-4 mt-4">
            {[
              { id: "editor", icon: Settings, label: "Editor" },
              { id: "preview", icon: Eye, label: "Preview" },
              { id: "code", icon: Code, label: "Code" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-4 py-2 rounded ${activeTab === id ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4">
          <ElementPalette
            elementTypes={ELEMENT_TYPES}
            onDragStart={handleDragStart}
          />

          <div
            className="col-span-7 bg-white p-4 rounded-lg shadow"
            onClick={handleBackgroundClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {activeTab === "editor" && (
              <ReactGridLayout
                className="layout"
                layout={elements}
                cols={12}
                rowHeight={50}
                width={1200}
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
                    className={`border p-4 rounded relative cursor-pointer ${selectedElement?.i === element.i ? "border-blue-500 ring-2 ring-blue-500 z-20" : "border-gray-200"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(element);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onAuxClick={(e) => {
                      if (e.button === 1) {
                        // Middle mouse button
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedElement(null);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <GripVertical className="w-4 h-4 mr-2 text-gray-400 drag-handle cursor-move" />
                      <span className="flex-grow">
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
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <PreviewElement element={element} />
                  </div>
                ))}
              </ReactGridLayout>
            )}

            {activeTab === "preview" && <FormPreview elements={elements} />}

            {activeTab === "code" && (
              <CodeEditor
                elements={elements}
                codeValue={codeValue}
                codeError={codeError}
                onCodeChange={handleCodeChange}
              />
            )}
          </div>

          <div className="col-span-3">
            {activeTab === "editor" && selectedElement && (
              <PropertyPanel
                element={selectedElement}
                onUpdateProperty={updateElementProperty}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
