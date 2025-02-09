import React from "react";
import { Card } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Trash2, Move } from "lucide-react";

interface GridItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  content: string;
}

interface FormBuilderGridProps {
  items?: GridItem[];
  onItemsChange?: (items: GridItem[]) => void;
  onItemDelete?: (id: string) => void;
}

const defaultItems: GridItem[] = [
  {
    id: "1",
    x: 0,
    y: 0,
    w: 6,
    h: 2,
    type: "text",
    content: "Text Input Field",
  },
  {
    id: "2",
    x: 6,
    y: 0,
    w: 6,
    h: 2,
    type: "select",
    content: "Dropdown Field",
  },
  {
    id: "3",
    x: 0,
    y: 2,
    w: 12,
    h: 3,
    type: "textarea",
    content: "Text Area Field",
  },
];

const FormBuilderGrid: React.FC<FormBuilderGridProps> = ({
  items = defaultItems,
  onItemsChange = () => {},
  onItemDelete = () => {},
}) => {
  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-auto">
      <div className="grid grid-cols-12 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`col-span-${item.w} row-span-${item.h} p-4 relative group cursor-move`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Move className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Drag to move</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">{item.type}</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                      onClick={() => onItemDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete element</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="p-2 border border-dashed border-gray-300 rounded-md">
              {item.content}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormBuilderGrid;
