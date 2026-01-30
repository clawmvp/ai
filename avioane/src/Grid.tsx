import type { MyCell, EnemyCell } from './types'
import type { Plane } from './types'
import { GRID_SIZE } from './types'
import PlaneIcon from './PlaneIcon'
import './Grid.css'

const COLS = 'ABCDEFGHIJ'.split('')

export interface PreviewCell {
  row: number
  col: number
  isHead: boolean
}

interface GridProps {
  grid: MyCell[][] | EnemyCell[][]
  mode: 'mine' | 'enemy'
  onCellClick?: (row: number, col: number) => void
  onCellHover?: (row: number, col: number) => void
  onCellLeave?: () => void
  disabled?: boolean
  highlightLast?: { row: number; col: number } | null
  /** În faza de plasare: celulele unde ar apărea avionul la hover */
  previewCells?: PreviewCell[] | null
  /** Avioanele plasate: desenăm un avion întreg (overlay) pe fiecare 3x3 */
  planes?: Plane[]
  /** Avion de preview la hover (plasare) */
  previewPlane?: { row: number; col: number; rotation: number } | null
}

function cellClass(cell: MyCell | EnemyCell, mode: string): string {
  if (mode === 'enemy') {
    switch (cell as EnemyCell) {
      case 'unknown': return 'cell-unknown'
      case 'miss': return 'cell-miss'
      case 'hit': return 'cell-hit'
      case 'down': return 'cell-down'
      default: return ''
    }
  }
  switch (cell as MyCell) {
    case 'empty': return 'cell-empty'
    case 'head': return 'cell-head'
    case 'body': return 'cell-body'
    case 'head-hit': return 'cell-head-hit'
    case 'body-hit': return 'cell-body-hit'
    case 'miss': return 'cell-miss'
    default: return ''
  }
}

function isPreviewCell(previewCells: PreviewCell[] | null | undefined, r: number, c: number): { isHead: boolean } | false {
  if (!previewCells) return false
  const p = previewCells.find((x) => x.row === r && x.col === c)
  return p ? { isHead: p.isHead } : false
}

/* Overlay: un avion întreg pe 3x3 celule (ca la rotație) */
function PlaneOverlay({ row, col, rotation, isPreview }: { row: number; col: number; rotation: number; isPreview?: boolean }) {
  return (
    <div
      className={`grid-plane-overlay ${isPreview ? 'grid-plane-overlay--preview' : ''}`}
      style={{ '--plane-row': row, '--plane-col': col } as React.CSSProperties}
      aria-hidden
    >
      <PlaneIcon size="grid" rotation={rotation} className="grid-plane-overlay-icon" />
    </div>
  )
}

/* Pentru preview (hover) sau când nu avem planes overlay, afișăm icon în celulă */
function PlaneCellIcon({ className }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label="Avion">
      <PlaneIcon size="cell" className="plane-cell-icon" />
    </span>
  )
}

export default function Grid({ grid, mode, onCellClick, onCellHover, onCellLeave, disabled, highlightLast, previewCells, planes, previewPlane }: GridProps) {
  const usePlaneOverlays = mode === 'mine' && (planes && planes.length > 0 || previewPlane)
  return (
    <div className={`grid-wrap ${mode} ${disabled ? 'disabled' : ''}`}>
      {usePlaneOverlays && (
        <div className="grid-plane-overlays" aria-hidden>
          {planes?.map((plane) => (
            <PlaneOverlay key={plane.id} row={plane.row} col={plane.col} rotation={plane.rotation} />
          ))}
          {previewPlane && (
            <PlaneOverlay row={previewPlane.row} col={previewPlane.col} rotation={previewPlane.rotation} isPreview />
          )}
        </div>
      )}
      <div className="grid-cols-label">
        {COLS.map((c) => (
          <span key={c} className="grid-label">{c}</span>
        ))}
      </div>
      <div className="grid-rows">
        {(grid as (MyCell | EnemyCell)[][]).map((row, r) => (
          <div key={r} className="grid-row">
            <span className="grid-label">{r + 1}</span>
            <div className="grid-cells">
              {row.map((cell, c) => {
                const preview = isPreviewCell(previewCells, r, c)
                const isPreview = !!preview
                return (
                  <button
                    key={c}
                    type="button"
                    className={`cell ${cellClass(cell, mode)} ${
                      highlightLast && highlightLast.row === r && highlightLast.col === c ? 'last-shot' : ''
                    } ${isPreview ? (preview!.isHead ? 'cell-preview-head' : 'cell-preview') : ''}`}
                    onClick={() => onCellClick?.(r, c)}
                    onMouseEnter={() => onCellHover?.(r, c)}
                    onMouseLeave={() => onCellLeave?.()}
                    disabled={disabled}
                    aria-label={`${COLS[c]}${r + 1}`}
                  >
                    {mode === 'enemy' && (cell as EnemyCell) === 'unknown' && !isPreview && '+'}
                    {mode === 'enemy' && (cell as EnemyCell) === 'miss' && '·'}
                    {mode === 'mine' && !usePlaneOverlays && ((cell as MyCell) === 'head' || (cell as MyCell) === 'body') && (
                      <PlaneCellIcon className="plane-symbol plane-head" />
                    )}
                    {mode === 'mine' && !usePlaneOverlays && isPreview && (
                      <PlaneCellIcon className="plane-symbol plane-preview-head" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
