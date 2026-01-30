import type { GameState, Plane, MyCell, EnemyCell, RobotLevel, PlanesCount, GameMode } from './types'
import { GRID_SIZE } from './types'

/** Offsets pentru forma avionului (3x3): cap (0,0), corp. Rotația 0 = cap sus. */
const PLANE_SHAPE_ROT0 = [
  { r: 0, c: 1, isHead: true },
  { r: 1, c: 0, isHead: false },
  { r: 1, c: 1, isHead: false },
  { r: 1, c: 2, isHead: false },
  { r: 2, c: 1, isHead: false },
]

function rotateOffset(r: number, c: number, rotation: number): { r: number; c: number } {
  const rot = ((rotation % 360) + 360) % 360
  if (rot === 0) return { r, c }
  if (rot === 90) return { r: c, c: 2 - r }
  if (rot === 180) return { r: 2 - r, c: 2 - c }
  return { r: 2 - c, c: r }
}

export function getPlaneCells(plane: Plane): { row: number; col: number; isHead: boolean }[] {
  return PLANE_SHAPE_ROT0.map(({ r, c, isHead }) => {
    const { r: dr, c: dc } = rotateOffset(r, c, plane.rotation)
    return { row: plane.row + dr, col: plane.col + dc, isHead }
  })
}

function createEmptyGrid<T>(fill: T): T[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(fill))
}

export function canPlacePlane(grid: MyCell[][], plane: Plane): boolean {
  const cells = getPlaneCells(plane)
  for (const { row, col } of cells) {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false
    if (grid[row][col] !== 'empty') return false
  }
  return true
}

export function placePlaneOnGrid(grid: MyCell[][], plane: Plane): MyCell[][] {
  const next = grid.map((row) => [...row])
  for (const { row, col, isHead } of getPlaneCells(plane)) {
    next[row][col] = isHead ? 'head' : 'body'
  }
  return next
}

export function getInitialState(robotLevel: RobotLevel = 'beginner', planesCount: PlanesCount = 3, gameMode: GameMode = 'robot'): GameState {
  return {
    phase: 'placing',
    planesCount,
    gameMode,
    myGrid: createEmptyGrid<MyCell>('empty'),
    enemyGrid: createEmptyGrid<EnemyCell>('unknown'),
    myPlanes: [],
    enemyPlanes: [],
    currentTurn: 'player',
    winner: null,
    lastShot: null,
    message: gameMode === 'multiplayer' ? `Jucător 1: plasează cele ${planesCount} avioane.` : `Plasează cele ${planesCount} avioane. Click pe grilă, apoi rotește cu butonul.`,
    robotLevel,
  }
}

export function getRotations(): number[] {
  return [0, 90, 180, 270]
}

export function tryPlacePlane(state: GameState, row: number, col: number, rotation: number): GameState | null {
  if (state.phase !== 'placing' && state.phase !== 'placing-p2') return null
  if (state.myPlanes.length >= state.planesCount) return null
  const plane: Plane = { row, col, rotation: rotation as Plane['rotation'], id: state.myPlanes.length }
  if (!canPlacePlane(state.myGrid, plane)) return null
  const newGrid = placePlaneOnGrid(state.myGrid, plane)
  const myPlanes = [...state.myPlanes, plane]
  const done = myPlanes.length >= state.planesCount

  if (state.gameMode === 'multiplayer' && state.phase === 'placing' && done) {
    return {
      ...state,
      myGrid: createEmptyGrid<MyCell>('empty'),
      myPlanes: [],
      phase: 'placing-p2',
      message: `Jucător 2: plasează cele ${state.planesCount} avioane.`,
      player1Grid: newGrid,
      player1Planes: myPlanes,
    }
  }
  if (state.gameMode === 'multiplayer' && state.phase === 'placing-p2' && done) {
    return {
      ...state,
      myGrid: state.player1Grid!,
      myPlanes: state.player1Planes!,
      enemyGrid: createEmptyGrid<EnemyCell>('unknown'),
      enemyPlanes: myPlanes,
      phase: 'playing',
      message: 'Jucător 1 trage. Apasă pe grila din dreapta.',
      player1EnemyView: createEmptyGrid<EnemyCell>('unknown'),
      player2Grid: newGrid,
      player2Planes: myPlanes,
      player2EnemyView: createEmptyGrid<EnemyCell>('unknown'),
      currentPlayer: 1,
    }
  }
  if (done && state.gameMode === 'robot') {
    return {
      ...state,
      myGrid: newGrid,
      myPlanes,
      phase: 'playing',
      message: 'Toate avioanele sunt plasate. Tragi primul.',
      enemyPlanes: placeEnemyPlanesRandom(state.planesCount),
      enemyGrid: createEmptyGrid<EnemyCell>('unknown'),
    }
  }
  const message = `Plasează avionul ${myPlanes.length + 1}/${state.planesCount}. Click pe grilă.`
  return { ...state, myGrid: newGrid, myPlanes, message }
}

function placeEnemyPlanesRandom(planesCount: PlanesCount): Plane[] {
  const planes: Plane[] = []
  const grid = createEmptyGrid<MyCell>('empty')
  for (let id = 0; id < planesCount; id++) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const row = Math.floor(Math.random() * (GRID_SIZE - 2))
      const col = Math.floor(Math.random() * (GRID_SIZE - 2))
      const rotation = (Math.floor(Math.random() * 4) * 90) as Plane['rotation']
      const plane: Plane = { row, col, rotation, id }
      if (!canPlacePlane(grid, plane)) continue
      planes.push(plane)
      for (const { row: r, col: c, isHead } of getPlaneCells(plane)) {
        grid[r][c] = isHead ? 'head' : 'body'
      }
      break
    }
  }
  return planes
}

function getEnemyCellAt(enemyPlanes: Plane[], row: number, col: number): 'head' | 'body' | null {
  for (const plane of enemyPlanes) {
    for (const cell of getPlaneCells(plane)) {
      if (cell.row === row && cell.col === col) return cell.isHead ? 'head' : 'body'
    }
  }
  return null
}

function isPlaneDown(enemyPlanes: Plane[], enemyGrid: EnemyCell[][], planeId: number): boolean {
  const plane = enemyPlanes.find((p) => p.id === planeId)
  if (!plane) return true
  const cells = getPlaneCells(plane)
  return cells.every(({ row, col }) => enemyGrid[row][col] === 'hit' || enemyGrid[row][col] === 'down')
}

export function playerShoot(state: GameState, row: number, col: number): GameState | null {
  if (state.phase !== 'playing' || state.currentTurn !== 'player') return null
  if (state.enemyGrid[row][col] !== 'unknown') return null

  if (state.gameMode === 'multiplayer' && state.currentPlayer != null) {
    return playerShootMultiplayer(state, row, col)
  }

  const cell = getEnemyCellAt(state.enemyPlanes, row, col)
  const nextEnemyGrid = state.enemyGrid.map((r) => r.map((c) => c))
  let message: string
  let currentTurn: 'player' | 'robot' = 'robot'
  let winner: GameState['winner'] = null
  let phase: GameState['phase'] = state.phase

  if (!cell) {
    nextEnemyGrid[row][col] = 'miss'
    message = 'Ratat. Rândul robotului.'
    currentTurn = 'robot'
  } else if (cell === 'head') {
    nextEnemyGrid[row][col] = 'down'
    const plane = state.enemyPlanes.find((p) =>
      getPlaneCells(p).some((c) => c.row === row && c.col === col && c.isHead)
    )
    if (plane) {
      for (const { row: r, col: c } of getPlaneCells(plane)) {
        nextEnemyGrid[r][c] = 'down'
      }
    }
    const left = state.enemyPlanes.filter((p) => !isPlaneDown(state.enemyPlanes, nextEnemyGrid, p.id)).length
    message = left === 0 ? 'Ai câștigat!' : 'Avion doborât! Rândul robotului.'
    if (left === 0) {
      winner = 'player'
      phase = 'gameover'
    }
    currentTurn = 'robot'
  } else {
    nextEnemyGrid[row][col] = 'hit'
    message = 'Lovit (corp). Rândul robotului.'
    currentTurn = 'robot'
  }

  return {
    ...state,
    enemyGrid: nextEnemyGrid,
    currentTurn,
    winner,
    phase,
    lastShot: { row, col },
    message,
  }
}

function playerShootMultiplayer(state: GameState, row: number, col: number): GameState | null {
  const isP1 = state.currentPlayer === 1
  const myEnemyView = isP1 ? state.player1EnemyView! : state.player2EnemyView!
  const enemyPlanes = isP1 ? state.player2Planes! : state.player1Planes!
  if (myEnemyView[row][col] !== 'unknown') return null

  const cell = getEnemyCellAt(enemyPlanes, row, col)
  const nextView = myEnemyView.map((r) => r.map((c) => c))
  let winner: GameState['winner'] = null
  let phase: GameState['phase'] = state.phase

  if (!cell) {
    nextView[row][col] = 'miss'
  } else if (cell === 'head') {
    nextView[row][col] = 'down'
    const plane = enemyPlanes.find((p) =>
      getPlaneCells(p).some((c) => c.row === row && c.col === col && c.isHead)
    )
    if (plane) {
      for (const { row: r, col: c } of getPlaneCells(plane)) {
        nextView[r][c] = 'down'
      }
    }
    const left = enemyPlanes.filter((p) => !isPlaneDown(enemyPlanes, nextView, p.id)).length
    if (left === 0) {
      winner = isP1 ? 'player' : 'robot'
      phase = 'gameover'
    }
  } else {
    nextView[row][col] = 'hit'
  }

  const nextPlayer = isP1 ? 2 : 1
  const nextMyGrid = nextPlayer === 1 ? state.player1Grid! : state.player2Grid!
  const nextMyPlanes = nextPlayer === 1 ? state.player1Planes! : state.player2Planes!
  const nextEnemyView = nextPlayer === 1 ? state.player1EnemyView! : state.player2EnemyView!
  const nextEnemyPlanes = nextPlayer === 1 ? state.player2Planes! : state.player1Planes!

  return {
    ...state,
    myGrid: nextMyGrid,
    myPlanes: nextMyPlanes,
    enemyGrid: nextEnemyView,
    enemyPlanes: nextEnemyPlanes,
    player1EnemyView: isP1 ? nextView : state.player1EnemyView,
    player2EnemyView: isP1 ? state.player2EnemyView : nextView,
    currentPlayer: nextPlayer,
    winner,
    phase,
    lastShot: { row, col },
    message: phase === 'gameover' ? (winner === 'player' ? 'Jucător 1 a câștigat!' : 'Jucător 2 a câștigat!') : `Jucător ${nextPlayer}: dă dispozitivul adversarului și trage.`,
  }
}

function getUnshotCells(state: GameState): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = state.myGrid[r][c]
      if (cell === 'head' || cell === 'body') out.push({ row: r, col: c })
    }
  }
  return out
}

function getNeighbors(row: number, col: number): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = []
  if (row > 0) out.push({ row: row - 1, col })
  if (row < GRID_SIZE - 1) out.push({ row: row + 1, col })
  if (col > 0) out.push({ row, col: col - 1 })
  if (col < GRID_SIZE - 1) out.push({ row, col: col + 1 })
  return out
}

function robotPickShot(state: GameState, level: RobotLevel): { row: number; col: number } {
  const unshot = getUnshotCells(state)
  if (unshot.length === 0) return { row: 0, col: 0 }

  const hitCells: { row: number; col: number }[] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (state.myGrid[r][c] === 'body-hit' || state.myGrid[r][c] === 'head-hit') hitCells.push({ row: r, col: c })
    }
  }

  const unshotSet = new Set(unshot.map(({ row, col }) => `${row},${col}`))

  // Începător: 99% trage pe margine; 1% random (foarte slab)
  if (level === 'beginner') {
    const edgeCells = unshot.filter(
      ({ row, col }) => row === 0 || row === GRID_SIZE - 1 || col === 0 || col === GRID_SIZE - 1
    )
    if (edgeCells.length > 0 && Math.random() < 0.99) {
      return edgeCells[Math.floor(Math.random() * edgeCells.length)]
    }
    return unshot[Math.floor(Math.random() * unshot.length)]
  }

  // Mediu: 1% șansă să urmărească loviturile
  if (level === 'medium' && hitCells.length > 0 && Math.random() < 0.01) {
    const adj: { row: number; col: number }[] = []
    for (const h of hitCells) {
      for (const n of getNeighbors(h.row, h.col)) {
        if (unshotSet.has(`${n.row},${n.col}`)) adj.push(n)
      }
    }
    if (adj.length > 0) return adj[Math.floor(Math.random() * adj.length)]
  }

  // Avansat: 2% șansă să urmărească loviturile
  if (level === 'advanced' && hitCells.length > 0 && Math.random() < 0.02) {
    const adj: { row: number; col: number }[] = []
    for (const h of hitCells) {
      for (const n of getNeighbors(h.row, h.col)) {
        if (unshotSet.has(`${n.row},${n.col}`)) adj.push(n)
      }
    }
    if (adj.length > 0) return adj[Math.floor(Math.random() * adj.length)]
  }

  return unshot[Math.floor(Math.random() * unshot.length)]
}

export function applyRobotShot(state: GameState): GameState | null {
  if (state.phase !== 'playing' || state.currentTurn !== 'robot') return null

  const level = state.robotLevel ?? 'beginner'
  const { row, col } = robotPickShot(state, level)
  const cell = state.myGrid[row][col]
  const nextMyGrid = state.myGrid.map((r) => r.map((c) => c))
  let message: string
  const currentTurn: 'player' | 'robot' = 'player'
  let winner: GameState['winner'] = null
  let phase: GameState['phase'] = state.phase

  if (cell === 'empty') {
    nextMyGrid[row][col] = 'miss'
    message = 'Robotul a ratat. Tu tragi.'
  } else if (cell === 'head') {
    nextMyGrid[row][col] = 'head-hit'
    const plane = state.myPlanes.find((p) =>
      getPlaneCells(p).some((c) => c.row === row && c.col === col && c.isHead)
    )
    if (plane) {
      for (const { row: r, col: c } of getPlaneCells(plane)) {
        nextMyGrid[r][c] = nextMyGrid[r][c] === 'body' ? 'body-hit' : 'head-hit'
      }
    }
    const myLeft = state.myPlanes.filter((p) => {
      const cells = getPlaneCells(p)
      return !cells.every(({ row: r, col: c }) => nextMyGrid[r][c] === 'body-hit' || nextMyGrid[r][c] === 'head-hit')
    }).length
    message = myLeft === 0 ? 'Robotul a câștigat!' : 'Robotul ți-a doborât un avion. Tu tragi.'
    if (myLeft === 0) {
      winner = 'robot'
      phase = 'gameover'
    }
  } else {
    nextMyGrid[row][col] = 'body-hit'
    message = 'Robotul te-a lovit (corp). Tu tragi.'
  }

  return {
    ...state,
    myGrid: nextMyGrid,
    currentTurn,
    winner,
    phase,
    lastShot: { row, col },
    message,
  }
}
