import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormBuilderHeaderProps {
  title?: string;
  items?: any[];
}

const FormBuilderHeader = ({
  title = "Untitled Form",
  items = [],
}: FormBuilderHeaderProps) => {
  return (
    <div className="w-full h-[60px] bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] w-[1200px]">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="grid grid-cols-12 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`col-span-${item.w} row-span-${item.h} p-4 bg-white rounded-lg border border-gray-200`}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {item.content}
                    </label>
                    {item.type === "text" && (
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        placeholder={item.content}
                      />
                    )}
                    {item.type === "textarea" && (
                      <textarea
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        placeholder={item.content}
                        rows={3}
                      />
                    )}
                    {item.type === "select" && (
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white">
                        <option value="">{item.content}</option>
                        <option value="1">Option 1</option>
                        <option value="2">Option 2</option>
                        <option value="3">Option 3</option>
                      </select>
                    )}
                    {item.type === "checkbox" && (
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{item.content}</span>
                      </label>
                    )}
                    {item.type === "radio" && (
                      <div className="space-y-2">
                        {["Option 1", "Option 2", "Option 3"].map(
                          (option, i) => (
                            <label
                              key={i}
                              className="flex items-center space-x-3"
                            >
                              <input
                                type="radio"
                                name={`radio-${item.id}`}
                                className="h-4 w-4 border-gray-300"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormBuilderHeader;
