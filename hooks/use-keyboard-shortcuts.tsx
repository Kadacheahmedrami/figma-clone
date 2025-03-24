"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is an input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        useStore.getState().undo()
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") || ((e.metaKey || e.ctrlKey) && e.key === "y")) {
        e.preventDefault()
        useStore.getState().redo()
      }

      // Copy: Cmd/Ctrl + C
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault()
        useStore.getState().copySelectedElement()
      }

      // Paste: Cmd/Ctrl + V
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault()
        useStore.getState().pasteElement()
      }

      // Delete: Delete or Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        // Only if we have a selection and we're not in an input
        if (useStore.getState().document.selectedElement) {
          e.preventDefault()
          useStore.getState().deleteSelectedElement()
        }
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case "v":
          if (!e.metaKey && !e.ctrlKey) {
            useStore.setState((state) => ({
              tools: { ...state.tools, activeTool: "select" },
            }))
          }
          break
        case "h":
          if (!e.metaKey && !e.ctrlKey) {
            useStore.setState((state) => ({
              tools: { ...state.tools, activeTool: "hand" },
            }))
          }
          break
        case "r":
          if (!e.metaKey && !e.ctrlKey) {
            useStore.setState((state) => ({
              tools: { ...state.tools, activeTool: "rectangle" },
            }))
          }
          break
        case "e":
          if (!e.metaKey && !e.ctrlKey) {
            useStore.setState((state) => ({
              tools: { ...state.tools, activeTool: "ellipse" },
            }))
          }
          break
        case "t":
          if (!e.metaKey && !e.ctrlKey) {
            useStore.setState((state) => ({
              tools: { ...state.tools, activeTool: "text" },
            }))
          }
          break
        case "p":
          if (!e.metaKey && !e.ctrlKey) {
            useStore.setState((state) => ({
              tools: { ...state.tools, activeTool: "pen" },
            }))
          }
          break
        case "b":
          if (!e.metaKey && !e.ctrlKey) {
            useStore.setState((state) => ({
              tools: { ...state.tools, activeTool: "pencil" },
            }))
          }
          break
      }

      // Zoom in: Cmd/Ctrl + Plus
      if ((e.metaKey || e.ctrlKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault()
        const currentZoom = useStore.getState().canvas.zoom
        useStore.setState((state) => ({
          canvas: { ...state.canvas, zoom: Math.min(currentZoom + 0.1, 3) },
        }))
      }

      // Zoom out: Cmd/Ctrl + Minus
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault()
        const currentZoom = useStore.getState().canvas.zoom
        useStore.setState((state) => ({
          canvas: { ...state.canvas, zoom: Math.max(currentZoom - 0.1, 0.1) },
        }))
      }

      // Reset zoom: Cmd/Ctrl + 0
      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault()
        useStore.setState((state) => ({
          canvas: { ...state.canvas, zoom: 1, pan: { x: 0, y: 0 } },
        }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])
}

