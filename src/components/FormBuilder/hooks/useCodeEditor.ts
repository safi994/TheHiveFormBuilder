import { useState } from "react";
import { FormElement } from "../types";

export const useCodeEditor = (
  onUpdateElements: (elements: FormElement[]) => void,
) => {
  const [codeValue, setCodeValue] = useState("");
  const [codeError, setCodeError] = useState("");

  const handleCodeChange = (value: string) => {
    setCodeValue(value);
    if (!value.trim()) {
      setCodeError("");
      return;
    }

    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setCodeError("Invalid format: Must be an array of form elements");
        return;
      }
      onUpdateElements(parsed);
      setCodeError("");
    } catch (err) {
      setCodeError("Invalid JSON format");
    }
  };

  return {
    codeValue,
    setCodeValue,
    codeError,
    setCodeError,
    handleCodeChange,
  };
};
