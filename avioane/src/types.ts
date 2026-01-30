export const GRID_SIZE = 10
/** Numărul de avioane poate fi ales la start (2–5). */
export const PLANES_COUNT_OPTIONS = [2, 3, 4, 5] as const
export type PlanesCount = (typeof PLANES_COUNT_OPTIONS)[number]

/** Un avion = 1 cap + 4 corp. Formă în 3x3: cap sus, corp T. */
export type Rotation = 0 | 90 | 180 | 270

export interface Plane {
  row: number
  col: number
  rotation: Rotation
  id: number
}

/** Stare celulă pe grila ta (flotă): ce e acolo și dacă a fost lovită */
export type MyCell = 'empty' | 'head' | 'body' | 'head-hit' | 'body-hit' | 'miss'

/** Stare celulă pe grila inamicului (ce ai tras): necunoscut, ratat, lovit, avion doborât */
export type EnemyCell = 'unknown' | 'miss' | 'hit' | 'down'

export type RobotLevel = 'beginner' | 'medium' | 'advanced'

export type GameMode = 'robot' | 'multiplayer'

export interface GameState {
  phase: 'placing' | 'placing-p2' | 'playing' | 'gameover'
  planesCount: PlanesCount
  gameMode: GameMode
  myGrid: MyCell[][]
  enemyGrid: EnemyCell[][]
  myPlanes: Plane[]
  enemyPlanes: Plane[]
  currentTurn: 'player' | 'robot'
  winner: 'player' | 'robot' | null
  lastShot: { row: number; col: number } | null
  message: string
  robotLevel: RobotLevel
  /** Multiplayer: datele jucătorului 1 (când e rândul P2) */
  player1Grid?: MyCell[][]
  player1Planes?: Plane[]
  player1EnemyView?: EnemyCell[][]
  /** Multiplayer: datele jucătorului 2 */
  player2Grid?: MyCell[][]
  player2Planes?: Plane[]
  player2EnemyView?: EnemyCell[][]
  /** Multiplayer: 1 sau 2 */
  currentPlayer?: 1 | 2
}
