import React from "react";
import { ImagePlus } from "lucide-react";
import { FormElementProps } from "../../types";

export const ImageUpload: React.FC<FormElementProps> = ({ element, value }) => {
  const { properties } = element;

  return (
    <div className="w-full min-h-[140px] flex items-center justify-center">
      {value?.url ? (
        <img
          src={value.url}
          alt="Uploaded preview"
          className="max-w-full max-h-[140px] w-auto h-auto rounded-lg object-contain"
        />
      ) : (
        <div className="w-full h-[140px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 text-gray-400">
          <ImagePlus className="w-12 h-12" />
          <div className="text-center">
            <p className="text-sm">No image uploaded</p>
          </div>
        </div>
      )}
    </div>
  );
};
