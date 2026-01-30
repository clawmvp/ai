import './Dice.css'

interface DiceProps {
  values: number[]
  usedCount: number
}

const DICE_PATTERNS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}

function SingleDie({ value, used }: { value: number; used: boolean }) {
  const filled = DICE_PATTERNS[value] ?? []
  return (
    <div className={`die ${used ? 'used' : ''}`} role="img" aria-label={`Zar ${value}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slot) => (
        <span key={slot} className={`die-dot ${filled.includes(slot) ? 'filled' : ''}`} />
      ))}
    </div>
  )
}

export default function Dice({ values, usedCount }: DiceProps) {
  return (
    <div className="dice-container">
      {values.length === 0 ? (
        <div className="die-placeholder" aria-hidden />
      ) : (
        values.map((v, i) => (
          <SingleDie key={i} value={v} used={i < usedCount} />
        ))
      )}
    </div>
  )
}
