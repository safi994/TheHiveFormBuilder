import React from "react";
import { FormElement } from "../types";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface TableLogicPanelProps {
  element: FormElement;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
}

/**
 * TableLogicPanel
 * ---------------
 * Displays the “logic” tab with table border style and visibility.
 */
export const TableLogicPanel: React.FC<TableLogicPanelProps> = ({
  element,
  onUpdateProperty,
}) => {
  const { properties, i } = element;

  return (
    <div className="space-y-6">
      {/* Border Styles */}
      <div className="space-y-4">
        <h4 className="font-medium">Table Border Style</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Border Width */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Border Width
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={[properties.borderWidth || 1]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([val]) =>
                    onUpdateProperty(i, "borderWidth", val)
                  }
                />
              </div>
              <div className="w-20 relative">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={properties.borderWidth || 1}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "borderWidth",
                      Math.max(1, Number(e.target.value))
                    )
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  px
                </span>
              </div>
            </div>
          </div>

          {/* Border Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Border Color
            </label>
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 overflow-hidden rounded-full">
                <input
                  type="color"
                  value={properties.borderColor || "#6b7280"}
                  onChange={(e) => onUpdateProperty(i, "borderColor", e.target.value)}
                  className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={properties.borderColor || "#6b7280"}
                onChange={(e) =>
                  onUpdateProperty(i, "borderColor", e.target.value)
                }
                className="flex-1 font-mono uppercase"
              />
            </div>
          </div>

          {/* Border Style */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Border Style
            </label>
            <select
              value={properties.borderStyle || "solid"}
              onChange={(e) =>
                onUpdateProperty(i, "borderStyle", e.target.value)
              }
              className="w-full p-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Border Radius
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={[properties.borderRadius || 0]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={([val]) =>
                    onUpdateProperty(i, "borderRadius", val)
                  }
                />
              </div>
              <div className="w-20 relative">
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={properties.borderRadius || 0}
                  onChange={(e) =>
                    onUpdateProperty(i, "borderRadius", Number(e.target.value))
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  px
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Visibility */}
      <div className="space-y-4 mt-6 border-t pt-6">
        <h4 className="font-medium">Table Visibility</h4>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Switch
              checked={properties.showInPreview ?? true}
              onCheckedChange={(checked) =>
                onUpdateProperty(i, "showInPreview", checked)
              }
            />
            <label className="text-sm font-medium text-gray-700">
              Show in Preview
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={properties.showInPDF ?? true}
              onCheckedChange={(checked) =>
                onUpdateProperty(i, "showInPDF", checked)
              }
            />
            <label className="text-sm font-medium text-gray-700">
              Show in PDF
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
