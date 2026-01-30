import type { BoardState, GameState, Move, Player } from './types'

const WHITE_HOME = [0, 1, 2, 3, 4, 5]
const BLACK_HOME = [18, 19, 20, 21, 22, 23]

function getInitialPoints(): number[] {
  const points = new Array(24).fill(0)
  // White: 2 on 24, 5 on 13, 3 on 8, 5 on 6
  points[23] = 2
  points[12] = 5
  points[7] = 3
  points[5] = 5
  // Black: 2 on 1, 5 on 12, 3 on 17, 5 on 19
  points[0] = -2
  points[11] = -5
  points[16] = -3
  points[18] = -5
  return points
}

export function getInitialBoard(): BoardState {
  return {
    points: getInitialPoints(),
    barWhite: 0,
    barBlack: 0,
    borneOffWhite: 0,
    borneOffBlack: 0,
  }
}

export function getInitialGameState(): GameState {
  return {
    board: getInitialBoard(),
    currentPlayer: 'white',
    dice: [],
    usedDice: [],
    phase: 'roll',
    winner: null,
  }
}

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function rollDice(state: GameState): GameState {
  if (state.phase !== 'roll') return state
  const d1 = rollDie()
  const d2 = rollDie()
  const dice = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]
  return {
    ...state,
    dice,
    usedDice: [],
    phase: 'move',
  }
}

function getAvailableDiceValues(state: GameState): number[] {
  return state.dice.filter((_, i) => !state.usedDice.includes(i))
}

function hasPiecesOnBar(board: BoardState, player: Player): boolean {
  return player === 'white' ? board.barWhite > 0 : board.barBlack > 0
}

function canEnter(board: BoardState, player: Player, pointIndex: number): boolean {
  const v = board.points[pointIndex]
  if (player === 'white') return v > -2
  return v < 2
}

function allInHome(board: BoardState, player: Player): boolean {
  const points = board.points
  if (player === 'white') {
    const inHome = WHITE_HOME.reduce((s, i) => s + (points[i] > 0 ? points[i] : 0), 0)
    const onBar = board.barWhite
    const borne = board.borneOffWhite
    return inHome + onBar + borne === 15
  } else {
    const inHome = BLACK_HOME.reduce((s, i) => s + (points[i] < 0 ? -points[i] : 0), 0)
    const onBar = board.barBlack
    const borne = board.borneOffBlack
    return inHome + onBar + borne === 15
  }
}

function getLegalMoves(state: GameState): Move[] {
  const { board, currentPlayer } = state
  const dice = getAvailableDiceValues(state)
  if (dice.length === 0) return []

  const moves: Move[] = []

  if (hasPiecesOnBar(board, currentPlayer)) {
    for (const die of dice) {
      const enterIndex = currentPlayer === 'white' ? 24 - die : die - 1
      if (enterIndex >= 0 && enterIndex <= 23 && canEnter(board, currentPlayer, enterIndex)) {
        moves.push({ from: 'bar', to: enterIndex, die })
      }
    }
    return moves
  }

  const sign = currentPlayer === 'white' ? 1 : -1
  for (let from = 0; from < 24; from++) {
    if (Math.sign(board.points[from]) !== sign || board.points[from] === 0) continue
    for (const die of dice) {
      if (currentPlayer === 'white') {
        const to = from - die
        if (to >= 0) {
          if (board.points[to] >= 0 && canEnter(board, currentPlayer, to)) {
            moves.push({ from, to, die })
          }
        } else if (allInHome(board, 'white') && WHITE_HOME.includes(from) && die >= from + 1) {
          moves.push({ from, to: 'off', die })
        }
      } else {
        const to = from + die
        if (to <= 23) {
          if (board.points[to] <= 0 && canEnter(board, currentPlayer, to)) {
            moves.push({ from, to, die })
          }
        } else if (allInHome(board, 'black') && BLACK_HOME.includes(from) && die >= 24 - from) {
          moves.push({ from, to: 'off', die })
        }
      }
    }
  }
  return moves
}

function applyMoveToBoard(board: BoardState, player: Player, move: Move): BoardState {
  const next = {
    points: [...board.points],
    barWhite: board.barWhite,
    barBlack: board.barBlack,
    borneOffWhite: board.borneOffWhite,
    borneOffBlack: board.borneOffBlack,
  }
  const sign = player === 'white' ? 1 : -1

  if (move.from === 'bar') {
    if (player === 'white') next.barWhite--
    else next.barBlack--
  } else {
    next.points[move.from] -= sign
    if (next.points[move.from] === 0) next.points[move.from] = 0
  }

  if (move.to === 'off') {
    if (player === 'white') next.borneOffWhite++
    else next.borneOffBlack++
  } else {
    const v = next.points[move.to]
    if (v !== 0 && Math.sign(v) !== sign) {
      next.points[move.to] = 0
      if (player === 'white') next.barBlack++
      else next.barWhite++
    }
    next.points[move.to] += sign
  }
  return next
}

function isGameOver(board: BoardState): Player | null {
  if (board.borneOffWhite === 15) return 'white'
  if (board.borneOffBlack === 15) return 'black'
  return null
}

export function applyMove(state: GameState, move: Move): GameState {
  const legal = getLegalMoves(state)
  if (!legal.some((m) => m.from === move.from && m.to === move.to && m.die === move.die)) {
    return state
  }
  const board = applyMoveToBoard(state.board, state.currentPlayer, move)
  const diceUsed = [...state.usedDice]
  const nextIndex = state.dice.findIndex((d, i) => d === move.die && !state.usedDice.includes(i))
  if (nextIndex >= 0) diceUsed.push(nextIndex)
  const winner = isGameOver(board)
  const allUsed = diceUsed.length >= state.dice.length
  const nextPlayer = allUsed ? (state.currentPlayer === 'white' ? 'black' : 'white') : state.currentPlayer
  const nextDice = allUsed ? [] : state.dice
  const nextUsed = allUsed ? [] : diceUsed

  return {
    ...state,
    board,
    currentPlayer: nextPlayer,
    dice: nextDice,
    usedDice: nextUsed,
    phase: winner ? 'gameover' : allUsed ? 'roll' : 'move',
    winner: winner ?? null,
  }
}

export function mustRoll(state: GameState): boolean {
  return state.phase === 'roll' && state.dice.length === 0
}

export function getMoves(state: GameState): Move[] {
  return getLegalMoves(state)
}
