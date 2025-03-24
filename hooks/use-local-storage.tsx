"use client"

import { useCallback } from "react"
import { useStore } from "@/lib/store"

export function useLocalStorage() {
  const saveToStorage = useCallback(() => {
    try {
      // Get a snapshot of the current state instead of using the hook
      const state = useStore.getState()
      const dataToSave = {
        document: state.document,
        canvas: state.canvas,
        tools: state.tools,
      }
      localStorage.setItem("figma-clone-state", JSON.stringify(dataToSave))
      return true
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
      return false
    }
  }, [])

  const loadFromStorage = useCallback(() => {
    try {
      if (typeof window === "undefined") return null

      const savedState = localStorage.getItem("figma-clone-state")
      if (savedState) {
        return JSON.parse(savedState)
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }
    return null
  }, [])

  return { saveToStorage, loadFromStorage }
}

