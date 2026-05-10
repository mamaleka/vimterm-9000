import { useState, useEffect } from 'react'
import type { Position, VimMode } from '../../types/vim'

export const BLINK_INTERVAL_MS = 530

interface Props {
  cursor: Position | null
  mode: VimMode
}

export function CursorOverlay({ cursor, mode }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const id = setInterval(() => {
      setVisible(prev => !prev)
    }, BLINK_INTERVAL_MS)
    return () => {
      clearInterval(id)
    }
  }, [cursor?.row, cursor?.col])

  if (cursor === null) {
    return null
  }

  const isInsert = mode === 'insert'

  return (
    <span
      data-testid="cursor-overlay"
      data-mode={mode}
      className={[
        'absolute',
        'pointer-events-none',
        isInsert
          ? 'w-0.5 h-[1em] bg-crt-cursor'
          : 'w-[1ch] h-[1em] bg-crt-cursor mix-blend-difference',
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      style={{
        top: `${cursor.row}em`,
        left: `${cursor.col}ch`,
      }}
    />
  )
}
