/**
 * Aceeași imagine de avion (formă T) folosită la selectorul de rotație și pe grilă.
 */
import './PlaneIcon.css'

interface PlaneIconProps {
  className?: string
  /** Dimensiune: 'picker' (la rotație), 'cell' (icon în celulă), 'grid' (întreg pe 3x3) */
  size?: 'picker' | 'cell' | 'grid'
  /** Rotație în grade: 0, 90, 180, 270 */
  rotation?: number
}

/* Forma inițială a avionului (T: romb + bară orizontală + bară verticală) */
const PLANE_SVG_VIEWBOX = '0 0 30 30'
const PLANE_HEAD_PATH = 'M15 2 L20 8 L15 14 L10 8 Z'
const PLANE_BODY_RECT_H = { x: 5, y: 14, width: 20, height: 4, rx: 1 }
const PLANE_BODY_RECT_V = { x: 13, y: 18, width: 4, height: 10, rx: 1 }

export default function PlaneIcon({ className = '', size = 'cell', rotation = 0 }: PlaneIconProps) {
  return (
    <span
      className={`plane-icon-wrap plane-icon-wrap--${size} ${className}`.trim()}
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
    >
      <svg viewBox={PLANE_SVG_VIEWBOX} fill="none" className="plane-icon-svg">
        <path d={PLANE_HEAD_PATH} fill="currentColor" className="plane-icon-head" />
        <rect
          x={PLANE_BODY_RECT_H.x}
          y={PLANE_BODY_RECT_H.y}
          width={PLANE_BODY_RECT_H.width}
          height={PLANE_BODY_RECT_H.height}
          rx={PLANE_BODY_RECT_H.rx}
          fill="currentColor"
          opacity={0.85}
        />
        <rect
          x={PLANE_BODY_RECT_V.x}
          y={PLANE_BODY_RECT_V.y}
          width={PLANE_BODY_RECT_V.width}
          height={PLANE_BODY_RECT_V.height}
          rx={PLANE_BODY_RECT_V.rx}
          fill="currentColor"
          opacity={0.85}
        />
      </svg>
    </span>
  )
}
