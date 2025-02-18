import React, { useState } from "react";
import {
  Pencil,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
const lucideIcons = { AlignLeft, AlignCenter, AlignRight, AlignJustify };
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
import { Slider } from "@/components/ui/slider";
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

            <TabsContent value="style" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center justify-between">
                    Font Size
                    <span className="text-xs text-muted-foreground">
                      {parseInt(currentProperties[mode].fontSize)}px
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[
                          parseInt(currentProperties[mode].fontSize) || 16,
                        ]}
                        min={8}
                        max={72}
                        step={1}
                        onValueChange={([value]) =>
                          updateProperty("fontSize", `${value}px`)
                        }
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                      />
                    </div>
                    <div className="w-20">
                      <div className="relative">
                        <Input
                          type="number"
                          min={8}
                          max={72}
                          value={
                            parseInt(currentProperties[mode].fontSize) || 16
                          }
                          onChange={(e) => {
                            const value = Math.max(
                              8,
                              Math.min(72, Number(e.target.value)),
                            );
                            updateProperty("fontSize", `${value}px`);
                          }}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Font Weight</label>
                  <Select
                    value={currentProperties[mode].fontWeight}
                    onValueChange={(value) =>
                      updateProperty("fontWeight", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="semibold">Semibold</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Font Style</label>
                  <Select
                    value={currentProperties[mode].fontStyle}
                    onValueChange={(value) =>
                      updateProperty("fontStyle", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="italic">Italic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Text Decoration</label>
                  <Select
                    value={currentProperties[mode].textDecoration}
                    onValueChange={(value) =>
                      updateProperty("textDecoration", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select decoration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="underline">Underline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Text Align</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { value: "left", icon: "AlignLeft" },
                      { value: "center", icon: "AlignCenter" },
                      { value: "right", icon: "AlignRight" },
                      { value: "justify", icon: "AlignJustify" },
                    ].map((option) => {
                      const Icon = lucideIcons[option.icon];
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            updateProperty("textAlign", option.value)
                          }
                          className={`p-2 rounded-md transition-all ${
                            currentProperties[mode].textAlign === option.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "hover:bg-muted"
                          }`}
                          type="button"
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center justify-between">
                    Line Height
                    <span className="text-xs text-muted-foreground">
                      {parseFloat(currentProperties[mode].lineHeight)}×
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[
                          parseFloat(currentProperties[mode].lineHeight) || 1.5,
                        ]}
                        min={0.5}
                        max={3}
                        step={0.1}
                        onValueChange={([value]) =>
                          updateProperty("lineHeight", value.toString())
                        }
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                      />
                    </div>
                    <div className="w-20">
                      <div className="relative">
                        <Input
                          type="number"
                          min={0.5}
                          max={3}
                          step={0.1}
                          value={
                            parseFloat(currentProperties[mode].lineHeight) ||
                            1.5
                          }
                          onChange={(e) => {
                            const value = Math.max(
                              0.5,
                              Math.min(3, Number(e.target.value)),
                            );
                            updateProperty("lineHeight", value.toString());
                          }}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          ×
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center justify-between">
                    Letter Spacing
                    <span className="text-xs text-muted-foreground">
                      {parseFloat(currentProperties[mode].letterSpacing)}px
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[
                          parseFloat(currentProperties[mode].letterSpacing) ||
                            0,
                        ]}
                        min={-2}
                        max={10}
                        step={0.5}
                        onValueChange={([value]) =>
                          updateProperty("letterSpacing", `${value}px`)
                        }
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                      />
                    </div>
                    <div className="w-20">
                      <div className="relative">
                        <Input
                          type="number"
                          min={-2}
                          max={10}
                          step={0.5}
                          value={
                            parseFloat(currentProperties[mode].letterSpacing) ||
                            0
                          }
                          onChange={(e) => {
                            const value = Math.max(
                              -2,
                              Math.min(10, Number(e.target.value)),
                            );
                            updateProperty("letterSpacing", `${value}px`);
                          }}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center justify-between">
                    Padding
                    <span className="text-xs text-muted-foreground">
                      {parseInt(currentProperties[mode].padding)}px
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[parseInt(currentProperties[mode].padding) || 0]}
                        min={0}
                        max={32}
                        step={1}
                        onValueChange={([value]) =>
                          updateProperty("padding", `${value}px`)
                        }
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                      />
                    </div>
                    <div className="w-20">
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          max={32}
                          value={parseInt(currentProperties[mode].padding) || 0}
                          onChange={(e) => {
                            const value = Math.max(
                              0,
                              Math.min(32, Number(e.target.value)),
                            );
                            updateProperty("padding", `${value}px`);
                          }}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="color" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center justify-between">
                    Text Color
                    <span className="text-xs font-mono text-muted-foreground">
                      {currentProperties[mode].textColor}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full ring-1 ring-border">
                      <input
                        type="color"
                        value={currentProperties[mode].textColor}
                        onChange={(e) =>
                          updateProperty("textColor", e.target.value)
                        }
                        className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={currentProperties[mode].textColor}
                      onChange={(e) =>
                        updateProperty("textColor", e.target.value)
                      }
                      className="flex-1 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center justify-between">
                    Background Color
                    <span className="text-xs font-mono text-muted-foreground">
                      {currentProperties[mode].backgroundColor}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full ring-1 ring-border">
                      <input
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
                        className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={currentProperties[mode].backgroundColor}
                      onChange={(e) =>
                        updateProperty("backgroundColor", e.target.value)
                      }
                      className="flex-1 font-mono uppercase"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateProperty("backgroundColor", "transparent")
                      }
                    >
                      Clear
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
