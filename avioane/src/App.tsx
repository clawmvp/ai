import { useState, useCallback, useEffect, useRef } from 'react'
import {
  getInitialState,
  tryPlacePlane,
  playerShoot,
  applyRobotShot,
  getRotations,
  getPlaneCells,
  canPlacePlane,
} from './game'
import type { GameState, RobotLevel, PlanesCount, GameMode } from './types'
import { PLANES_COUNT_OPTIONS } from './types'
import type { Plane } from './types'
import Grid from './Grid'
import PlaneIcon from './PlaneIcon'
import { usePhantom } from './usePhantom'
import './App.css'

const ROBOT_SHOT_DELAY_MS = 800

const ROBOT_LEVELS: { value: RobotLevel; label: string }[] = [
  { value: 'beginner', label: 'Începător' },
  { value: 'medium', label: 'Mediu' },
  { value: 'advanced', label: 'Avansat' },
]

const GAME_MODES: { value: GameMode; label: string }[] = [
  { value: 'robot', label: 'Contra robot' },
  { value: 'multiplayer', label: 'Multiplayer (același dispozitiv)' },
]

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [planesCount, setPlanesCount] = useState<PlanesCount>(3)
  const [gameMode, setGameMode] = useState<GameMode>('robot')
  const [robotLevel, setRobotLevel] = useState<RobotLevel>('beginner')
  const [rotationIndex, setRotationIndex] = useState(0)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const robotScheduled = useRef(false)
  const phantom = usePhantom()

  const state = gameState
  const setState = useCallback((updater: GameState | ((prev: GameState | null) => GameState | null)) => {
    setGameState(updater as (prev: GameState | null) => GameState | null)
  }, [])

  const handleStart = useCallback(() => {
    setGameState(getInitialState(robotLevel, planesCount, gameMode))
  }, [robotLevel, planesCount, gameMode])

  const rotation = getRotations()[rotationIndex]
  const previewCells =
    state &&
    (state.phase === 'placing' || state.phase === 'placing-p2') &&
    hoveredCell != null &&
    canPlacePlane(state.myGrid, { row: hoveredCell.row, col: hoveredCell.col, rotation, id: 0 } as Plane)
      ? getPlaneCells({ row: hoveredCell.row, col: hoveredCell.col, rotation, id: 0 } as Plane)
      : null

  const handlePlaceCell = useCallback(
    (row: number, col: number) => {
      if (!state) return
      const next = tryPlacePlane(state, row, col, rotation)
      if (next) setState(next)
    },
    [state, rotation, setState]
  )

  const handleRotate = useCallback(() => {
    setRotationIndex((i) => (i + 1) % 4)
  }, [])

  const handleShoot = useCallback((row: number, col: number) => {
    setState((s) => {
      if (!s) return s
      const next = playerShoot(s, row, col)
      return next ?? s
    })
  }, [setState])

  useEffect(() => {
    if (!state || state.gameMode !== 'robot' || state.phase !== 'playing' || state.currentTurn !== 'robot' || state.winner) {
      robotScheduled.current = false
      return
    }
    if (robotScheduled.current) return
    robotScheduled.current = true
    const t = setTimeout(() => {
      setState((s) => {
        if (!s) return s
        const next = applyRobotShot(s)
        robotScheduled.current = false
        return next ?? s
      })
    }, ROBOT_SHOT_DELAY_MS)
    return () => clearTimeout(t)
  }, [state?.phase, state?.currentTurn, state?.winner, state?.myGrid, setState])

  if (!state) {
    return (
      <div className="app landing-page">
        <header className="landing-hero">
          <h1 className="landing-title">Doboară flota inamică în câteva minute</h1>
          <p className="landing-tagline">
            Jocul de strategie pe grilă: plasezi avioanele, tragi pe cea ascunsă. Lovești cockpitul — avionul cade. Lovești corpul — mai tragi o dată.
          </p>
        </header>

        <section className="landing-wallet">
          {phantom.connected ? (
            <div className="wallet-connected">
              <span className="wallet-address" title={phantom.publicKey ?? ''}>
                {phantom.publicKey ? `${phantom.publicKey.slice(0, 4)}…${phantom.publicKey.slice(-4)}` : ''}
              </span>
              <button type="button" className="btn-wallet" onClick={phantom.disconnect}>
                Deconectare
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-wallet btn-wallet-connect"
              onClick={phantom.connect}
              disabled={phantom.isConnecting || !phantom.hasPhantom}
              title={!phantom.hasPhantom ? 'Instalează Phantom wallet' : ''}
            >
              {phantom.isConnecting ? 'Se conectează…' : phantom.hasPhantom ? 'Conectează Phantom' : 'Phantom nu e instalat'}
            </button>
          )}
          {phantom.error && <p className="wallet-error">{phantom.error}</p>}
        </section>

        <section className="landing-visual">
          <div className="landing-images">
            <img
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80"
              alt="Avion în zbor"
              className="landing-img landing-img-1"
            />
            <img
              src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80"
              alt="Strategie pe hartă"
              className="landing-img landing-img-2"
            />
            <img
              src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&q=80"
              alt="Cer și nori"
              className="landing-img landing-img-3"
            />
          </div>
        </section>

        <section className="landing-desc-block">
          <h2>Cum se joacă</h2>
          <p className="landing-desc">
            Fiecare avion ocupă cinci celule în formă de T: un cockpit și patru celule de corp. Plasezi flota pe grila ta, apoi trăiești pe cea a inamicului. Nu vezi unde sunt avioanele — doar rezultatul loviturilor.
          </p>
          <p className="landing-desc">
            Plasare: click pe grilă, rotește avionul cu imaginea de deasupra, pune următorul. Joc: tragi pe grila din dreapta. Ratat — trece rândul. Lovit la cockpit — avion doborât. Lovit la corp — mai tragi o dată. Câștigi doborând toate avioanele adverse.
          </p>
        </section>

        <section className="landing-options-wrap">
          <h2 className="landing-options-title">Pregătește partida</h2>
        <div className="landing-options">
          <div className="option-group">
            <span className="option-label">Mod joc</span>
            <div className="option-btns">
              {GAME_MODES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`btn-option ${gameMode === value ? 'active' : ''}`}
                  onClick={() => setGameMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="option-group">
            <span className="option-label">Număr avioane</span>
            <div className="option-btns">
              {PLANES_COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`btn-option ${planesCount === n ? 'active' : ''}`}
                  onClick={() => setPlanesCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {gameMode === 'robot' && (
            <div className="option-group">
              <span className="option-label">Nivel robot</span>
              <div className="option-btns">
                {ROBOT_LEVELS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`btn-option ${robotLevel === value ? 'active' : ''}`}
                    onClick={() => setRobotLevel(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </section>
        <button type="button" className="btn-start" onClick={handleStart}>
          Începe partida
        </button>
      </div>
    )
  }

  if (state.phase === 'gameover' && state.winner) {
    const gameOverMessage = state.gameMode === 'multiplayer'
      ? (state.winner === 'player' ? 'Jucător 1 a câștigat!' : 'Jucător 2 a câștigat!')
      : (state.winner === 'player' ? 'Ai câștigat!' : 'Robotul a câștigat!')
    return (
      <div className="app">
        <h1>Avioane</h1>
        <div className="gameover">
          <p>{gameOverMessage}</p>
          <button type="button" className="btn-primary" onClick={() => setState(getInitialState(state.robotLevel, state.planesCount, state.gameMode))}>
            Partidă nouă
          </button>
        </div>
      </div>
    )
  }

  if (state.phase === 'placing' || state.phase === 'placing-p2') {
    return (
      <div className="app">
        <h1>Avioane</h1>
        <p className="message">{state.message}</p>
        {state.gameMode === 'multiplayer' && state.phase === 'placing-p2' && (
          <p className="message message-multiplayer">Jucător 2: plasează avioanele (același dispozitiv).</p>
        )}
        <div className="rotation-picker-wrap">
          <span className="rotation-label">Rotație: click pe avion</span>
          <button
            type="button"
            className="rotation-picker-btn"
            onClick={handleRotate}
            title={`Rotație ${rotation}°. Click pentru a schimba.`}
            aria-label={`Rotație ${rotation}°. Click pentru a schimba.`}
          >
            <PlaneIcon size="picker" rotation={rotation} className="rotation-picker-plane" />
          </button>
        </div>
        <div className="placement-legend">
          <span className="legend-cap" title="Cap (vârful avionului)">Cap</span> = 1 buc. &nbsp;
          <span className="legend-body">Corp</span> = 4 buc. Mută mouse-ul pe grilă pentru preview.
        </div>
        <Grid
          grid={state.myGrid}
          mode="mine"
          onCellClick={handlePlaceCell}
          onCellHover={(r, c) => setHoveredCell({ row: r, col: c })}
          onCellLeave={() => setHoveredCell(null)}
          previewCells={previewCells}
          planes={state.myPlanes}
          previewPlane={hoveredCell && previewCells ? { row: hoveredCell.row, col: hoveredCell.col, rotation } : null}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Avioane</h1>
      <p className="message">{state.message}</p>
      {state.gameMode === 'robot' && (
        <p className="robot-level-info">Robot: {ROBOT_LEVELS.find((l) => l.value === state.robotLevel)?.label ?? state.robotLevel}</p>
      )}
      {state.gameMode === 'multiplayer' && (
        <p className="robot-level-info">Jucător {state.currentPlayer}: trage pe grila din dreapta. Dacă e rândul adversarului, dă dispozitivul.</p>
      )}
      <div className="boards-row">
        <div className="board-section">
          <h2 className="board-title">Flota ta</h2>
          <Grid
            grid={state.myGrid}
            mode="mine"
            disabled={state.gameMode === 'robot' ? state.currentTurn === 'robot' : false}
            highlightLast={state.gameMode === 'robot' && state.currentTurn === 'robot' ? state.lastShot : null}
            planes={state.myPlanes}
          />
        </div>
        <div className="board-section">
          <h2 className="board-title">Inamic (trăgești aici)</h2>
          <Grid
            grid={state.enemyGrid}
            mode="enemy"
            onCellClick={handleShoot}
            disabled={state.gameMode === 'robot' ? state.currentTurn !== 'player' : false}
            highlightLast={state.currentTurn === 'player' ? state.lastShot : null}
          />
        </div>
      </div>
    </div>
  )
}
