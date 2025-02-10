import React from "react";
import { ElementType } from "../types";

interface ElementPaletteProps {
  elementTypes: ElementType[];
  onDragStart: (e: React.DragEvent, typeId: string) => void;
}

export const ElementPalette: React.FC<ElementPaletteProps> = ({
  elementTypes,
  onDragStart,
}) => {
  return (
    <div className="col-span-3 bg-white p-4 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Elements</h2>
      <div className="space-y-2">
        {elementTypes.map((type) => (
          <div
            key={type.id}
            draggable
            onDragStart={(e) => onDragStart(e, type.id)}
            className="w-full flex items-center p-2 hover:bg-gray-100 rounded cursor-move"
          >
            <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded mr-2">
              {type.icon}
            </span>
            {type.label}
          </div>
        ))}
      </div>
    </div>
  );
};
