import React, { useState } from "react";
import { FormElement } from "../types";
import { RegularPropertyPanel } from "./RegularPropertyPanel";
import { TablePropertyPanel } from "./table/TablePropertyPanel";

interface PropertyPanelProps {
  element: FormElement;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
  onFormValueChange?: (elementId: string, value: any) => void;
}

/**
 * PropertyPanel
 * -------------
 * - Displays top-level tabs for an element's properties
 * - If it's a table, delegates to TablePropertyPanel.
 * - Otherwise, uses RegularPropertyPanel.
 */
export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  element,
  onUpdateProperty,
  onFormValueChange,
}) => {
  const [activeTab, setActiveTab] = useState("basic");

  // Different tab sets for tables vs other elements
  const tabsForTable = ["basic", "logic"];
  const tabsForOthers = ["basic", "logic", "config", "validation"];
  const tabs = element.type === "table" ? tabsForTable : tabsForOthers;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Properties</h3>

      {/* Top-level Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-md mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            {element.type === "table" && tab === "logic"
              ? "Table Style"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Render the appropriate panel based on element type */}
      {element.type === "table" ? (
        <TablePropertyPanel
          element={element}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onUpdateProperty={onUpdateProperty}
          onFormValueChange={onFormValueChange}
        />
      ) : (
        <RegularPropertyPanel
          element={element}
          onUpdateProperty={onUpdateProperty}
          onFormValueChange={onFormValueChange}
          activeTab={activeTab}
        />
      )}
    </div>
  );
};
