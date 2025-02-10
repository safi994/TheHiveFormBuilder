import React, { useState } from "react";
import { ElementType } from "../types";
import {
  Type,
  Hash,
  ListChecks,
  CheckSquare,
  CircleDot,
  GripHorizontal,
} from "lucide-react";

interface ElementPaletteProps {
  elementTypes: ElementType[];
  onDragStart: (e: React.DragEvent, typeId: string) => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case "text":
      return <Type className="w-4 h-4" />;
    case "number":
      return <Hash className="w-4 h-4" />;
    case "select":
      return <ListChecks className="w-4 h-4" />;
    case "checkbox":
      return <CheckSquare className="w-4 h-4" />;
    case "radio":
      return <CircleDot className="w-4 h-4" />;
    default:
      return <Type className="w-4 h-4" />;
  }
};

export const ElementPalette: React.FC<ElementPaletteProps> = ({
  elementTypes,
  onDragStart,
}) => {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-4">
      <h2 className="text-lg font-semibold mb-4">Elements</h2>
      <div className="flex bg-gray-100 p-1 rounded-md mb-4">
        {[
          { id: "basic", label: "Basic" },
          { id: "advanced", label: "Advanced" },
          { id: "complex", label: "Complex" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 px-3 py-1.5 text-sm rounded ${activeTab === id ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "basic" && (
        <div className="space-y-2">
          {elementTypes.map((type) => (
            <div
              key={type.id}
              draggable
              onDragStart={(e) => onDragStart(e, type.id)}
              className="group w-full flex items-center p-3 hover:bg-gray-50 border border-gray-200 rounded-md cursor-move transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md group-hover:bg-white group-hover:text-blue-500 transition-colors">
                  {getIconForType(type.id)}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{type.label}</span>
                  <span className="text-xs text-gray-500">Drag to add</span>
                </div>
              </div>
              <div className="flex items-center justify-center w-6 h-6 rounded group-hover:bg-gray-100 transition-colors">
                <GripHorizontal className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {(activeTab === "advanced" || activeTab === "complex") && (
        <div className="p-8 text-center text-sm text-gray-500 border-2 border-dashed rounded-md">
          Coming soon
        </div>
      )}
    </div>
  );
};
