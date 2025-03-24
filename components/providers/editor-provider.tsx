"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useStore } from "@/lib/store"

interface EditorContextType {
  isMounted: boolean
}

const EditorContext = createContext<EditorContextType>({
  isMounted: false,
})

export const useEditor = () => {
  return useContext(EditorContext)
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    // Load data from localStorage
    try {
      if (typeof window !== "undefined") {
        const savedState = localStorage.getItem("figma-clone-state")
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          useStore.getState().initializeStore(parsedState)
        } else {
          // Initialize with defaults
          useStore.getState().initializeStore({
            document: {
              pages: [{ id: "page-1", name: "Page 1" }],
              activePage: "page-1",
              elements: [],
              selectedElement: null,
              clipboard: null,
            },
            canvas: {
              zoom: 1,
              pan: { x: 0, y: 0 },
              showGrid: true,
              showRulers: true,
            },
            tools: {
              activeTool: "select",
            },
          })
        }
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
      // Initialize with defaults on error
      useStore.getState().initializeStore(null)
    }

    setIsMounted(true)
  }, [])

  return <EditorContext.Provider value={{ isMounted }}>{children}</EditorContext.Provider>
}

