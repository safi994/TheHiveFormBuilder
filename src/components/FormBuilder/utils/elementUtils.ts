import { FormElement } from "../types";
import constants from "../config/constants.json";
import config from "../config";

export const generateElementId = () =>
  `${constants.elementIds.prefix}${Date.now()}`;

export const calculateGridPosition = (
  event: React.DragEvent,
  containerRect: DOMRect,
) => {
  const x = Math.floor(
    (event.clientX - containerRect.left) /
      (containerRect.width / constants.gridLayout.defaultGridWidth),
  );
  const y = Math.floor(
    (event.clientY - containerRect.top) / constants.gridLayout.defaultRowHeight,
  );

  return {
    x: Math.min(x, config.settings.defaultValues.elementWidth),
    y,
  };
};

export const getElementClassNames = (
  element: FormElement,
  selectedElementId: string | null,
) => {
  const selectedClass =
    selectedElementId === element.i
      ? constants.classNames.selectedElement
      : constants.classNames.unselectedElement;
  const hoverClass =
    selectedElementId !== element.i ? constants.classNames.elementHover : "";

  return `${constants.classNames.base} ${selectedClass} ${hoverClass}`;
};
