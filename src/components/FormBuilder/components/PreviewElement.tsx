import React from "react";
import { FormElement } from "../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface PreviewElementProps {
  element: FormElement;
  value?: any;
  onChange?: (value: any) => void;
  isPreview?: boolean;
  readOnly?: boolean;
}

export const PreviewElement: React.FC<PreviewElementProps> = ({
  element,
  value,
  onChange,
  isPreview = false,
  readOnly = false,
}) => {
  const { properties } = element;

  if (element.type === "spacer") {
    if (isPreview && !properties.showInPreview) return null;
    return (
      <div
        className={`w-full ${!isPreview ? "border border-dashed border-gray-200/50 rounded-md" : ""}`}
        style={{ height: `${properties.rows * 50}px` }}
      />
    );
  }

  const commonProps = readOnly
    ? {
        value: value ?? properties.defaultValue ?? "",
        disabled: true,
      }
    : {
        defaultValue: properties.defaultValue ?? "",
        onChange: onChange
          ? (e: React.ChangeEvent<any>) => onChange(e.target.value)
          : undefined,
      };

  switch (element.type) {
    case "textarea":
      return (
        <Textarea
          {...commonProps}
          placeholder={properties.placeholder}
          required={properties.required}
          minLength={properties.minLength}
          maxLength={properties.maxLength}
          rows={properties.rows}
        />
      );
    case "date":
      return (
        <Input
          type="date"
          {...commonProps}
          required={properties.required}
          min={properties.min}
          max={properties.max}
        />
      );
    case "time":
      return (
        <Input
          type="time"
          {...commonProps}
          required={properties.required}
          min={properties.min}
          max={properties.max}
        />
      );
    case "file":
      if (readOnly) {
        return (
          <div className="w-full p-2 border rounded-md bg-muted">
            {value?.name || "No file selected"}
          </div>
        );
      }
      return (
        <Input
          type="file"
          onChange={onChange ? (e) => onChange(e.target.files?.[0]) : undefined}
          required={properties.required}
          accept={properties.accept}
          multiple={properties.multiple}
        />
      );
    case "text":
      return (
        <Input
          type="text"
          {...commonProps}
          placeholder={properties.placeholder}
          required={properties.required}
          minLength={properties.minLength}
          maxLength={properties.maxLength}
          pattern={properties.pattern}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          {...commonProps}
          placeholder={properties.placeholder}
          required={properties.required}
          min={properties.min}
          max={properties.max}
          step={properties.step}
        />
      );
    case "select":
      return (
        <Select
          value={value ?? properties.defaultValue ?? ""}
          onValueChange={!readOnly && onChange ? onChange : undefined}
          disabled={readOnly}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(properties.options) &&
              properties.options.map((option: string, i: number) => (
                <SelectItem key={i} value={option}>
                  {option}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      );
    case "checkbox":
      return (
        <div className="space-y-2">
          {(Array.isArray(properties.options) && properties.options.length > 0
            ? properties.options
            : [properties.label]
          ).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`${element.i}-${index}`}
                checked={
                  Array.isArray(value)
                    ? value[index]
                    : index === 0
                      ? value
                      : false
                }
                onCheckedChange={
                  !readOnly && onChange
                    ? (checked) => {
                        const newValues = Array.isArray(value)
                          ? [...(value || [])]
                          : [];
                        newValues[index] = checked;
                        onChange(newValues);
                      }
                    : undefined
                }
                disabled={readOnly}
              />
              <label
                htmlFor={`${element.i}-${index}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );
    case "radio":
      return (
        <RadioGroup
          value={value}
          onValueChange={!readOnly && onChange ? onChange : undefined}
          disabled={readOnly}
        >
          {(Array.isArray(properties.options) && properties.options.length > 0
            ? properties.options
            : [properties.label]
          ).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${element.i}-${index}`} />
              <label
                htmlFor={`${element.i}-${index}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option}
              </label>
            </div>
          ))}
        </RadioGroup>
      );
    default:
      return <div>Unsupported element type</div>;
  }
};
