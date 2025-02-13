/**
 * FormBuilder Component
 *
 * A drag-and-drop form builder that allows users to create, customize, and export forms.
 * Features include:
 * - Drag & drop form elements
 * - Real-time preview
 * - JSON code editor
 * - PDF export
 * - Responsive grid layout
 */

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

// Components
import { ElementPalette } from "./components/ElementPalette";
import { PropertyPanel } from "./components/PropertyPanel";
import { PreviewElement } from "./components/PreviewElement";
import { FormPreview } from "./components/FormPreview";
import { CodeEditor } from "./components/CodeEditor";
import { PDFExport } from "./components/PDFExport";

// Hooks
import { useFormElements } from "./hooks/useFormElements";
import { useFormValues } from "./hooks/useFormValues";
import { useCodeEditor } from "./hooks/useCodeEditor";

// Utils & Constants
import { ELEMENT_TYPES } from "./constants";
import {
  calculateGridPosition,
  getElementClassNames,
  generateElementId,
} from "./utils/elementUtils";
import config from "./config";
import editorConfig from "./config/editor.json";
import constants from "./config/constants.json";

const ReactGridLayout = WidthProvider(RGL);

const FormBuilder: React.FC = () => {
  // Add event listener for middle click anywhere on the page
  React.useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        // Middle mouse button
        e.preventDefault();
        setSelectedElement(null);
      }
    };

    window.addEventListener("mousedown", handleGlobalMouseDown);
    return () => window.removeEventListener("mousedown", handleGlobalMouseDown);
  }, []);
  // State management using custom hooks
  const {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    draggedElement,
    setDraggedElement,
    addElement,
    removeElement,
    updateElementProperty,
  } = useFormElements();

  const { formValues, updateFormValue } = useFormValues();
  const { codeValue, codeError, handleCodeChange } = useCodeEditor(setElements);

  const [activeTab, setActiveTab] = useState("editor");
  const [showPDF, setShowPDF] = useState(false);

  // Event Handlers
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    const elementType = ELEMENT_TYPES.find((t) => t.id === type);
    if (!elementType) return;

    setDraggedElement({
      id: generateElementId(),
      type,
      properties: JSON.parse(JSON.stringify(elementType.properties)),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = calculateGridPosition(e, rect);

    const newElement = {
      ...draggedElement,
      i: draggedElement.id!,
      x,
      y,
      w: config.settings.defaultValues.elementWidth,
      h: config.settings.defaultValues.elementHeight,
      type: draggedElement.type!,
      properties: { ...draggedElement.properties! },
    };

    addElement(newElement);
    setDraggedElement(null);
  };

  // Render Helpers
  const renderTabButton = ({ id, icon, label }) => {
    const Icon = { Settings, Eye, Code }[icon];
    return (
      <button
        key={id}
        onClick={() => setActiveTab(id)}
        className={`flex items-center px-3 py-1.5 rounded ${activeTab === id ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
        title={editorConfig.tabs.find((tab) => tab.id === id)?.description}
      >
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </button>
    );
  };

  const renderElementLabel = (element) => {
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        style={{ maxWidth: editorConfig.layout.maxWidth }}
        className="p-4 mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Form Builder</h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-md">
              {editorConfig.tabs.map(renderTabButton)}
            </div>
            <button
              onClick={() => setShowPDF(true)}
              className={editorConfig.buttons.exportPDF.className}
            >
              <FileDown className="w-4 h-4 mr-2" />
              {editorConfig.buttons.exportPDF.label}
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: editorConfig.layout.gridTemplate }}
        >
          {/* Element Palette */}
          <div
            style={{
              gridColumn: `span ${editorConfig.layout.columnSizes.palette}`,
            }}
          >
            <ElementPalette
              elementTypes={ELEMENT_TYPES}
              onDragStart={handleDragStart}
            />
          </div>

          {/* Canvas */}
          <div
            style={{
              gridColumn: `span ${editorConfig.layout.columnSizes.canvas}`,
            }}
            className="bg-white rounded-lg border min-h-[calc(100vh-8rem)] w-full"
          >
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
                  cols={constants.gridLayout.defaultGridWidth}
                  rowHeight={constants.gridLayout.defaultRowHeight}
                  width={config.layout.grid.width}
                  onLayoutChange={(newLayout) => {
                    setElements(
                      elements.map((el, i) => ({ ...el, ...newLayout[i] })),
                    );
                  }}
                  isDraggable
                  isResizable
                  draggableHandle={`.${constants.classNames.dragHandle}`}
                >
                  {elements.map((element) => (
                    <div
                      key={element.i}
                      className={`${constants.classNames.base} ${selectedElement?.i === element.i ? "border-2 border-blue-500 ring-2 ring-blue-500/20" : "border border-gray-200 hover:border-blue-200"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement(element);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical
                          className={`w-4 h-4 text-gray-400 ${constants.classNames.dragHandle} cursor-move`}
                        />
                        {renderElementLabel(element)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeElement(element.i);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-auto"
                          title="Remove element"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <PreviewElement
                          element={element}
                          readOnly={true}
                          value={formValues[element.i]}
                          onChange={(value) =>
                            updateFormValue(element.i, value)
                          }
                          isPreview={true}
                        />
                      </div>
                    </div>
                  ))}
                </ReactGridLayout>
              )}

              {activeTab === "preview" && (
                <FormPreview
                  elements={elements}
                  onValueChange={updateFormValue}
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

              {elements.length === 0 && activeTab === "editor" && (
                <div className={editorConfig.emptyState.className}>
                  {editorConfig.emptyState.message}
                </div>
              )}
            </div>
          </div>

          {/* Property Panel */}
          <div
            style={{
              gridColumn: `span ${editorConfig.layout.columnSizes.properties}`,
            }}
          >
            {activeTab === "editor" &&
              (selectedElement ? (
                <PropertyPanel
                  element={selectedElement}
                  onUpdateProperty={updateElementProperty}
                />
              ) : (
                <div
                  className={editorConfig.propertyPanel.emptyState.className}
                >
                  <h3
                    className={
                      editorConfig.propertyPanel.emptyState.titleClassName
                    }
                  >
                    {config.settings.propertyPanel.title}
                  </h3>
                  <p
                    className={
                      editorConfig.propertyPanel.emptyState.messageClassName
                    }
                  >
                    {config.settings.propertyPanel.emptyStateMessage}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* PDF Export Modal */}
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
