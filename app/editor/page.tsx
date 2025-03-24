"use client"

import { useEffect, useState } from "react"
import { EditorProvider } from "@/components/providers/editor-provider"
import { EditorCanvas } from "@/components/editor/editor-canvas"
import { EditorHeader } from "@/components/editor/editor-header"
import { LeftSidebar } from "@/components/editor/left-sidebar"
import { RightSidebar } from "@/components/editor/right-sidebar"
import { BottomBar } from "@/components/editor/bottom-bar"

export default function EditorPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null // Return null on server-side to prevent hydration errors
  }

  return (
    <EditorProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <EditorHeader />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <EditorCanvas />
          <RightSidebar />
        </div>
        <BottomBar />
      </div>
    </EditorProvider>
  )
}

