export type Player = 'white' | 'black'

/** Point 0 = white's 1 / black's 24, point 23 = white's 24 / black's 1 */
export interface BoardState {
  /** 24 points: positive = white count, negative = black count */
  points: number[]
  barWhite: number
  barBlack: number
  borneOffWhite: number
  borneOffBlack: number
}

export interface GameState {
  board: BoardState
  currentPlayer: Player
  dice: number[]
  usedDice: number[]
  phase: 'roll' | 'move' | 'gameover'
  winner: Player | null
}

export interface Move {
  from: 'bar' | number
  to: number | 'off'
  die: number
}
