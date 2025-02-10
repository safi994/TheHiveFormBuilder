import { ElementType } from "./types";

export const ELEMENT_TYPES: ElementType[] = [
  {
    id: "text",
    label: "Text Input",
    icon: "Aa",
    properties: {
      label: "Text Field",
      placeholder: "",
      required: false,
      minLength: 0,
      maxLength: 100,
      defaultValue: "",
      pattern: "",
    },
  },
  {
    id: "number",
    label: "Number Input",
    icon: "123",
    properties: {
      label: "Number Field",
      placeholder: "",
      required: false,
      min: "",
      max: "",
      step: 1,
      defaultValue: "",
    },
  },
  {
    id: "select",
    label: "Dropdown",
    icon: "▼",
    properties: {
      label: "Select Field",
      required: false,
      options: [],
      defaultValue: "",
      multiple: false,
    },
  },
  {
    id: "checkbox",
    label: "Checkbox",
    icon: "☑",
    properties: {
      label: "Checkbox Field",
      required: false,
      defaultChecked: false,
      options: [],
    },
  },
  {
    id: "radio",
    label: "Radio Group",
    icon: "◉",
    properties: {
      label: "Radio Field",
      required: false,
      options: [],
      defaultValue: "",
    },
  },
];
