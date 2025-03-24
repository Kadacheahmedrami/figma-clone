"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, MousePointer2, Square, Circle, Type, Pen, Pencil } from "lucide-react"
import { useStore } from "@/lib/store"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isReady, setIsReady] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [tempElement, setTempElement] = useState<any>(null)
  const [resizing, setResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 })
  const [originalElement, setOriginalElement] = useState<any>(null)
  const [moving, setMoving] = useState(false)
  const [moveStart, setMoveStart] = useState({ x: 0, y: 0 })

  // Use keyboard shortcuts
  useKeyboardShortcuts()

  // Use a more selective selector to prevent unnecessary re-renders
  const elements = useStore((state) => state.document.elements)
  const selectedElement = useStore((state) => state.document.selectedElement)
  const zoom = useStore((state) => state.canvas.zoom)
  const pan = useStore((state) => state.canvas.pan)
  const activeTool = useStore((state) => state.tools.activeTool)
  const showGrid = useStore((state) => state.canvas.showGrid)
  const showRulers = useStore((state) => state.canvas.showRulers)

  // Get actions from store without causing re-renders
  const { selectElement, deselectElement, updateElement, addElement } = useStore()

  // For canvas actions, use setState to update the store
  const setZoom = (newZoom: number) => {
    useStore.setState((state) => ({
      canvas: {
        ...state.canvas,
        zoom: newZoom,
      },
    }))
  }

  const setPan = (newPan: { x: number; y: number }) => {
    useStore.setState((state) => ({
      canvas: {
        ...state.canvas,
        pan: newPan,
      },
    }))
  }

  const setActiveTool = (tool: string) => {
    useStore.setState((state) => ({
      tools: {
        ...state.tools,
        activeTool: tool,
      },
    }))
  }

  // Initialize dimensions once on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      } else {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    setIsReady(true)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Draw the canvas whenever elements, zoom, pan, or dimensions change
  useEffect(() => {
    if (!canvasRef.current || !isReady) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and pan
    ctx.save()
    ctx.translate(pan?.x || 0, pan?.y || 0)
    ctx.scale(zoom || 1, zoom || 1)

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, dimensions.width / (zoom || 1), dimensions.height / (zoom || 1))
    }

    // Draw rulers if enabled
    if (showRulers) {
      drawRulers(ctx, dimensions.width / (zoom || 1), dimensions.height / (zoom || 1))
    }

    // Draw elements
    elements.forEach((element) => {
      if (!element.isHidden) {
        drawElement(ctx, element, element.id === selectedElement)
      }
    })

    // Draw temporary element if drawing
    if (tempElement) {
      drawElement(ctx, tempElement, true)
    }

    ctx.restore()
  }, [elements, selectedElement, zoom, pan, dimensions, showGrid, showRulers, isReady, tempElement])

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 0.5 / (zoom || 1)
    ctx.beginPath()

    // Horizontal lines
    for (let i = 0; i < height; i += gridSize) {
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
    }

    // Vertical lines
    for (let i = 0; i < width; i += gridSize) {
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
    }

    ctx.stroke()
  }

  // Draw rulers
  const drawRulers = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const rulerSize = 20

    // Draw ruler backgrounds
    ctx.fillStyle = "#f9fafb"
    ctx.fillRect(0, 0, width, rulerSize)
    ctx.fillRect(0, 0, rulerSize, height)

    // Draw ruler borders
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 0.5 / (zoom || 1)
    ctx.strokeRect(0, 0, width, rulerSize)
    ctx.strokeRect(0, 0, rulerSize, height)

    // Draw ticks
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 0.5 / (zoom || 1)
    ctx.fillStyle = "#000"
    ctx.font = `${8 / (zoom || 1)}px sans-serif`

    const tickInterval = 10
    const tickSize = 5

    // Horizontal ticks
    for (let i = 0; i < width; i += tickInterval) {
      ctx.beginPath()
      ctx.moveTo(i, rulerSize - tickSize)
      ctx.lineTo(i, rulerSize)
      ctx.stroke()

      // Add labels for every 100 pixels
      if (i % 100 === 0 && i > 0) {
        ctx.fillText(`${i}`, i - 10, 10)
      }
    }

    // Vertical ticks
    for (let i = 0; i < height; i += tickInterval) {
      ctx.beginPath()
      ctx.moveTo(rulerSize - tickSize, i)
      ctx.lineTo(rulerSize, i)
      ctx.stroke()

      // Add labels for every 100 pixels
      if (i % 100 === 0 && i > 0) {
        ctx.fillText(`${i}`, 2, i + 4)
      }
    }
  }

  // Draw a single element
  const drawElement = (ctx: CanvasRenderingContext2D, element: any, isSelected: boolean) => {
    const {
      id,
      type,
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      rotation = 0,
      text,
      points,
      radius,
      sides,
      opacity = 1,
    } = element

    // Save context state
    ctx.save()

    // Apply element transformations
    ctx.translate(x + width / 2, y + height / 2)
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180)
    }
    ctx.translate(-width / 2, -height / 2)

    // Set element styles
    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth
    ctx.globalAlpha = opacity

    // Draw based on element type
    switch (type) {
      case "rectangle":
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.fill()
        ctx.stroke()
        break
      case "ellipse":
        ctx.beginPath()
        ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        break
      case "text":
        ctx.fillStyle = fill
        const fontSize = element.fontSize || 24
        const fontFamily = element.fontFamily || "sans-serif"
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.fillText(text || "", 0, fontSize)
        break
      case "polygon":
        if (sides && sides >= 3) {
          ctx.beginPath()
          const r = radius || Math.min(width, height) / 2
          const centerX = width / 2
          const centerY = height / 2

          for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
            const pointX = centerX + r * Math.cos(angle)
            const pointY = centerY + r * Math.sin(angle)

            if (i === 0) {
              ctx.moveTo(pointX, pointY)
            } else {
              ctx.lineTo(pointX, pointY)
            }
          }

          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        }
        break
      case "pen":
      case "pencil":
        if (points && points.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(points[0], points[1])

          for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1])
          }

          if (type === "pen") {
            ctx.stroke()
          } else {
            // For pencil, we'll use a thinner stroke
            const originalWidth = ctx.lineWidth
            ctx.lineWidth = originalWidth / 2
            ctx.stroke()
            ctx.lineWidth = originalWidth
          }
        }
        break
    }

    // Draw selection outline if selected
    if (isSelected) {
      ctx.strokeStyle = "#4f46e5"
      ctx.lineWidth = 1 / (zoom || 1)
      ctx.setLineDash([5 / (zoom || 1), 5 / (zoom || 1)])
      ctx.strokeRect(-2, -2, width + 4, height + 4)
      ctx.setLineDash([])

      // Draw resize handles
      const handleSize = 8 / (zoom || 1)
      ctx.fillStyle = "white"
      ctx.strokeStyle = "#4f46e5"
      ctx.lineWidth = 1 / (zoom || 1)

      // Corner handles
      drawHandle(ctx, -handleSize / 2, -handleSize / 2, handleSize, "nw")
      drawHandle(ctx, width - handleSize / 2, -handleSize / 2, handleSize, "ne")
      drawHandle(ctx, -handleSize / 2, height - handleSize / 2, handleSize, "sw")
      drawHandle(ctx, width - handleSize / 2, height - handleSize / 2, handleSize, "se")

      // Middle handles
      drawHandle(ctx, width / 2 - handleSize / 2, -handleSize / 2, handleSize, "n")
      drawHandle(ctx, width - handleSize / 2, height / 2 - handleSize / 2, handleSize, "e")
      drawHandle(ctx, width / 2 - handleSize / 2, height - handleSize / 2, handleSize, "s")
      drawHandle(ctx, -handleSize / 2, height / 2 - handleSize / 2, handleSize, "w")
    }

    // Restore context state
    ctx.restore()
  }

  // Draw a resize handle
  const drawHandle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, position: string) => {
    ctx.fillRect(x, y, size, size)
    ctx.strokeRect(x, y, size, size)

    // Store the handle position for hit testing
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, size, size)
    ctx.restore()
  }

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - (pan?.x || 0)) / (zoom || 1),
      y: (e.clientY - rect.top - (pan?.y || 0)) / (zoom || 1),
    }
  }

  // Check if a point is inside a resize handle
  const getResizeHandleAtPosition = (element: any, point: { x: number; y: number }) => {
    const { x, y, width, height } = element
    const handleSize = 8 / (zoom || 1)

    // Check each handle
    // Top-left
    if (
      point.x >= x - handleSize / 2 &&
      point.x <= x + handleSize / 2 &&
      point.y >= y - handleSize / 2 &&
      point.y <= y + handleSize / 2
    ) {
      return "nw"
    }

    // Top-right
    if (
      point.x >= x + width - handleSize / 2 &&
      point.x <= x + width + handleSize / 2 &&
      point.y >= y - handleSize / 2 &&
      point.y <= y + handleSize / 2
    ) {
      return "ne"
    }

    // Bottom-left
    if (
      point.x >= x - handleSize / 2 &&
      point.x <= x + handleSize / 2 &&
      point.y >= y + height - handleSize / 2 &&
      point.y <= y + height + handleSize / 2
    ) {
      return "sw"
    }

    // Bottom-right
    if (
      point.x >= x + width - handleSize / 2 &&
      point.x <= x + width + handleSize / 2 &&
      point.y >= y + height - handleSize / 2 &&
      point.y <= y + height + handleSize / 2
    ) {
      return "se"
    }

    // Top-middle
    if (
      point.x >= x + width / 2 - handleSize / 2 &&
      point.x <= x + width / 2 + handleSize / 2 &&
      point.y >= y - handleSize / 2 &&
      point.y <= y + handleSize / 2
    ) {
      return "n"
    }

    // Right-middle
    if (
      point.x >= x + width - handleSize / 2 &&
      point.x <= x + width + handleSize / 2 &&
      point.y >= y + height / 2 - handleSize / 2 &&
      point.y <= y + height / 2 + handleSize / 2
    ) {
      return "e"
    }

    // Bottom-middle
    if (
      point.x >= x + width / 2 - handleSize / 2 &&
      point.x <= x + width / 2 + handleSize / 2 &&
      point.y >= y + height - handleSize / 2 &&
      point.y <= y + height + handleSize / 2
    ) {
      return "s"
    }

    // Left-middle
    if (
      point.x >= x - handleSize / 2 &&
      point.x <= x + handleSize / 2 &&
      point.y >= y + height / 2 - handleSize / 2 &&
      point.y <= y + height / 2 + handleSize / 2
    ) {
      return "w"
    }

    return null
  }

  // Handle mouse down on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const point = getCanvasCoordinates(e)

    // Check if clicking on a resize handle of the selected element
    if (selectedElement) {
      const selectedElementData = elements.find((el) => el.id === selectedElement)
      if (selectedElementData) {
        const handle = getResizeHandleAtPosition(selectedElementData, point)
        if (handle) {
          setResizing(handle)
          setResizeStart(point)
          setOriginalElement({ ...selectedElementData })
          return
        }

        // Check if clicking on the selected element (for moving)
        if (
          point.x >= selectedElementData.x &&
          point.x <= selectedElementData.x + selectedElementData.width &&
          point.y >= selectedElementData.y &&
          point.y <= selectedElementData.y + selectedElementData.height
        ) {
          setMoving(true)
          setMoveStart(point)
          setOriginalElement({ ...selectedElementData })
          return
        }
      }
    }

    // Check if clicking on an element
    const clickedElement = findElementAtPosition(point.x, point.y)

    if (clickedElement) {
      selectElement(clickedElement.id)

      // If double-clicking on a text element, enable editing
      if (clickedElement.type === "text" && e.detail === 2) {
        const newText = prompt("Edit text:", clickedElement.text)
        if (newText !== null) {
          updateElement(clickedElement.id, { text: newText })
        }
      }
    } else {
      deselectElement()

      // If a drawing tool is active, start drawing
      if (activeTool !== "select" && activeTool !== "hand") {
        setIsDrawing(true)
        setDrawStart(point)

        // Create a temporary element based on the active tool
        const newElement: any = {
          id: `element-${Date.now()}`,
          type: activeTool,
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          fill: "#4f46e5",
          stroke: "#312e81",
          strokeWidth: 1,
          opacity: 1,
        }

        // Add tool-specific properties
        switch (activeTool) {
          case "text":
            newElement.text = "Double click to edit"
            newElement.fontSize = 24
            newElement.fontFamily = "sans-serif"
            newElement.width = 200
            newElement.height = 30
            break
          case "pen":
          case "pencil":
            newElement.points = [0, 0]
            newElement.width = 100
            newElement.height = 100
            break
          case "ellipse":
            newElement.radius = 50
            break
          case "polygon":
            newElement.sides = 3
            newElement.radius = 50
            break
        }

        setTempElement(newElement)
      } else if (activeTool === "hand") {
        // Start panning
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }
  }

  // Handle mouse move on canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const point = getCanvasCoordinates(e)

    // Handle resizing
    if (resizing && selectedElement && originalElement) {
      const selectedElementData = { ...originalElement }
      let newX = selectedElementData.x
      let newY = selectedElementData.y
      let newWidth = selectedElementData.width
      let newHeight = selectedElementData.height

      // Calculate new dimensions based on resize handle
      switch (resizing) {
        case "nw":
          newX = point.x
          newY = point.y
          newWidth = originalElement.x + originalElement.width - point.x
          newHeight = originalElement.y + originalElement.height - point.y
          break
        case "ne":
          newY = point.y
          newWidth = point.x - originalElement.x
          newHeight = originalElement.y + originalElement.height - point.y
          break
        case "sw":
          newX = point.x
          newWidth = originalElement.x + originalElement.width - point.x
          newHeight = point.y - originalElement.y
          break
        case "se":
          newWidth = point.x - originalElement.x
          newHeight = point.y - originalElement.y
          break
        case "n":
          newY = point.y
          newHeight = originalElement.y + originalElement.height - point.y
          break
        case "e":
          newWidth = point.x - originalElement.x
          break
        case "s":
          newHeight = point.y - originalElement.y
          break
        case "w":
          newX = point.x
          newWidth = originalElement.x + originalElement.width - point.x
          break
      }

      // Ensure minimum dimensions
      if (newWidth < 10) newWidth = 10
      if (newHeight < 10) newHeight = 10

      // Update the element
      updateElement(selectedElement, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      })

      return
    }

    // Handle moving
    if (moving && selectedElement && originalElement) {
      const dx = point.x - moveStart.x
      const dy = point.y - moveStart.y

      updateElement(selectedElement, {
        x: originalElement.x + dx,
        y: originalElement.y + dy,
      })

      return
    }

    // Handle drawing
    if (isDrawing && tempElement) {
      const dx = point.x - drawStart.x
      const dy = point.y - drawStart.y

      const updatedElement = { ...tempElement }

      switch (tempElement.type) {
        case "rectangle":
        case "ellipse":
          // For rectangle and ellipse, update position and dimensions
          if (dx < 0) {
            updatedElement.x = point.x
            updatedElement.width = Math.abs(dx)
          } else {
            updatedElement.width = dx
          }

          if (dy < 0) {
            updatedElement.y = point.y
            updatedElement.height = Math.abs(dy)
          } else {
            updatedElement.height = dy
          }
          break
        case "pen":
        case "pencil":
          // For pen and pencil, add points
          const relativeX = point.x - tempElement.x
          const relativeY = point.y - tempElement.y
          updatedElement.points = [...tempElement.points, relativeX, relativeY]

          // Update width and height to encompass all points
          const allX = []
          const allY = []
          for (let i = 0; i < updatedElement.points.length; i += 2) {
            allX.push(updatedElement.points[i])
            allY.push(updatedElement.points[i + 1])
          }

          const minX = Math.min(0, ...allX)
          const maxX = Math.max(0, ...allX)
          const minY = Math.min(0, ...allY)
          const maxY = Math.max(0, ...allY)

          if (minX < 0) {
            updatedElement.x = tempElement.x + minX
            updatedElement.width = maxX - minX

            // Adjust points
            for (let i = 0; i < updatedElement.points.length; i += 2) {
              updatedElement.points[i] -= minX
            }
          } else {
            updatedElement.width = maxX
          }

          if (minY < 0) {
            updatedElement.y = tempElement.y + minY
            updatedElement.height = maxY - minY

            // Adjust points
            for (let i = 1; i < updatedElement.points.length; i += 2) {
              updatedElement.points[i] -= minY
            }
          } else {
            updatedElement.height = maxY
          }
          break
        case "text":
          // For text, just update width and height
          updatedElement.width = Math.max(100, Math.abs(dx))
          updatedElement.height = Math.max(30, Math.abs(dy))
          break
        case "polygon":
          // For polygon, update radius
          updatedElement.radius = Math.max(Math.abs(dx), Math.abs(dy)) / 2
          updatedElement.width = updatedElement.radius * 2
          updatedElement.height = updatedElement.radius * 2
          break
      }

      setTempElement(updatedElement)
    } else if (isDragging && activeTool === "hand") {
      // Handle panning
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      setPan({
        x: (pan?.x || 0) + dx,
        y: (pan?.y || 0) + dy,
      })

      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  // Handle mouse up on canvas
  const handleMouseUp = () => {
    // Handle drawing completion
    if (isDrawing && tempElement) {
      // Only add the element if it has a valid size
      if (tempElement.width > 0 && tempElement.height > 0) {
        addElement(tempElement)
      }

      setIsDrawing(false)
      setTempElement(null)

      // Switch back to select tool after drawing
      setActiveTool("select")
    }

    // Reset dragging state
    setIsDragging(false)

    // Reset resizing state
    setResizing(null)
    setOriginalElement(null)

    // Reset moving state
    setMoving(false)
  }

  // Find element at position
  const findElementAtPosition = (x: number, y: number) => {
    // Check elements in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]

      // Skip hidden or locked elements
      if (element.isHidden || element.isLocked) continue

      // Simple bounding box check
      if (x >= element.x && x <= element.x + element.width && y >= element.y && y <= element.y + element.height) {
        return element
      }
    }

    return null
  }

  // Handle zoom in button click
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + 0.1, 3)
    setZoom(newZoom)
  }, [zoom])

  // Handle zoom out button click
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 0.1, 0.1)
    setZoom(newZoom)
  }, [zoom])

  // Handle zoom slider change
  const handleSliderChange = useCallback((value:any) => {
    setZoom(value[0] / 100)
  }, [])

  // Handle wheel event for zooming
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    if (e.ctrlKey) {
      // Zoom
      const scaleBy = 1.05
      const oldScale = zoom || 1
      const newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

      // Only update if significant change
      if (Math.abs(newScale - oldScale) > 0.01) {
        setZoom(newScale)
      }
    } else {
      // Pan
      const dx = e.deltaX
      const dy = e.deltaY

      // Only update if significant change
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        setPan({
          x: (pan?.x || 0) - dx,
          y: (pan?.y || 0) - dy,
        })
      }
    }
  }

  // Get cursor style based on active tool and state
  const getCursorStyle = () => {
    if (resizing) return "nwse-resize"
    if (moving) return "move"
    if (isDragging) return "grabbing"

    switch (activeTool) {
      case "select":
        return "default"
      case "hand":
        return "grab"
      case "rectangle":
        return "crosshair"
      case "ellipse":
        return "crosshair"
      case "text":
        return "text"
      case "pen":
        return "crosshair"
      case "pencil":
        return "crosshair"
      case "polygon":
        return "crosshair"
      default:
        return "default"
    }
  }

  // Don't render until we have proper dimensions
  if (!isReady) {
    return <div ref={containerRef} className="canvas-container relative flex-1 overflow-hidden bg-gray-100" />
  }

  return (
    <div ref={containerRef} className="canvas-container relative flex-1 overflow-hidden bg-gray-100">
      <div
        className="absolute inset-0 flex items-center justify-center overflow-auto"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: getCursorStyle() }}
        />
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md bg-white p-1 shadow-md">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="flex w-32 items-center">
          <Slider
            value={[zoom * 100]}
            min={10}
            max={300}
            step={1}
            onValueChange={handleSliderChange}
            className="mx-2"
          />
        </div>
        <div className="min-w-12 text-center text-sm">{Math.round((zoom || 1) * 100)}%</div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute left-4 top-4 flex flex-col gap-1 rounded-md bg-white p-1 shadow-md">
        <Button
          variant={activeTool === "select" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setActiveTool("select")}
          title="Select Tool (V)"
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "rectangle" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setActiveTool("rectangle")}
          title="Rectangle Tool (R)"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "ellipse" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setActiveTool("ellipse")}
          title="Ellipse Tool (E)"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "text" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setActiveTool("text")}
          title="Text Tool (T)"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "pen" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setActiveTool("pen")}
          title="Pen Tool (P)"
        >
          <Pen className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "pencil" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setActiveTool("pencil")}
          title="Pencil Tool (B)"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

