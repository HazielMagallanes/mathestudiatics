import { useTranslation } from 'react-i18next'

import { buttonGhost, buttonSecondary } from '@/shared/ui/buttons'
import { cn } from '@/shared/ui/cn'

export type GridStyle = 'dots' | 'lines' | 'none'

interface WhiteboardToolbarProps {
  grid: GridStyle
  showAxes: boolean
  canUndo: boolean
  canRedo: boolean
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

/** View controls for the board: the board itself displays typed input. */
export function WhiteboardToolbar({
  grid,
  showAxes,
  canUndo,
  canRedo,
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
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
