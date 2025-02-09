import React from "react";
import { FormElement } from "../types";

interface CodeEditorProps {
  elements: FormElement[];
  codeValue: string;
  codeError: string;
  onCodeChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  elements,
  codeValue,
  codeError,
  onCodeChange,
}) => {
  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-[500px] p-4 font-mono text-sm bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={codeValue || JSON.stringify(elements, null, 2)}
        onChange={(e) => onCodeChange(e.target.value)}
        spellCheck="false"
      />
      {codeError && <div className="text-red-500 text-sm">{codeError}</div>}
    </div>
  );
};
