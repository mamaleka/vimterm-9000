import { useState, useEffect } from 'react'
import type { Position, VimMode } from '../../types/vim'

export const BLINK_INTERVAL_MS = 530

interface Props {
  cursor: Position | null
  mode: VimMode
}

const MODE_SHAPE: Record<VimMode, string> = {
  normal:  'w-[1ch] h-[1em] bg-crt-cursor mix-blend-difference',
  visual:  'w-[1ch] h-[1em] bg-crt-cursor mix-blend-difference',
  command: 'w-[1ch] h-[1em] bg-crt-cursor mix-blend-difference',
  insert:  'w-0.5 h-[1em] bg-crt-cursor',
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

  return (
    <span
      data-testid="cursor-overlay"
      data-mode={mode}
      className={[
        'absolute pointer-events-none',
        MODE_SHAPE[mode],
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      style={{
        top: `${cursor.row}em`,
        left: `${cursor.col}ch`,
      }}
    />
  )
}
