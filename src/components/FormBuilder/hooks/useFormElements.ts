import { useState } from "react";
import { FormElement } from "../types";
import constants from "../config/constants.json";

export const useFormElements = () => {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null,
  );
  const [draggedElement, setDraggedElement] =
    useState<Partial<FormElement> | null>(null);

  const addElement = (newElement: FormElement) => {
    setElements([...elements, newElement]);
  };

  const updateElement = (elementId: string, updates: Partial<FormElement>) => {
    const newElements = elements.map((el) =>
      el.i === elementId ? { ...el, ...updates } : el,
    );
    setElements(newElements);

    // Update selected element if it was modified
    if (selectedElement?.i === elementId) {
      const updatedElement = newElements.find((el) => el.i === elementId);
      setSelectedElement(updatedElement || null);
    }
  };

  const removeElement = (elementId: string) => {
    setElements(elements.filter((el) => el.i !== elementId));
    if (selectedElement?.i === elementId) {
      setSelectedElement(null);
    }
  };

  const updateElementProperty = (
    elementId: string,
    property: string,
    value: any,
  ) => {
    setElements((prevElements) => {
      const newElements = prevElements.map((el) => {
        if (el.i === elementId) {
          const updatedElement = {
            ...el,
            properties: {
              ...el.properties,
              [property]: value,
            },
          };
          // Update selected element if this is the one being modified
          if (selectedElement?.i === elementId) {
            setSelectedElement(updatedElement);
          }
          return updatedElement;
        }
        return el;
      });
      return newElements;
    });
  };

  return {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    draggedElement,
    setDraggedElement,
    addElement,
    updateElement,
    removeElement,
    updateElementProperty,
  };
};
