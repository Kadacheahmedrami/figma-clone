"use client"

import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function BottomBar() {
  const elements = useStore((state) => state.document.elements)
  const selectedElement = useStore((state) => state.document.selectedElement)
  const selectElement = useStore((state) => state.selectElement)
  const deleteElement = useStore((state) => state.deleteElement)
  const lockElement = useStore((state) => state.lockElement)
  const unlockElement = useStore((state) => state.unlockElement)
  const hideElement = useStore((state) => state.hideElement)
  const showElement = useStore((state) => state.showElement)
  const bringForward = useStore((state) => state.bringForward)
  const sendBackward = useStore((state) => state.sendBackward)

  // Filter out hidden elements for display
  const visibleElements = elements.filter((el) => !el.isHidden)

  return (
    <div className="flex h-12 items-center justify-between border-t bg-background px-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium">Layers ({visibleElements.length})</span>
      </div>
      <ScrollArea className="flex-1 px-2" orientation="horizontal">
        <div className="flex gap-1">
          {visibleElements.map((element) => (
            <Button
              key={element.id}
              variant={selectedElement === element.id ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs whitespace-nowrap"
              onClick={() => selectElement(element.id)}
            >
              {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
              {element.isLocked && <Lock className="ml-1 h-3 w-3" />}
              {element.isHidden && <EyeOff className="ml-1 h-3 w-3" />}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-1">
        {selectedElement && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => sendBackward(selectedElement)}
              title="Send Backward"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => bringForward(selectedElement)}
              title="Bring Forward"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const element = elements.find((el) => el.id === selectedElement)
                if (element?.isHidden) {
                  showElement(selectedElement)
                } else {
                  hideElement(selectedElement)
                }
              }}
              title={elements.find((el) => el.id === selectedElement)?.isHidden ? "Show" : "Hide"}
            >
              {elements.find((el) => el.id === selectedElement)?.isHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const element = elements.find((el) => el.id === selectedElement)
                if (element?.isLocked) {
                  unlockElement(selectedElement)
                } else {
                  lockElement(selectedElement)
                }
              }}
              title={elements.find((el) => el.id === selectedElement)?.isLocked ? "Unlock" : "Lock"}
            >
              {elements.find((el) => el.id === selectedElement)?.isLocked ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => deleteElement(selectedElement)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

