import { useTranslation } from 'react-i18next'

import { TOOLS, TOOL_SHORTCUTS, type ToolId } from '@/features/whiteboard/model/types'
import { buttonGhost, buttonSecondary } from '@/shared/ui/buttons'
import { cn } from '@/shared/ui/cn'

const COLORS = ['#1e2a44', '#8a2f3b', '#1f6f43', '#8a5a00', '#4b4b4b', '#c05a67'] as const

export type GridStyle = 'dots' | 'lines' | 'none'

interface WhiteboardToolbarProps {
  tool: ToolId
  color: string
  strokeWidth: number
  grid: GridStyle
  showAxes: boolean
  canUndo: boolean
  canRedo: boolean
  onToolChange: (tool: ToolId) => void
  onColorChange: (color: string) => void
  onStrokeWidthChange: (width: number) => void
  onGridChange: (grid: GridStyle) => void
  onToggleAxes: () => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onExportSvg: () => void
  onExportPng: () => void
}

export function WhiteboardToolbar({
  tool,
  color,
  strokeWidth,
  grid,
  showAxes,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onGridChange,
  onToggleAxes,
  onUndo,
  onRedo,
  onClear,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExportSvg,
  onExportPng,
}: WhiteboardToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3 rounded-lg border border-rule bg-surface-raised p-3">
      <div
        role="toolbar"
        aria-label={t('whiteboard.toolsLabel')}
        className="flex flex-wrap gap-1.5"
      >
        {TOOLS.map((toolId) => (
          <button
            key={toolId}
            type="button"
            aria-pressed={tool === toolId}
            title={`${t(`whiteboard.tools.${toolId}`)} (${TOOL_SHORTCUTS[toolId]})`}
            onClick={() => {
              onToolChange(toolId)
            }}
            className={cn(
              'rounded-md border px-2 py-1 text-xs font-semibold transition-colors',
              tool === toolId
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-rule text-fg-muted hover:text-fg',
            )}
          >
            {t(`whiteboard.tools.${toolId}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <fieldset className="flex items-center gap-1.5">
          <legend className="sr-only">{t('whiteboard.color')}</legend>
          {COLORS.map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="whiteboard-color"
                checked={color === value}
                onChange={() => {
                  onColorChange(value)
                }}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'block size-5 rounded-full border',
                  color === value ? 'ring-accent ring-2 ring-offset-1' : 'border-rule',
                )}
                style={{ backgroundColor: value }}
              />
              <span className="sr-only">{value}</span>
            </label>
          ))}
        </fieldset>

        <label className="flex items-center gap-2">
          <span className="text-fg-muted">{t('whiteboard.strokeWidth')}</span>
          <input
            type="range"
            min={1}
            max={14}
            value={strokeWidth}
            onChange={(event) => {
              onStrokeWidthChange(Number(event.target.value))
            }}
            className="w-24"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-fg-muted">{t('whiteboard.grid')}</span>
          <select
            value={grid}
            onChange={(event) => {
              const value = event.target.value

              if (value === 'dots' || value === 'lines' || value === 'none') {
                onGridChange(value)
              }
            }}
            className="border-rule bg-surface rounded-md border px-1.5 py-1"
          >
            <option value="dots">{t('whiteboard.gridOptions.dots')}</option>
            <option value="lines">{t('whiteboard.gridOptions.lines')}</option>
            <option value="none">{t('whiteboard.gridOptions.none')}</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showAxes} onChange={onToggleAxes} />
          {t('whiteboard.axes')}
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={buttonSecondary} disabled={!canUndo} onClick={onUndo}>
          {t('whiteboard.undo')}
        </button>
        <button type="button" className={buttonSecondary} disabled={!canRedo} onClick={onRedo}>
          {t('whiteboard.redo')}
        </button>
        <button type="button" className={buttonGhost} onClick={onZoomOut}>
          {t('whiteboard.zoomOut')}
        </button>
        <button type="button" className={buttonGhost} onClick={onZoomIn}>
          {t('whiteboard.zoomIn')}
        </button>
        <button type="button" className={buttonGhost} onClick={onZoomReset}>
          {t('whiteboard.zoomReset')}
        </button>
        <button type="button" className={buttonSecondary} onClick={onExportSvg}>
          {t('whiteboard.exportSvg')}
        </button>
        <button type="button" className={buttonSecondary} onClick={onExportPng}>
          {t('whiteboard.exportPng')}
        </button>
        <button type="button" className={cn(buttonGhost, 'text-accent')} onClick={onClear}>
          {t('whiteboard.clear')}
        </button>
      </div>
    </div>
  )
}
