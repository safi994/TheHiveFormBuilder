import React from "react";
import { FormElement } from "../types";
import { TableLogicPanel } from "./TableLogicPanel";
import { TableBasicPanel } from "./TableBasicPanel";

interface TablePropertyPanelProps {
  element: FormElement;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
  onFormValueChange?: (elementId: string, value: any) => void;
}

/**
 * TablePropertyPanel
 * ------------------
 * A simple wrapper that decides whether to show the Logic tab
 * or the Basic tab of the table.
 */
export const TablePropertyPanel: React.FC<TablePropertyPanelProps> = ({
  element,
  activeTab,
  setActiveTab,
  onUpdateProperty,
  onFormValueChange,
}) => {
  if (activeTab === "logic") {
    // Render table styles, border config, etc.
    return (
      <TableLogicPanel
        element={element}
        onUpdateProperty={onUpdateProperty}
      />
    );
  }

  // Otherwise, render the “basic” tab with rows, columns, cell selection
  return (
    <TableBasicPanel
      element={element}
      onUpdateProperty={onUpdateProperty}
      onFormValueChange={onFormValueChange}
    />
  );
};
