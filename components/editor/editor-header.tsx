"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChevronDown,
  Settings,
  LogOut,
  Undo2,
  Redo2,
  Play,
  Download,
  FileJson,
  FileImage,
  FileImageIcon as FileSvg,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function EditorHeader() {
  const [fileName, setFileName] = useState("Untitled")
  const canUndo = useStore((state) => state.history.past.length > 0)
  const canRedo = useStore((state) => state.history.future.length > 0)
  const undo = useStore((state) => state.undo)
  const redo = useStore((state) => state.redo)
  const elements = useStore((state) => state.document.elements)
  const { saveToStorage } = useLocalStorage()

  const handleSave = () => {
    saveToStorage()
    alert("Project saved to browser storage")
  }

  const handleExport = (format: string) => {
    // In a real implementation, this would convert the canvas to the requested format
    // For now, we'll just show an alert
    alert(`Exporting as ${format}...`)
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary-foreground"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <span className="text-lg font-semibold">DesignHub</span>
        </Link>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                File <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => useStore.getState().resetDocument()}>New File</DropdownMenuItem>
              <DropdownMenuItem onClick={handleSave}>Save</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("png")}>
                <FileImage className="mr-2 h-4 w-4" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("svg")}>
                <FileSvg className="mr-2 h-4 w-4" />
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="mr-2 h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Edit <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={undo} disabled={!canUndo}>
                Undo
                <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={redo} disabled={!canRedo}>
                Redo
                <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => useStore.getState().copySelectedElement()}>
                Copy
                <span className="ml-auto text-xs text-muted-foreground">⌘C</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => useStore.getState().pasteElement()}>
                Paste
                <span className="ml-auto text-xs text-muted-foreground">⌘V</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => useStore.getState().deleteSelectedElement()}>
                Delete
                <span className="ml-auto text-xs text-muted-foreground">⌫</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                View <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => useStore.getState().canvas.zoomIn()}>
                Zoom In
                <span className="ml-auto text-xs text-muted-foreground">⌘+</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => useStore.getState().canvas.zoomOut()}>
                Zoom Out
                <span className="ml-auto text-xs text-muted-foreground">⌘-</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => useStore.getState().canvas.resetZoom()}>
                Fit to Screen
                <span className="ml-auto text-xs text-muted-foreground">⌘0</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => useStore.getState().canvas.toggleGrid()}>Show Grid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => useStore.getState().canvas.toggleRulers()}>Show Rulers</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input value={fileName} onChange={(e) => setFileName(e.target.value)} className="h-8 w-40" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Undo" disabled={!canUndo} onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Redo" disabled={!canRedo} onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <Play className="h-4 w-4" /> Present
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" /> Export
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

