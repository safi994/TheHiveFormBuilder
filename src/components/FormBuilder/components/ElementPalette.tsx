import React, { useState, memo } from "react";
import { ElementType } from "../types";
import config from "../config";
import {
  TextCursor,
  Hash,
  Minus,
  ListChecks,
  CheckSquare,
  CircleDot,
  GripHorizontal,
  LayoutGrid,
  Sparkles,
  Blocks,
  MessageSquare,
  Calendar,
  Clock,
  FileUp,
  ToggleLeft,
  Text,
  ImagePlus,
  SeparatorHorizontal,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ElementPaletteProps {
  elementTypes: ElementType[];
  onDragStart: (e: React.DragEvent, typeId: string) => void;
}

interface ElementCardProps {
  type: ElementType;
  onDragStart: (e: React.DragEvent, typeId: string) => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case "spacer":
      return <Minus className="w-4 h-4" />;
    case "text":
      return <TextCursor className="w-4 h-4" />;
    case "plainText":
      return <Text className="w-4 h-4" />;
    case "textarea":
      return <MessageSquare className="w-4 h-4" />;
    case "number":
      return <Hash className="w-4 h-4" />;
    case "select":
      return <ListChecks className="w-4 h-4" />;
    case "checkbox":
      return <CheckSquare className="w-4 h-4" />;
    case "radio":
      return <CircleDot className="w-4 h-4" />;
    case "date":
      return <Calendar className="w-4 h-4" />;
    case "time":
      return <Clock className="w-4 h-4" />;
    case "file":
      return <FileUp className="w-4 h-4" />;
    case "toggle":
      return <ToggleLeft className="w-4 h-4" />;
    case "image":
      return <ImagePlus className="w-4 h-4" />;
    case "pageBreak":
      return <SeparatorHorizontal className="w-4 h-4" />;
    default:
      return <TextCursor className="w-4 h-4" />;
  }
};

const ElementCard = memo(({ type, onDragStart }: ElementCardProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          draggable
          onDragStart={(e) => onDragStart(e, type.id)}
          className="group w-full flex items-center p-3 hover:bg-gray-50 border border-gray-200 rounded-md cursor-move transition-all hover:shadow-sm active:scale-[0.98]"
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
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Drag to add {type.label.toLowerCase()} to your form</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

ElementCard.displayName = "ElementCard";

const ElementPalette = memo(
  ({ elementTypes, onDragStart }: ElementPaletteProps) => {
    const [activeTab, setActiveTab] = useState("basic");

    const filteredElements = elementTypes.filter((type) => {
      if (activeTab === "basic") return !type.advanced;
      if (activeTab === "advanced") return type.advanced;
      return false;
    });

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-4">
        <h2 className="text-lg font-semibold mb-4">
          {config.settings.dragAndDrop.elementPaletteTitle}
        </h2>
        <div className="flex bg-gray-100 p-1 rounded-md mb-4">
          {[
            { id: "basic", label: "Basic", icon: LayoutGrid },
            { id: "advanced", label: "Advanced", icon: Sparkles },
            { id: "complex", label: "Complex", icon: Blocks },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 px-3 py-1.5 text-sm rounded flex items-center justify-center gap-2 transition-all ${activeTab === id ? "bg-white shadow-sm text-blue-600" : "hover:bg-white/50 text-gray-600 hover:text-gray-900"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredElements.map((type) => (
            <ElementCard key={type.id} type={type} onDragStart={onDragStart} />
          ))}
        </div>

        {activeTab === "complex" && (
          <div className="p-8 text-center text-sm text-gray-500 border-2 border-dashed rounded-md">
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-gray-400" />
              <p>Coming soon</p>
              <p className="text-xs text-gray-400">
                More powerful form elements are on the way!
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ElementPalette.displayName = "ElementPalette";

export { ElementPalette };
