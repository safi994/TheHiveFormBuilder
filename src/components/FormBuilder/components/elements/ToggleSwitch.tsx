import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormElementProps } from "../../types";

export const ToggleSwitch: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;
  const isChecked = value ?? properties.defaultChecked ?? false;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Label className="text-sm font-medium text-gray-900">
          {properties.leftLabel || ""}
        </Label>
        <div className="flex items-center space-x-2">
          {properties.showIndicators && (
            <span
              className={`px-2 py-1 text-xs font-medium border rounded-md transition-colors ${isChecked ? "border-gray-200 text-gray-500" : "border-red-200 text-red-600"}`}
            >
              OFF
            </span>
          )}
          <Switch
            id={element.i}
            checked={isChecked}
            onCheckedChange={!readOnly && onChange ? onChange : undefined}
            disabled={readOnly}
          />
          {properties.showIndicators && (
            <span
              className={`px-2 py-1 text-xs font-medium border rounded-md transition-colors ${isChecked ? "border-blue-200 text-blue-600" : "border-gray-200 text-gray-500"}`}
            >
              ON
            </span>
          )}
        </div>
        <Label className="text-sm font-medium text-gray-900">
          {properties.rightLabel || ""}
        </Label>
      </div>
    </div>
  );
};
