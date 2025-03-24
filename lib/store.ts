import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

// Define types
interface Element {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  rotation?: number
  text?: string
  points?: number[]
  radius?: number
  sides?: number
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  opacity?: number
  isLocked?: boolean
  isHidden?: boolean
}

interface Page {
  id: string
  name: string
}

interface DocumentState {
  pages: Page[]
  activePage: string
  elements: Element[]
  selectedElement: string | null
  clipboard: Element | null
}

interface CanvasState {
  zoom: number
  pan: { x: number; y: number }
  showGrid: boolean
  showRulers: boolean
}

interface ToolsState {
  activeTool: string
}

interface HistoryState {
  past: DocumentState[]
  future: DocumentState[]
}

interface EditorState {
  document: DocumentState
  canvas: CanvasState
  tools: ToolsState
  history: HistoryState

  // Document actions
  selectElement: (id: string | null) => void
  deselectElement: () => void
  addElement: (element: Element) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  deleteElement: (id: string) => void
  deleteSelectedElement: () => void
  copySelectedElement: () => void
  pasteElement: () => void
  addPage: (name?: string) => void
  setActivePage: (id: string) => void

  // Layer actions
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  lockElement: (id: string) => void
  unlockElement: (id: string) => void
  hideElement: (id: string) => void
  showElement: (id: string) => void

  // Alignment actions
  alignElements: (direction: string) => void
  distributeElements: (direction: string) => void

  // History actions
  undo: () => void
  redo: () => void

  // Store initialization
  initializeStore: (data: any) => void
  resetDocument: () => void
}

// Initial state
const initialDocumentState: DocumentState = {
  pages: [{ id: "page-1", name: "Page 1" }],
  activePage: "page-1",
  elements: [],
  selectedElement: null,
  clipboard: null,
}

const initialCanvasState: CanvasState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  showGrid: true,
  showRulers: true,
}

const initialToolsState: ToolsState = {
  activeTool: "select",
}

const initialHistoryState: HistoryState = {
  past: [],
  future: [],
}

// Create the store
export const useStore = create<EditorState>()(
  immer((set, get) => ({
    document: initialDocumentState,
    canvas: initialCanvasState,
    tools: initialToolsState,
    history: initialHistoryState,

    // Document actions
    selectElement: (id) => {
      const currentSelectedElement = get().document.selectedElement
      if (currentSelectedElement === id) return // No change needed

      set((state) => {
        state.document.selectedElement = id
      })
    },

    deselectElement: () => {
      const currentSelectedElement = get().document.selectedElement
      if (currentSelectedElement === null) return // No change needed

      set((state) => {
        state.document.selectedElement = null
      })
    },

    addElement: (element) => {
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.document)))
        state.history.future = []

        // Add the element
        state.document.elements.push(element)
        state.document.selectedElement = element.id
      })
    },

    updateElement: (id, updates) => {
      const elementIndex = get().document.elements.findIndex((el) => el.id === id)
      if (elementIndex === -1) return // Element not found

      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.document)))
        state.history.future = []

        // Update the element
        state.document.elements[elementIndex] = {
          ...state.document.elements[elementIndex],
          ...updates,
        }
      })
    },

    deleteElement: (id) => {
      const elements = get().document.elements
      const elementExists = elements.some((el) => el.id === id)
      if (!elementExists) return // Element not found

      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.document)))
        state.history.future = []

        // Remove the element
        state.document.elements = state.document.elements.filter((el) => el.id !== id)
        if (state.document.selectedElement === id) {
          state.document.selectedElement = null
        }
      })
    },

    deleteSelectedElement: () => {
      const { selectedElement } = get().document
      if (selectedElement) {
        get().deleteElement(selectedElement)
      }
    },

    copySelectedElement: () => {
      const { selectedElement, elements } = get().document
      if (selectedElement) {
        const element = elements.find((el) => el.id === selectedElement)
        if (element) {
          set((state) => {
            state.document.clipboard = JSON.parse(JSON.stringify(element))
          })
        }
      }
    },

    pasteElement: () => {
      const { clipboard } = get().document
      if (clipboard) {
        const newElement = {
          ...JSON.parse(JSON.stringify(clipboard)),
          id: `element-${Date.now()}`,
          x: clipboard.x + 20,
          y: clipboard.y + 20,
        }
        get().addElement(newElement)
      }
    },

    addPage: (name) => {
      set((state) => {
        const newPageId = `page-${state.document.pages.length + 1}`
        const pageName = name || `Page ${state.document.pages.length + 1}`
        state.document.pages.push({
          id: newPageId,
          name: pageName,
        })
        state.document.activePage = newPageId
      })
    },

    setActivePage: (id) => {
      const currentActivePage = get().document.activePage
      if (currentActivePage === id) return // No change needed

      set((state) => {
        state.document.activePage = id
      })
    },

    // Layer actions
    bringForward: (id) => {
      set((state) => {
        const elements = state.document.elements
        const index = elements.findIndex((el) => el.id === id)
        if (index !== -1 && index < elements.length - 1) {
          // Swap with the element above
          ;[elements[index], elements[index + 1]] = [elements[index + 1], elements[index]]
        }
      })
    },

    sendBackward: (id) => {
      set((state) => {
        const elements = state.document.elements
        const index = elements.findIndex((el) => el.id === id)
        if (index > 0) {
          // Swap with the element below
          ;[elements[index], elements[index - 1]] = [elements[index - 1], elements[index]]
        }
      })
    },

    bringToFront: (id) => {
      set((state) => {
        const elements = state.document.elements
        const index = elements.findIndex((el) => el.id === id)
        if (index !== -1 && index < elements.length - 1) {
          // Remove the element and add it to the end
          const element = elements.splice(index, 1)[0]
          elements.push(element)
        }
      })
    },

    sendToBack: (id) => {
      set((state) => {
        const elements = state.document.elements
        const index = elements.findIndex((el) => el.id === id)
        if (index > 0) {
          // Remove the element and add it to the beginning
          const element = elements.splice(index, 1)[0]
          elements.unshift(element)
        }
      })
    },

    lockElement: (id) => {
      set((state) => {
        const elementIndex = state.document.elements.findIndex((el) => el.id === id)
        if (elementIndex !== -1) {
          state.document.elements[elementIndex].isLocked = true
        }
      })
    },

    unlockElement: (id) => {
      set((state) => {
        const elementIndex = state.document.elements.findIndex((el) => el.id === id)
        if (elementIndex !== -1) {
          state.document.elements[elementIndex].isLocked = false
        }
      })
    },

    hideElement: (id) => {
      set((state) => {
        const elementIndex = state.document.elements.findIndex((el) => el.id === id)
        if (elementIndex !== -1) {
          state.document.elements[elementIndex].isHidden = true
        }
      })
    },

    showElement: (id) => {
      set((state) => {
        const elementIndex = state.document.elements.findIndex((el) => el.id === id)
        if (elementIndex !== -1) {
          state.document.elements[elementIndex].isHidden = false
        }
      })
    },

    // Alignment actions
    alignElements: (direction) => {
      const { elements, selectedElement } = get().document
      if (!selectedElement) return

      const selectedElementData = elements.find((el) => el.id === selectedElement)
      if (!selectedElementData) return

      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.document)))
        state.history.future = []

        // Align all selected elements
        state.document.elements.forEach((element) => {
          if (element.id === selectedElement) return

          switch (direction) {
            case "left":
              element.x = selectedElementData.x
              break
            case "center":
              element.x = selectedElementData.x + selectedElementData.width / 2 - element.width / 2
              break
            case "right":
              element.x = selectedElementData.x + selectedElementData.width - element.width
              break
            case "top":
              element.y = selectedElementData.y
              break
            case "middle":
              element.y = selectedElementData.y + selectedElementData.height / 2 - element.height / 2
              break
            case "bottom":
              element.y = selectedElementData.y + selectedElementData.height - element.height
              break
          }
        })
      })
    },

    distributeElements: (direction) => {
      const { elements, selectedElement } = get().document
      if (!selectedElement || elements.length < 3) return

      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.document)))
        state.history.future = []

        if (direction === "horizontal") {
          // Sort elements by x position
          const sortedElements = [...elements].sort((a, b) => a.x - b.x)
          const firstElement = sortedElements[0]
          const lastElement = sortedElements[sortedElements.length - 1]
          const totalSpace = lastElement.x + lastElement.width - firstElement.x
          const spacing = totalSpace / (sortedElements.length - 1)

          // Distribute elements horizontally
          sortedElements.forEach((element, index) => {
            if (index > 0 && index < sortedElements.length - 1) {
              const newX = firstElement.x + spacing * index
              const elementIndex = state.document.elements.findIndex((el) => el.id === element.id)
              if (elementIndex !== -1) {
                state.document.elements[elementIndex].x = newX
              }
            }
          })
        } else if (direction === "vertical") {
          // Sort elements by y position
          const sortedElements = [...elements].sort((a, b) => a.y - b.y)
          const firstElement = sortedElements[0]
          const lastElement = sortedElements[sortedElements.length - 1]
          const totalSpace = lastElement.y + lastElement.height - firstElement.y
          const spacing = totalSpace / (sortedElements.length - 1)

          // Distribute elements vertically
          sortedElements.forEach((element, index) => {
            if (index > 0 && index < sortedElements.length - 1) {
              const newY = firstElement.y + spacing * index
              const elementIndex = state.document.elements.findIndex((el) => el.id === element.id)
              if (elementIndex !== -1) {
                state.document.elements[elementIndex].y = newY
              }
            }
          })
        }
      })
    },

    // History actions
    undo: () => {
      const { past } = get().history
      if (past.length === 0) return // Nothing to undo

      set((state) => {
        const { past, future } = state.history

        // Move current state to future
        future.unshift(JSON.parse(JSON.stringify(state.document)))

        // Set state to last item in history
        state.document = past.pop()
      })
    },

    redo: () => {
      const { future } = get().history
      if (future.length === 0) return // Nothing to redo

      set((state) => {
        const { past, future } = state.history

        // Move current state to past
        past.push(JSON.parse(JSON.stringify(state.document)))

        // Set state to first item in future
        state.document = future.shift()
      })
    },

    // Store initialization
    initializeStore: (data) => {
      if (!data) {
        // Reset to defaults if no data
        set((state) => {
          state.document = initialDocumentState
          state.canvas = initialCanvasState
          state.tools = initialToolsState
          state.history = initialHistoryState
        })
        return
      }

      set((state) => {
        // Use provided data or defaults
        state.document = data.document || initialDocumentState
        state.canvas = data.canvas || initialCanvasState
        state.tools = data.tools || initialToolsState
        state.history = initialHistoryState // Always reset history
      })
    },

    resetDocument: () => {
      set((state) => {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.document)))
        state.history.future = []

        // Reset document
        state.document = initialDocumentState
      })
    },
  })),
)

