import type { GameState, Move } from './types'
import { getMoves } from './game'
import './Board.css'

interface BoardProps {
  state: GameState
  selectedFrom: number | 'bar' | null
  onSelectSource: (from: number | 'bar') => void
  onMove: (move: Move) => void
}

const TOP_INDICES = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const BOTTOM_INDICES = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

export default function Board({ state, selectedFrom, onSelectSource, onMove }: BoardProps) {
  const { board, currentPlayer } = state
  const legalMoves = getMoves(state)
  const isBarSource = legalMoves.some((m) => m.from === 'bar')
  const sourcePoints = new Set(legalMoves.map((m) => (m.from === 'bar' ? 'bar' : m.from)))
  const targetPoints = new Set(
    selectedFrom !== null ? legalMoves.filter((m) => m.from === selectedFrom).map((m) => m.to) : []
  )
  const targetOff = selectedFrom !== null && legalMoves.some((m) => m.from === selectedFrom && m.to === 'off')

  function handlePointClick(index: number) {
    if (state.phase !== 'move') return
    const v = board.points[index]
    const hasWhite = v > 0
    const hasBlack = v < 0
    const isOurs = currentPlayer === 'white' ? hasWhite : hasBlack

    if (selectedFrom === null) {
      if (isOurs && sourcePoints.has(index)) onSelectSource(index)
      return
    }
    if (selectedFrom === 'bar') {
      const move = legalMoves.find((m) => m.from === 'bar' && m.to === index)
      if (move) onMove(move)
      return
    }
    const move = legalMoves.find((m) => m.from === selectedFrom && m.to === index)
    if (move) onMove(move)
  }

  function handleBarClick() {
    if (state.phase !== 'move' || selectedFrom !== null) return
    if (isBarSource) onSelectSource('bar')
  }

  function handleBearOffClick() {
    if (state.phase !== 'move' || selectedFrom === null) return
    const move = legalMoves.find((m) => m.from === selectedFrom && m.to === 'off')
    if (move) onMove(move)
  }

  function renderPoint(index: number, isTop: boolean) {
    const v = board.points[index]
    const count = Math.abs(v)
    const isWhite = v > 0
    const isBlack = v < 0
    const selected = selectedFrom === index
    const isTarget = typeof selectedFrom === 'number' && targetPoints.has(index)
    const isTargetOff = selectedFrom === index && targetOff

    return (
      <div
        key={index}
        role="button"
        tabIndex={0}
        className={`point ${isTop ? 'point-top' : ''} ${selected ? 'selected' : ''} ${isTarget ? 'legal-target' : ''}`}
        onClick={() => handlePointClick(index)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handlePointClick(index)}
        aria-label={`Punct ${index + 1}, ${count} piese`}
      >
        <div className="point-bg" aria-hidden />
        <div className="point-content">
          {count > 0 && (
            <div className="piece-stack">
              {Array.from({ length: Math.min(count, 5) }, (_, i) => (
                <div key={i} className={`piece ${isWhite ? 'white' : 'black'}`} />
              ))}
              {count > 5 && <span style={{ fontSize: '0.7rem', color: 'inherit' }}>×{count}</span>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="board-wrap">
      <div className="board">
        {TOP_INDICES.map((i) => renderPoint(i, true))}
        <div className="bar-area">
          <div className="bar-pieces" onClick={handleBarClick} role="button" tabIndex={0} aria-label="Bar alb">
            {board.barWhite > 0 && (
              <>
                {Array.from({ length: Math.min(board.barWhite, 5) }, (_, i) => (
                  <div key={`w${i}`} className="piece white" />
                ))}
                {board.barWhite > 5 && <span style={{ fontSize: '0.7rem' }}>×{board.barWhite}</span>}
              </>
            )}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Bar</div>
          <div className="bar-pieces" onClick={handleBarClick} role="button" tabIndex={0} aria-label="Bar negru">
            {board.barBlack > 0 && (
              <>
                {Array.from({ length: Math.min(board.barBlack, 5) }, (_, i) => (
                  <div key={`b${i}`} className="piece black" />
                ))}
                {board.barBlack > 5 && <span style={{ fontSize: '0.7rem' }}>×{board.barBlack}</span>}
              </>
            )}
          </div>
        </div>
        {BOTTOM_INDICES.map((i) => renderPoint(i, false))}
        <div className="bar-area bear-off-row">
          <div className="bear-off" aria-label="Scos alb">
            {board.borneOffWhite > 0 && (
              <>
                {Array.from({ length: Math.min(board.borneOffWhite, 15) }, (_, i) => (
                  <div key={i} className="piece white" />
                ))}
                {board.borneOffWhite > 15 && <span>×{board.borneOffWhite}</span>}
              </>
            )}
          </div>
          <div className="bear-off" aria-label="Scos negru">
            {board.borneOffBlack > 0 && (
              <>
                {Array.from({ length: Math.min(board.borneOffBlack, 15) }, (_, i) => (
                  <div key={i} className="piece black" />
                ))}
                {board.borneOffBlack > 15 && <span>×{board.borneOffBlack}</span>}
              </>
            )}
          </div>
        </div>
        {targetOff && selectedFrom !== null && (
          <button
            type="button"
            className="roll-btn bear-off-btn"
            onClick={handleBearOffClick}
          >
            Scoate piesa
          </button>
        )}
      </div>
    </div>
  )
}
