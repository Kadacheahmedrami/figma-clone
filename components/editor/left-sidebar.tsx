"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  Square,
  Circle,
  Type,
  Image,
  Hand,
  MousePointer,
  Pen,
  Layers,
  Grid3X3,
  PanelLeft,
  Triangle,
  Pencil,
  Hexagon,
  Star,
  Eraser,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

export function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("design")
  const [newPageName, setNewPageName] = useState("")
  const [editingPage, setEditingPage] = useState<string | null>(null)

  const activeTool = useStore((state) => state.tools.activeTool)
  const pages = useStore((state) => state.document.pages)
  const activePage = useStore((state) => state.document.activePage)
  const addPage = useStore((state) => state.addPage)
  const setActivePage = useStore((state) => state.setActivePage)
  const elements = useStore((state) => state.document.elements)

  // Create a function to set the active tool
  const setActiveTool = (tool: string) => {
    // Update the tool in the store
    useStore.setState((state) => ({
      tools: {
        ...state.tools,
        activeTool: tool,
      },
    }))
  }

  // Handle page name change
  const handlePageNameChange = (id: string, name: string) => {
    useStore.setState((state) => {
      const pageIndex = state.document.pages.findIndex((page) => page.id === id)
      if (pageIndex !== -1) {
        state.document.pages[pageIndex].name = name
      }
    })
    setEditingPage(null)
  }

  // Handle adding a new page
  const handleAddPage = () => {
    if (newPageName.trim()) {
      addPage(newPageName.trim())
      setNewPageName("")
    } else {
      addPage()
    }
  }

  // Get elements for the current page
  const currentPageElements = elements.filter((el) => !el.isHidden)

  return (
    <TooltipProvider>
      <div className={`flex flex-col border-r bg-background transition-all ${collapsed ? "w-14" : "w-64"}`}>
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <PanelLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
          <TabsList className="grid h-auto w-full grid-cols-2 p-1">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="prototype">Prototype</TabsTrigger>
          </TabsList>
          <div className="flex flex-1 flex-col p-2">
            {activeTab === "design" && (
              <>
                <div className="mb-4 space-y-1">
                  <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">Tools</div>
                  <div className="grid grid-cols-2 gap-1">
                    <ToolButton
                      icon={<MousePointer className="h-4 w-4" />}
                      label="Select"
                      collapsed={collapsed}
                      active={activeTool === "select"}
                      onClick={() => setActiveTool("select")}
                      shortcut="V"
                    />
                    <ToolButton
                      icon={<Hand className="h-4 w-4" />}
                      label="Hand Tool"
                      collapsed={collapsed}
                      active={activeTool === "hand"}
                      onClick={() => setActiveTool("hand")}
                      shortcut="H"
                    />
                    <ToolButton
                      icon={<Square className="h-4 w-4" />}
                      label="Rectangle"
                      collapsed={collapsed}
                      active={activeTool === "rectangle"}
                      onClick={() => setActiveTool("rectangle")}
                      shortcut="R"
                    />
                    <ToolButton
                      icon={<Circle className="h-4 w-4" />}
                      label="Ellipse"
                      collapsed={collapsed}
                      active={activeTool === "ellipse"}
                      onClick={() => setActiveTool("ellipse")}
                      shortcut="E"
                    />
                    <ToolButton
                      icon={<Triangle className="h-4 w-4" />}
                      label="Triangle"
                      collapsed={collapsed}
                      active={
                        activeTool === "polygon" &&
                        elements.find((el) => el.id === "polygon-preset-triangle")?.sides === 3
                      }
                      onClick={() => {
                        setActiveTool("polygon")
                        useStore.setState((state) => {
                          state.document.elements = state.document.elements.filter(
                            (el) => !el.id.startsWith("polygon-preset"),
                          )
                          state.document.elements.push({
                            id: "polygon-preset-triangle",
                            type: "polygon",
                            sides: 3,
                            x: -1000,
                            y: -1000,
                            width: 0,
                            height: 0,
                            fill: "#4f46e5",
                            stroke: "#312e81",
                            strokeWidth: 1,
                            isHidden: true,
                          })
                        })
                      }}
                    />
                    <ToolButton
                      icon={<Hexagon className="h-4 w-4" />}
                      label="Hexagon"
                      collapsed={collapsed}
                      active={
                        activeTool === "polygon" &&
                        elements.find((el) => el.id === "polygon-preset-hexagon")?.sides === 6
                      }
                      onClick={() => {
                        setActiveTool("polygon")
                        useStore.setState((state) => {
                          state.document.elements = state.document.elements.filter(
                            (el) => !el.id.startsWith("polygon-preset"),
                          )
                          state.document.elements.push({
                            id: "polygon-preset-hexagon",
                            type: "polygon",
                            sides: 6,
                            x: -1000,
                            y: -1000,
                            width: 0,
                            height: 0,
                            fill: "#4f46e5",
                            stroke: "#312e81",
                            strokeWidth: 1,
                            isHidden: true,
                          })
                        })
                      }}
                    />
                    <ToolButton
                      icon={<Star className="h-4 w-4" />}
                      label="Star"
                      collapsed={collapsed}
                      active={
                        activeTool === "polygon" && elements.find((el) => el.id === "polygon-preset-star")?.sides === 5
                      }
                      onClick={() => {
                        setActiveTool("polygon")
                        useStore.setState((state) => {
                          state.document.elements = state.document.elements.filter(
                            (el) => !el.id.startsWith("polygon-preset"),
                          )
                          state.document.elements.push({
                            id: "polygon-preset-star",
                            type: "polygon",
                            sides: 5,
                            x: -1000,
                            y: -1000,
                            width: 0,
                            height: 0,
                            fill: "#4f46e5",
                            stroke: "#312e81",
                            strokeWidth: 1,
                            isHidden: true,
                          })
                        })
                      }}
                    />
                    <ToolButton
                      icon={<Type className="h-4 w-4" />}
                      label="Text"
                      collapsed={collapsed}
                      active={activeTool === "text"}
                      onClick={() => setActiveTool("text")}
                      shortcut="T"
                    />
                    <ToolButton
                      icon={<Image className="h-4 w-4" />}
                      label="Image"
                      collapsed={collapsed}
                      active={activeTool === "image"}
                      onClick={() => setActiveTool("image")}
                      shortcut="I"
                    />
                    <ToolButton
                      icon={<Pen className="h-4 w-4" />}
                      label="Pen"
                      collapsed={collapsed}
                      active={activeTool === "pen"}
                      onClick={() => setActiveTool("pen")}
                      shortcut="P"
                    />
                    <ToolButton
                      icon={<Pencil className="h-4 w-4" />}
                      label="Pencil"
                      collapsed={collapsed}
                      active={activeTool === "pencil"}
                      onClick={() => setActiveTool("pencil")}
                      shortcut="B"
                    />
                    <ToolButton
                      icon={<Eraser className="h-4 w-4" />}
                      label="Eraser"
                      collapsed={collapsed}
                      active={activeTool === "eraser"}
                      onClick={() => setActiveTool("eraser")}
                      shortcut="E"
                    />
                  </div>
                </div>
                {!collapsed && (
                  <>
                    <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">Pages</div>
                    <ScrollArea className="flex-1 pr-3">
                      <div className="space-y-1">
                        {pages.map((page) => (
                          <div key={page.id} className="flex items-center gap-1">
                            {editingPage === page.id ? (
                              <Input
                                autoFocus
                                value={page.name}
                                onChange={(e) => {
                                  useStore.setState((state) => {
                                    const pageIndex = state.document.pages.findIndex((p) => p.id === page.id)
                                    if (pageIndex !== -1) {
                                      state.document.pages[pageIndex].name = e.target.value
                                    }
                                  })
                                }}
                                onBlur={() => setEditingPage(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handlePageNameChange(page.id, page.name)
                                  }
                                }}
                                className="h-8"
                              />
                            ) : (
                              <Button
                                key={page.id}
                                variant={page.id === activePage ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setActivePage(page.id)}
                                onDoubleClick={() => setEditingPage(page.id)}
                              >
                                {page.name}
                              </Button>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-1 mt-2">
                          <Input
                            value={newPageName}
                            onChange={(e) => setNewPageName(e.target.value)}
                            placeholder="New page name"
                            className="h-8"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddPage()
                              }
                            }}
                          />
                          <Button variant="outline" size="sm" onClick={handleAddPage}>
                            Add
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>

                    <div className="mt-4">
                      <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">Layers</div>
                      <ScrollArea className="h-40 pr-3">
                        <div className="space-y-1">
                          {currentPageElements.length === 0 ? (
                            <div className="text-xs text-muted-foreground p-2 text-center">
                              No elements on this page
                            </div>
                          ) : (
                            currentPageElements.map((element) => (
                              <Button
                                key={element.id}
                                variant={
                                  element.id === useStore.getState().document.selectedElement ? "secondary" : "ghost"
                                }
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => useStore.getState().selectElement(element.id)}
                              >
                                {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                              </Button>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </>
            )}
            {activeTab === "prototype" && !collapsed && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Layers className="h-8 w-8 mb-2" />
                <p className="text-sm">Select a frame to create a connection</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="border-t p-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Grid3X3 className="mr-2 h-4 w-4" />
                Assets
              </Button>
            </div>
          )}
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

function ToolButton({ icon, label, collapsed, active = false, onClick, shortcut }) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={active ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={onClick}>
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {label} {shortcut && <span className="ml-1 text-xs opacity-60">({shortcut})</span>}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button variant={active ? "secondary" : "ghost"} size="sm" className="w-full justify-start" onClick={onClick}>
      <span className="mr-2">{icon}</span>
      {label}
      {shortcut && <span className="ml-auto text-xs opacity-60">({shortcut})</span>}
    </Button>
  )
}

