export interface FormElement {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  properties: Record<string, any>;
}

export interface ElementType {
  id: string;
  label: string;
  icon: string;
  properties: Record<string, any>;
}

export interface PropertyPanelProps {
  element: FormElement;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
}

/**
 * Common props interface for all form elements
 */
export interface FormElementProps {
  element: FormElement;
  value?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  isPreview?: boolean;
}

export interface PreviewElementProps extends FormElementProps {}
