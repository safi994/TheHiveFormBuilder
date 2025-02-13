import React, { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TextEditorProps {
  value: string;
  properties: {
    preview?: {
      fontSize: string;
      textColor: string;
      backgroundColor: string;
      fontWeight: string;
      fontStyle: string;
      textAlign: string;
      textDecoration: string;
      lineHeight: string;
      letterSpacing: string;
      padding: string;
    };
    print?: {
      fontSize: string;
      textColor: string;
      backgroundColor: string;
      fontWeight: string;
      fontStyle: string;
      textAlign: string;
      textDecoration: string;
      lineHeight: string;
      letterSpacing: string;
      padding: string;
    };
    fontSize?: string;
    textColor?: string;
    backgroundColor?: string;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: string;
    textDecoration?: string;
    lineHeight?: string;
    letterSpacing?: string;
    padding?: string;
  };
  onChange: (value: string, properties: any) => void;
}

const defaultStyles = {
  fontSize: "16px",
  textColor: "#000000",
  backgroundColor: "transparent",
  fontWeight: "normal",
  fontStyle: "normal",
  textAlign: "left",
  textDecoration: "none",
  lineHeight: "1.5",
  letterSpacing: "normal",
  padding: "0px",
};

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  properties,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  const [mode, setMode] = useState<"preview" | "print">("preview");
  const [currentProperties, setCurrentProperties] = useState({
    preview: {
      ...defaultStyles,
      ...properties,
      ...properties.preview,
    },
    print: {
      ...defaultStyles,
      ...properties,
      ...properties.print,
    },
  });

  // Update local state when props change
  React.useEffect(() => {
    setText(value);
    setCurrentProperties({
      preview: {
        ...defaultStyles,
        ...properties,
        ...properties.preview,
      },
      print: {
        ...defaultStyles,
        ...properties,
        ...properties.print,
      },
    });
  }, [value, properties]);

  const handleConfirm = () => {
    onChange(text, currentProperties);
    setOpen(false);
  };

  const updateProperty = (key: string, value: string) => {
    setCurrentProperties((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: value,
      },
    }));
  };

  // Style object for the textarea preview
  const textareaStyle = {
    fontSize: currentProperties[mode].fontSize,
    color: currentProperties[mode].textColor,
    backgroundColor: currentProperties[mode].backgroundColor,
    fontWeight: currentProperties[mode].fontWeight,
    fontStyle: currentProperties[mode].fontStyle,
    textAlign: currentProperties[mode].textAlign as any,
    textDecoration: currentProperties[mode].textDecoration,
    lineHeight: currentProperties[mode].lineHeight,
    letterSpacing: currentProperties[mode].letterSpacing,
    padding: currentProperties[mode].padding,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Pencil className="w-4 h-4 text-gray-500" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-2xl">Text Editor</DialogTitle>
            <DialogDescription>
              Edit text content and styling properties
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-gray-100 p-1.5 rounded-lg shadow-sm">
              <button
                onClick={() => setMode("preview")}
                className={`px-8 py-2.5 rounded-md text-sm font-medium transition-all ${mode === "preview" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
              >
                Preview
              </button>
              <button
                onClick={() => setMode("print")}
                className={`px-8 py-2.5 rounded-md text-sm font-medium transition-all ${mode === "print" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
              >
                Print
              </button>
            </div>
          </div>

          <Tabs defaultValue="style" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Size</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="8"
                      max="72"
                      value={parseInt(currentProperties[mode].fontSize) || ""}
                      onChange={(e) =>
                        updateProperty("fontSize", `${e.target.value}px`)
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      px
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Weight</label>
                  <Select
                    value={currentProperties[mode].fontWeight}
                    onValueChange={(value) =>
                      updateProperty("fontWeight", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Style</label>
                  <Select
                    value={currentProperties[mode].fontStyle}
                    onValueChange={(value) =>
                      updateProperty("fontStyle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="italic">Italic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Decoration</label>
                  <Select
                    value={currentProperties[mode].textDecoration}
                    onValueChange={(value) =>
                      updateProperty("textDecoration", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select decoration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="underline">Underline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Align</label>
                  <Select
                    value={currentProperties[mode].textAlign}
                    onValueChange={(value) =>
                      updateProperty("textAlign", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Line Height</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={
                        parseFloat(currentProperties[mode].lineHeight) || ""
                      }
                      onChange={(e) =>
                        updateProperty("lineHeight", e.target.value)
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ×
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Letter Spacing</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="-2"
                      max="10"
                      step="0.5"
                      value={
                        parseFloat(currentProperties[mode].letterSpacing) || ""
                      }
                      onChange={(e) =>
                        updateProperty("letterSpacing", `${e.target.value}px`)
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      px
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Padding</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="32"
                      value={parseInt(currentProperties[mode].padding) || ""}
                      onChange={(e) =>
                        updateProperty("padding", `${e.target.value}px`)
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      px
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="color" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Color</label>
                  <Input
                    type="color"
                    value={currentProperties[mode].textColor}
                    onChange={(e) =>
                      updateProperty("textColor", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Background Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={
                        currentProperties[mode].backgroundColor ===
                        "transparent"
                          ? "#ffffff"
                          : currentProperties[mode].backgroundColor
                      }
                      onChange={(e) =>
                        updateProperty("backgroundColor", e.target.value)
                      }
                      className="w-[150px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateProperty("backgroundColor", "transparent")
                      }
                    >
                      Transparent
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <label className="text-sm font-medium">Content</label>
            <div
              className="mt-2 border rounded-md"
              style={{ height: "200px", overflow: "auto" }}
            >
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-full resize-none border-0 focus-visible:ring-0 rounded-none"
                style={textareaStyle}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
