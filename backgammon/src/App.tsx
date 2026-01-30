import { useState, useCallback, useEffect, useRef } from 'react'
import {
  getInitialGameState,
  rollDice,
  applyMove,
  getMoves,
  mustRoll,
} from './game'
import type { GameState, Move } from './types'
import Board from './Board'
import Dice from './Dice'
import './App.css'

const ROBOT_DELAY_ROLL_MS = 1000
const ROBOT_DELAY_MOVE_MS = 800

function usePassTurnWhenNoMoves(state: GameState): GameState {
  if (state.phase !== 'move' || state.dice.length === 0) return state
  const moves = getMoves(state)
  if (moves.length > 0) return state
  const nextPlayer = state.currentPlayer === 'white' ? 'black' : 'white'
  return {
    ...state,
    currentPlayer: nextPlayer,
    dice: [],
    usedDice: [],
    phase: 'roll',
  }
}

export default function App() {
  const [state, setState] = useState<GameState>(getInitialGameState)
  const [selectedFrom, setSelectedFrom] = useState<number | 'bar' | null>(null)
  const [vsRobot, setVsRobot] = useState(false)
  const robotScheduled = useRef(false)

  const effectiveState = usePassTurnWhenNoMoves(state)

  useEffect(() => {
    if (state.phase === 'move' && state.dice.length > 0 && getMoves(state).length === 0) {
      setState((s) => ({
        ...s,
        currentPlayer: s.currentPlayer === 'white' ? 'black' : 'white',
        dice: [],
        usedDice: [],
        phase: 'roll',
      }))
    }
  }, [state.phase, state.dice.length, state.currentPlayer, state.board])

  const handleRoll = useCallback(() => {
    setState((s) => rollDice(s))
    setSelectedFrom(null)
  }, [])

  const handleMove = useCallback((move: Move) => {
    setState((s) => applyMove(s, move))
    setSelectedFrom(null)
  }, [])

  const handleNewGame = useCallback((robot: boolean) => {
    setState(getInitialGameState())
    setSelectedFrom(null)
    setVsRobot(robot)
    robotScheduled.current = false
  }, [])

  useEffect(() => {
    if (!vsRobot || effectiveState.winner || effectiveState.currentPlayer !== 'black') {
      robotScheduled.current = false
      return
    }
    if (robotScheduled.current) return
    robotScheduled.current = true

    if (effectiveState.phase === 'roll') {
      const t = setTimeout(() => {
        setState((s) => rollDice(s))
        setSelectedFrom(null)
        robotScheduled.current = false
      }, ROBOT_DELAY_ROLL_MS)
      return () => clearTimeout(t)
    }

    if (effectiveState.phase === 'move') {
      const moves = getMoves(effectiveState)
      if (moves.length === 0) {
        robotScheduled.current = false
        return
      }
      const move = moves[Math.floor(Math.random() * moves.length)]
      const t = setTimeout(() => {
        setState((s) => applyMove(s, move))
        setSelectedFrom(null)
        robotScheduled.current = false
      }, ROBOT_DELAY_MOVE_MS)
      return () => clearTimeout(t)
    }

    robotScheduled.current = false
  }, [vsRobot, effectiveState.phase, effectiveState.currentPlayer, effectiveState.winner, effectiveState.board, effectiveState.dice, effectiveState.usedDice])

  if (effectiveState.phase === 'gameover' && effectiveState.winner) {
    return (
      <div className="app">
        <h1>Backgammon</h1>
        <div className="gameover">
          <p>
            A câștigat <strong>{effectiveState.winner === 'white' ? 'Alb' : 'Negru'}</strong>!
          </p>
          <div className="gameover-buttons">
            <button type="button" className="roll-btn" onClick={() => handleNewGame(false)}>
              Partidă nouă (2 jucători)
            </button>
            <button type="button" className="roll-btn" onClick={() => handleNewGame(true)}>
              Partidă nouă (contra robot)
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isRobotTurn = vsRobot && effectiveState.currentPlayer === 'black'

  return (
    <div className="app">
      <h1>Backgammon</h1>
      <div className="mode-row">
        <span className="mode-label">Mod:</span>
        <button
          type="button"
          className={`mode-btn ${!vsRobot ? 'active' : ''}`}
          onClick={() => {
            if (vsRobot) {
              setVsRobot(false)
              setState(getInitialGameState())
              setSelectedFrom(null)
            }
          }}
        >
          2 jucători
        </button>
        <button
          type="button"
          className={`mode-btn ${vsRobot ? 'active' : ''}`}
          onClick={() => {
            if (!vsRobot) {
              setVsRobot(true)
              setState(getInitialGameState())
              setSelectedFrom(null)
            }
          }}
        >
          Contra robot
        </button>
      </div>
      <p className="turn">
        {isRobotTurn ? (
          <>Mută: <strong>Robot (Negru)</strong> — așteaptă...</>
        ) : (
          <>Mută: <strong>{effectiveState.currentPlayer === 'white' ? 'Alb' : 'Negru'}</strong></>
        )}
      </p>
      <div className="dice-row">
        <span className="dice-label" aria-hidden>Zaruri</span>
        <Dice values={effectiveState.dice} usedCount={effectiveState.usedDice.length} />
        {mustRoll(effectiveState) && !isRobotTurn && (
          <button type="button" className="roll-btn" onClick={handleRoll}>
            Aruncă zarurile
          </button>
        )}
      </div>
      <Board
        state={effectiveState}
        selectedFrom={selectedFrom}
        onSelectSource={setSelectedFrom}
        onMove={handleMove}
      />
    </div>
  )
}
