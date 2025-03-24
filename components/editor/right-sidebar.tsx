"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  PanelRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Layers,
  Settings,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Copy,
  Trash,
  MoveUp,
  MoveDown,
  CornerUpLeft,
  CornerUpRight,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function RightSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("design")
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null)

  const selectedElement = useStore((state) => state.document.selectedElement)
  const elements = useStore((state) => state.document.elements)
  const updateElement = useStore((state) => state.updateElement)
  const alignElements = useStore((state) => state.alignElements)
  const distributeElements = useStore((state) => state.distributeElements)
  const lockElement = useStore((state) => state.lockElement)
  const unlockElement = useStore((state) => state.unlockElement)
  const hideElement = useStore((state) => state.hideElement)
  const showElement = useStore((state) => state.showElement)
  const bringForward = useStore((state) => state.bringForward)
  const sendBackward = useStore((state) => state.sendBackward)
  const bringToFront = useStore((state) => state.bringToFront)
  const sendToBack = useStore((state) => state.sendToBack)
  const copySelectedElement = useStore((state) => state.copySelectedElement)
  const deleteSelectedElement = useStore((state) => state.deleteSelectedElement)

  const selectedElementData = selectedElement ? elements.find((el) => el.id === selectedElement) : null

  if (collapsed) {
    return (
      <div className="flex w-10 flex-col items-center border-l bg-background py-2">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} title="Expand">
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const handlePropertyChange = (property, value) => {
    if (!selectedElement) return
    updateElement(selectedElement, { [property]: value })
  }

  // Color picker component
  const ColorPicker = ({ color, onChange, property }) => {
    const colors = [
      "#000000",
      "#ffffff",
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffeb3b",
      "#ffc107",
      "#ff9800",
      "#ff5722",
    ]

    return (
      <Popover open={colorPickerOpen === property} onOpenChange={(open) => setColorPickerOpen(open ? property : null)}>
        <PopoverTrigger asChild>
          <div className="h-8 w-8 rounded border cursor-pointer" style={{ backgroundColor: color }} />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="grid grid-cols-6 gap-1">
            {colors.map((c) => (
              <div
                key={c}
                className="h-6 w-6 rounded cursor-pointer border hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => {
                  onChange(c)
                  setColorPickerOpen(null)
                }}
              />
            ))}
          </div>
          <div className="mt-2">
            <Input value={color} onChange={(e) => onChange(e.target.value)} className="h-8" placeholder="#RRGGBB" />
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="flex w-80 flex-col border-l bg-background">
      <div className="flex justify-between p-2 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">
              <Palette className="mr-2 h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="prototype">
              <Layers className="mr-2 h-4 w-4" />
              Prototype
            </TabsTrigger>
            <TabsTrigger value="inspect">
              <Settings className="mr-2 h-4 w-4" />
              Inspect
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)} className="ml-2" title="Collapse">
          <PanelRight className="h-4 w-4 rotate-180" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="design" className="mt-0 h-full">
              {selectedElementData ? (
                <div className="space-y-6">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">
                      {selectedElementData.type.charAt(0).toUpperCase() + selectedElementData.type.slice(1)}
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copySelectedElement()}
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteSelectedElement()}
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Layout</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="x" className="text-xs">
                          X
                        </Label>
                        <Input
                          id="x"
                          type="number"
                          value={Math.round(selectedElementData.x)}
                          onChange={(e) => handlePropertyChange("x", Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="y" className="text-xs">
                          Y
                        </Label>
                        <Input
                          id="y"
                          type="number"
                          value={Math.round(selectedElementData.y)}
                          onChange={(e) => handlePropertyChange("y", Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="width" className="text-xs">
                          Width
                        </Label>
                        <Input
                          id="width"
                          type="number"
                          value={Math.round(selectedElementData.width)}
                          onChange={(e) => handlePropertyChange("width", Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="height" className="text-xs">
                          Height
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          value={Math.round(selectedElementData.height)}
                          onChange={(e) => handlePropertyChange("height", Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="rotation" className="text-xs">
                          Rotation
                        </Label>
                        <Input
                          id="rotation"
                          type="number"
                          value={Math.round(selectedElementData.rotation || 0)}
                          onChange={(e) => handlePropertyChange("rotation", Number(e.target.value))}
                          className="h-8"
                        />
                      </div>

                      {selectedElementData.type === "polygon" && (
                        <div className="space-y-1">
                          <Label htmlFor="sides" className="text-xs">
                            Sides
                          </Label>
                          <Input
                            id="sides"
                            type="number"
                            min="3"
                            max="12"
                            value={selectedElementData.sides || 3}
                            onChange={(e) => handlePropertyChange("sides", Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      <Label className="text-xs">Alignment</Label>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => alignElements("left")}>
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => alignElements("center")}
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => alignElements("right")}
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => alignElements("top")}>
                          <AlignHorizontalJustifyCenter className="h-4 w-4 rotate-90" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => alignElements("middle")}
                        >
                          <AlignVerticalJustifyCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => alignElements("bottom")}
                        >
                          <AlignHorizontalJustifyCenter className="h-4 w-4 -rotate-90" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <Label className="text-xs">Distribution</Label>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => distributeElements("horizontal")}
                        >
                          <AlignHorizontalSpaceAround className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => distributeElements("vertical")}
                        >
                          <AlignVerticalSpaceAround className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Appearance</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="fill" className="text-xs">
                            Fill
                          </Label>
                          <span className="text-xs text-muted-foreground">{selectedElementData.fill}</span>
                        </div>
                        <div className="flex gap-2">
                          <ColorPicker
                            color={selectedElementData.fill}
                            onChange={(value) => handlePropertyChange("fill", value)}
                            property="fill"
                          />
                          <Input
                            id="fill"
                            value={selectedElementData.fill}
                            onChange={(e) => handlePropertyChange("fill", e.target.value)}
                            className="h-8 flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="stroke" className="text-xs">
                            Stroke
                          </Label>
                          <span className="text-xs text-muted-foreground">{selectedElementData.stroke}</span>
                        </div>
                        <div className="flex gap-2">
                          <ColorPicker
                            color={selectedElementData.stroke}
                            onChange={(value) => handlePropertyChange("stroke", value)}
                            property="stroke"
                          />
                          <Input
                            id="stroke"
                            value={selectedElementData.stroke}
                            onChange={(e) => handlePropertyChange("stroke", e.target.value)}
                            className="h-8 flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="stroke-width" className="text-xs">
                            Stroke Width
                          </Label>
                          <span className="text-xs text-muted-foreground">{selectedElementData.strokeWidth}px</span>
                        </div>
                        <Slider
                          id="stroke-width"
                          value={[selectedElementData.strokeWidth]}
                          min={0}
                          max={20}
                          step={1}
                          onValueChange={(value) => handlePropertyChange("strokeWidth", value[0])}
                          className="py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="opacity" className="text-xs">
                            Opacity
                          </Label>
                          <span className="text-xs text-muted-foreground">{selectedElementData.opacity || 1}</span>
                        </div>
                        <Slider
                          id="opacity"
                          value={[selectedElementData.opacity ? selectedElementData.opacity * 100 : 100]}
                          max={100}
                          step={1}
                          onValueChange={(value) => handlePropertyChange("opacity", value[0] / 100)}
                          className="py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedElementData.type === "text" && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Typography</h3>
                      <div className="space-y-3">
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Underline className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <AlignRight className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <AlignJustify className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="font-family" className="text-xs">
                            Font
                          </Label>
                          <Select
                            value={selectedElementData.fontFamily || "Inter"}
                            onValueChange={(value) => handlePropertyChange("fontFamily", value)}
                          >
                            <SelectTrigger id="font-family" className="h-8">
                              <SelectValue placeholder="Select font" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor="font-size" className="text-xs">
                              Size
                            </Label>
                            <Input
                              id="font-size"
                              type="number"
                              value={selectedElementData.fontSize || 16}
                              onChange={(e) => handlePropertyChange("fontSize", Number(e.target.value))}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="line-height" className="text-xs">
                              Line Height
                            </Label>
                            <Input
                              id="line-height"
                              type="number"
                              step="0.1"
                              value={selectedElementData.lineHeight || 1.5}
                              onChange={(e) => handlePropertyChange("lineHeight", Number(e.target.value))}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Layer</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="layer-lock" className="text-xs">
                          Lock Layer
                        </Label>
                        <Switch
                          id="layer-lock"
                          checked={selectedElementData.isLocked || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              lockElement(selectedElement)
                            } else {
                              unlockElement(selectedElement)
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="layer-visible" className="text-xs">
                          Visible
                        </Label>
                        <Switch
                          id="layer-visible"
                          checked={!selectedElementData.isHidden}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              showElement(selectedElement)
                            } else {
                              hideElement(selectedElement)
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Layer Order</Label>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => bringToFront(selectedElement)}
                          >
                            <MoveUp className="mr-1 h-4 w-4" /> Bring to Front
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => sendToBack(selectedElement)}
                          >
                            <MoveDown className="mr-1 h-4 w-4" /> Send to Back
                          </Button>
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => bringForward(selectedElement)}
                          >
                            <CornerUpRight className="mr-1 h-4 w-4" /> Forward
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => sendBackward(selectedElement)}
                          >
                            <CornerUpLeft className="mr-1 h-4 w-4" /> Backward
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                  <Settings className="h-10 w-10 mb-2" />
                  <h3 className="text-lg font-medium mb-1">No Selection</h3>
                  <p className="text-sm">Select an element to edit its properties</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="prototype" className="mt-0 h-full">
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                <Type className="h-10 w-10 mb-2" />
                <h3 className="text-lg font-medium mb-1">No Connections</h3>
                <p className="text-sm">Select an element to create a connection</p>
              </div>
            </TabsContent>

            <TabsContent value="inspect" className="mt-0 h-full">
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                <Settings className="h-10 w-10 mb-2" />
                <h3 className="text-lg font-medium mb-1">Developer Export</h3>
                <p className="text-sm">Select an element to view code</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}

