import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useTranslation } from 'react-i18next'

import {
  addObject,
  createMath,
  createText,
  duplicateObject,
  emptyBoard,
  findObject,
  moveObject,
  removeObject,
  translateObject,
  updateObject,
} from '@/features/whiteboard/model/board'
import { hitTest, objectBounds } from '@/features/whiteboard/model/geometry'
import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  redo,
  undo,
  type BoardHistory,
} from '@/features/whiteboard/model/history'
import {
  keyboardEntries,
  keyboardEntryPosition,
  nextEntryIndex,
  relayoutKeyboardEntries,
} from '@/features/whiteboard/model/layout'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  type Board,
  type BoardObject,
  type Point,
} from '@/features/whiteboard/model/types'
import { clearSavedBoard, loadBoard, saveBoard } from '@/features/whiteboard/storage'
import { plainToLatex } from '@/shared/math/plain-to-latex'
import { cn } from '@/shared/ui/cn'

import { ObjectView } from './BoardObjectView'
import { MathNotepad, NOTEPAD_NEW_LINE_ID, type MathNotepadHandle } from './MathNotepad'
import { TextScratchpad } from './TextScratchpad'
import { WhiteboardToolbar, type GridStyle } from './WhiteboardToolbar'

const MIN_VIEW_WIDTH = 240
const MAX_VIEW_WIDTH = BOARD_WIDTH * 2

interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

type Interaction =
  | { kind: 'move'; origin: BoardObject; start: Point }
  | { kind: 'pan'; startClient: Point; startView: { x: number; y: number } }
  | null

const INITIAL_VIEW: ViewBox = { x: 0, y: 0, width: BOARD_WIDTH, height: BOARD_HEIGHT }

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * The board is a display surface for typed input: the notepad creates math
 * lines (and the text box adds annotations). Objects can be selected, moved,
 * duplicated and deleted; the view can be panned and zoomed.
 */
export function Whiteboard({ className }: { className?: string }) {
  const { t } = useTranslation()

  const [history, setHistory] = useState<BoardHistory>(() => createHistory(emptyBoard()))
  const [grid, setGrid] = useState<GridStyle>('dots')
  const [showAxes, setShowAxes] = useState(false)
  const [view, setView] = useState<ViewBox>(INITIAL_VIEW)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [preview, setPreview] = useState<Board | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [text, setText] = useState('')

  const svgRef = useRef<SVGSVGElement | null>(null)
  const interaction = useRef<Interaction>(null)
  const spacePressed = useRef(false)
  const viewRef = useRef(view)
  const boardRef = useRef<Board>(history.present)
  const notepadRef = useRef<MathNotepadHandle | null>(null)

  const board = history.present
  const displayBoard = preview ?? board
  const notepadEntries = keyboardEntries(board)

  useEffect(() => {
    boardRef.current = board
  }, [board])

  useEffect(() => {
    viewRef.current = view
  }, [view])

  useEffect(() => {
    let active = true

    void loadBoard().then((stored) => {
      if (active) {
        if (stored) {
          setHistory(createHistory(stored))
        }

        setLoaded(true)
      }
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!loaded) {
      return
    }

    const timeout = window.setTimeout(() => {
      void saveBoard(board)
    }, 300)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [board, loaded])

  // Never lose work when leaving the page, switching tabs or closing the app.
  useEffect(() => {
    const flush = (): void => {
      void saveBoard(boardRef.current)
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        flush()
      }
    }

    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      flush()
    }
  }, [])

  const commitBoard = useCallback((next: Board) => {
    setHistory((current) => commit(current, next))
  }, [])

  const clientToBoard = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current
    const currentView = viewRef.current

    if (!svg) {
      return { x: 0, y: 0 }
    }

    const rect = svg.getBoundingClientRect()

    if (rect.width === 0 || rect.height === 0) {
      return { x: currentView.x, y: currentView.y }
    }

    return {
      x: currentView.x + ((clientX - rect.left) / rect.width) * currentView.width,
      y: currentView.y + ((clientY - rect.top) / rect.height) * currentView.height,
    }
  }, [])

  const boardTolerance = useCallback((): number => {
    const svg = svgRef.current

    if (!svg) {
      return 10
    }

    const rect = svg.getBoundingClientRect()

    return rect.width > 0 ? (viewRef.current.width / rect.width) * 10 : 10
  }, [])

  const zoomBy = useCallback((factor: number) => {
    setView((current) => {
      const width = Math.min(MAX_VIEW_WIDTH, Math.max(MIN_VIEW_WIDTH, current.width * factor))
      const height = width * (BOARD_HEIGHT / BOARD_WIDTH)
      const centerX = current.x + current.width / 2
      const centerY = current.y + current.height / 2

      return { x: centerX - width / 2, y: centerY - height / 2, width, height }
    })
  }, [])

  const resetView = useCallback(() => {
    setView(INITIAL_VIEW)
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point = clientToBoard(event.clientX, event.clientY)

    if (event.button === 1 || spacePressed.current) {
      event.currentTarget.setPointerCapture(event.pointerId)
      interaction.current = {
        kind: 'pan',
        startClient: { x: event.clientX, y: event.clientY },
        startView: { x: viewRef.current.x, y: viewRef.current.y },
      }
      return
    }

    if (event.button !== 0) {
      return
    }

    const tolerance = boardTolerance()
    const hit = [...board.objects].reverse().find((object) => hitTest(object, point, tolerance))

    if (hit) {
      event.currentTarget.setPointerCapture(event.pointerId)
      setSelectedId(hit.id)
      interaction.current = { kind: 'move', origin: hit, start: point }
      return
    }

    setSelectedId(null)
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const active = interaction.current

    if (!active) {
      return
    }

    if (active.kind === 'pan') {
      const svg = svgRef.current

      if (!svg) {
        return
      }

      const rect = svg.getBoundingClientRect()
      const scaleX = rect.width > 0 ? viewRef.current.width / rect.width : 1
      const scaleY = rect.height > 0 ? viewRef.current.height / rect.height : 1

      setView((current) => ({
        ...current,
        x: active.startView.x - (event.clientX - active.startClient.x) * scaleX,
        y: active.startView.y - (event.clientY - active.startClient.y) * scaleY,
      }))
      return
    }

    const point = clientToBoard(event.clientX, event.clientY)
    const dx = point.x - active.start.x
    const dy = point.y - active.start.y

    setPreview(updateObject(board, active.origin.id, (object) => translateObject(object, dx, dy)))
  }

  const handlePointerUp = () => {
    const active = interaction.current
    interaction.current = null

    if (!active) {
      return
    }

    if (active.kind === 'move' && preview) {
      const movedObject = findObject(preview, active.origin.id)
      // A dragged keyboard entry keeps its new position.
      const next =
        movedObject?.kind === 'math' && movedObject.entryIndex !== undefined
          ? updateObject(preview, movedObject.id, (object) =>
              object.kind === 'math' ? { ...object, positionMode: 'free' as const } : object,
            )
          : preview

      commitBoard(next)
    }

    setPreview(null)
  }

  const handleDoubleClick = (event: React.MouseEvent<SVGSVGElement>): void => {
    const point = clientToBoard(event.clientX, event.clientY)
    const tolerance = boardTolerance()
    const hit = [...board.objects].reverse().find((object) => hitTest(object, point, tolerance))

    if (hit?.kind === 'math' && hit.entryIndex !== undefined) {
      notepadRef.current?.focusEntry(hit.id)
    }
  }

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return
      }

      event.preventDefault()
      zoomBy(event.deltaY > 0 ? 1.1 : 0.9)
    },
    [zoomBy],
  )

  useEffect(() => {
    const svg = svgRef.current

    if (!svg) {
      return
    }

    svg.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      svg.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target

      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      const key = event.key.toLowerCase()
      const modifier = event.ctrlKey || event.metaKey

      if (event.code === 'Space') {
        spacePressed.current = true
        return
      }

      if (modifier && key === 'z') {
        event.preventDefault()
        setHistory((current) => (event.shiftKey ? redo(current) : undo(current)))
        return
      }

      if (modifier && key === 'y') {
        event.preventDefault()
        setHistory(redo)
        return
      }

      if (modifier && key === 'd' && selectedId) {
        event.preventDefault()
        commitBoard(duplicateObject(board, selectedId))
        return
      }

      if ((key === 'delete' || key === 'backspace') && selectedId) {
        event.preventDefault()
        commitBoard(removeObject(board, selectedId))
        setSelectedId(null)
        return
      }

      if (key.startsWith('arrow') && selectedId) {
        event.preventDefault()
        const step = event.shiftKey ? 20 : 4
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0

        commitBoard(moveObject(board, selectedId, dx, dy))
        return
      }

      if (key === '+' || key === '=') {
        zoomBy(0.85)
        return
      }

      if (key === '-' || key === '_') {
        zoomBy(1.18)
        return
      }

      if (key === '0') {
        resetView()
        return
      }

      if (key === 'n') {
        document.getElementById(NOTEPAD_NEW_LINE_ID)?.focus()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        spacePressed.current = false
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [board, commitBoard, resetView, selectedId, zoomBy])

  const centerOfView = useCallback((): Point => {
    const current = viewRef.current

    return { x: current.x + current.width / 2, y: current.y + current.height / 2 }
  }, [])

  const addTextToBoard = () => {
    const value = text.trim()

    if (value.length === 0) {
      return
    }

    commitBoard(addObject(board, createText(centerOfView(), value, { color: '#1e2a44' })))
    setText('')
  }

  const handleNotepadCommit = (entryId: string | null, source: string): void => {
    const latex = plainToLatex(source)

    if (latex.length === 0) {
      return
    }

    if (entryId) {
      commitBoard(
        updateObject(board, entryId, (object) =>
          object.kind === 'math' ? { ...object, source, latex } : object,
        ),
      )
      return
    }

    const index = nextEntryIndex(board)
    const entry = createMath(keyboardEntryPosition(index), latex, {
      source,
      entryIndex: index,
      positionMode: 'auto',
    })

    commitBoard(relayoutKeyboardEntries(addObject(board, entry)))
  }

  const handleNotepadRemove = (entryId: string): void => {
    commitBoard(relayoutKeyboardEntries(removeObject(board, entryId)))
    setSelectedId((current) => (current === entryId ? null : current))
  }

  const exportSvg = () => {
    const svg = svgRef.current

    if (!svg) {
      return
    }

    const clone = svg.cloneNode(true) as SVGSVGElement

    clone.setAttribute('width', String(Math.round(view.width)))
    clone.setAttribute('height', String(Math.round(view.height)))
    clone.setAttribute(
      'viewBox',
      `${String(view.x)} ${String(view.y)} ${String(view.width)} ${String(view.height)}`,
    )

    const source = new XMLSerializer().serializeToString(clone)

    downloadBlob(
      'mathestudiatics-board.svg',
      new Blob([source], { type: 'image/svg+xml;charset=utf-8' }),
    )
  }

  const exportPng = () => {
    const svg = svgRef.current

    if (!svg) {
      return
    }

    const clone = svg.cloneNode(true) as SVGSVGElement

    clone.setAttribute('width', String(Math.round(view.width)))
    clone.setAttribute('height', String(Math.round(view.height)))

    const source = new XMLSerializer().serializeToString(clone)
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')

      canvas.width = Math.round(view.width * 2)
      canvas.height = Math.round(view.height * 2)

      const context = canvas.getContext('2d')

      if (context) {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
      }

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob('mathestudiatics-board.png', blob)
        } else {
          exportSvg()
          setStatus(t('whiteboard.exportFallback'))
        }
      }, 'image/png')
      URL.revokeObjectURL(url)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      exportSvg()
      setStatus(t('whiteboard.exportFallback'))
    }

    image.src = url
  }

  const handleClear = () => {
    commitBoard(emptyBoard())
    setSelectedId(null)
    void clearSavedBoard()
  }

  const selectedObject = selectedId ? findObject(displayBoard, selectedId) : undefined
  const gridPattern = useMemo(
    () =>
      grid === 'dots'
        ? 'url(#whiteboard-dots)'
        : grid === 'lines'
          ? 'url(#whiteboard-lines)'
          : 'none',
    [grid],
  )

  return (
    <div className={cn('space-y-3', className)}>
      <WhiteboardToolbar
        grid={grid}
        showAxes={showAxes}
        canUndo={canUndo(history)}
        canRedo={canRedo(history)}
        onGridChange={setGrid}
        onToggleAxes={() => {
          setShowAxes((current) => !current)
        }}
        onUndo={() => {
          setHistory(undo)
        }}
        onRedo={() => {
          setHistory(redo)
        }}
        onClear={handleClear}
        onZoomIn={() => {
          zoomBy(0.85)
        }}
        onZoomOut={() => {
          zoomBy(1.18)
        }}
        onZoomReset={resetView}
        onExportSvg={exportSvg}
        onExportPng={exportPng}
      />

      <MathNotepad
        ref={notepadRef}
        entries={notepadEntries}
        onCommit={handleNotepadCommit}
        onRemove={handleNotepadRemove}
      />

      <TextScratchpad text={text} onTextChange={setText} onAddText={addTextToBoard} />

      <p className="text-xs text-fg-muted">{t('whiteboard.instructions')}</p>

      <svg
        ref={svgRef}
        role="application"
        aria-label={t('whiteboard.boardLabel')}
        tabIndex={0}
        viewBox={`${String(view.x)} ${String(view.y)} ${String(view.width)} ${String(view.height)}`}
        className="border-rule bg-surface-raised h-[480px] w-full cursor-default touch-none rounded-lg border select-none sm:h-[560px]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(event) => {
          event.preventDefault()
        }}
      >
        <defs>
          <pattern id="whiteboard-dots" patternUnits="userSpaceOnUse" width="24" height="24">
            <circle cx="2" cy="2" r="1.2" className="fill-rule" />
          </pattern>
          <pattern id="whiteboard-lines" patternUnits="userSpaceOnUse" width="24" height="24">
            <path d="M 24 0 L 0 0 0 24" fill="none" className="stroke-rule" strokeWidth="1" />
          </pattern>
        </defs>

        {grid !== 'none' ? (
          <rect
            x={view.x}
            y={view.y}
            width={view.width}
            height={view.height}
            fill={gridPattern}
            aria-hidden="true"
          />
        ) : null}

        {showAxes ? (
          <g aria-hidden="true">
            <line
              x1={view.x}
              y1={0}
              x2={view.x + view.width}
              y2={0}
              className="stroke-rule"
              strokeWidth="1.5"
            />
            <line
              x1={0}
              y1={view.y}
              x2={0}
              y2={view.y + view.height}
              className="stroke-rule"
              strokeWidth="1.5"
            />
            <text x={12} y={-8} className="fill-fg-muted font-sans text-xs">
              x
            </text>
            <text x={8} y={16} className="fill-fg-muted font-sans text-xs">
              y
            </text>
          </g>
        ) : null}

        {displayBoard.objects.map((object) => (
          <ObjectView key={object.id} object={object} />
        ))}

        {selectedObject ? (
          <rect
            data-selection="true"
            x={objectBounds(selectedObject).x}
            y={objectBounds(selectedObject).y}
            width={objectBounds(selectedObject).width}
            height={objectBounds(selectedObject).height}
            fill="none"
            className="stroke-accent"
            strokeDasharray="6 4"
            strokeWidth="1.5"
            aria-hidden="true"
          />
        ) : null}
      </svg>

      {selectedObject ? (
        <p className="text-xs text-fg-muted">{t('whiteboard.selectedHint')}</p>
      ) : null}
      {status ? (
        <p role="status" className="text-xs text-accent">
          {status}
        </p>
      ) : null}
    </div>
  )
}
