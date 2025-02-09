import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup } from "../ui/radio-group";
import { Switch } from "../ui/switch";
import {
  Type,
  AlignLeft,
  CheckSquare,
  ToggleLeft,
  RadioTower,
  ListChecks,
  FileInput,
} from "lucide-react";

interface FormElement {
  id: string;
  type: string;
  icon: React.ReactNode;
  label: string;
}

interface FormBuilderToolbarProps {
  onDragStart?: (event: React.DragEvent, element: FormElement) => void;
  elements?: FormElement[];
}

const defaultElements: FormElement[] = [
  { id: "text", type: "text", icon: <Type size={20} />, label: "Text Input" },
  {
    id: "textarea",
    type: "textarea",
    icon: <AlignLeft size={20} />,
    label: "Text Area",
  },
  {
    id: "checkbox",
    type: "checkbox",
    icon: <CheckSquare size={20} />,
    label: "Checkbox",
  },
  {
    id: "switch",
    type: "switch",
    icon: <ToggleLeft size={20} />,
    label: "Switch",
  },
  {
    id: "radio",
    type: "radio",
    icon: <RadioTower size={20} />,
    label: "Radio Group",
  },
  {
    id: "select",
    type: "select",
    icon: <ListChecks size={20} />,
    label: "Select",
  },
  {
    id: "file",
    type: "file",
    icon: <FileInput size={20} />,
    label: "File Upload",
  },
];

const FormBuilderToolbar = ({
  onDragStart = () => {},
  elements = defaultElements,
}: FormBuilderToolbarProps) => {
  return (
    <Card className="w-[280px] h-full bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Form Elements</h2>
        <p className="text-sm text-muted-foreground">
          Drag and drop elements to build your form
        </p>
      </div>
      <ScrollArea className="h-[calc(100vh-100px)] p-4">
        <div className="space-y-4">
          {elements.map((element) => (
            <div
              key={element.id}
              draggable
              onDragStart={(e) => onDragStart(e, element)}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-accent transition-colors"
            >
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                {element.icon}
              </div>
              <span className="font-medium">{element.label}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default FormBuilderToolbar;
