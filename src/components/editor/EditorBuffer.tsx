import type { Position } from '../../types/vim'

interface Props {
  buffer: string[]
  targets?: Position[]
  enemies?: Position[]
  visualSelection?: { start: Position; end: Position } | null
}

function isAt(positions: Position[] | undefined, row: number, col: number): boolean {
  return positions?.some(p => p.row === row && p.col === col) ?? false
}

export function EditorBuffer({ buffer, targets, enemies }: Props) {
  return (
    <div className="font-mono whitespace-pre leading-tight">
      {buffer.map((line, row) => (
        <div key={row}>
          {Array.from(line).map((char, col) => {
            const isTarget = isAt(targets, row, col)
            const isEnemy = isAt(enemies, row, col)
            return (
              <span
                key={col}
                data-row={row}
                data-col={col}
                data-target={isTarget ? 'true' : undefined}
                data-enemy={isEnemy ? 'true' : undefined}
                className={
                  isTarget ? 'text-crt-amber' :
                  isEnemy ? 'text-crt-red' :
                  ''
                }
              >
                {char}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
