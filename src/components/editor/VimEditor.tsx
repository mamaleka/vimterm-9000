import { useEffect } from 'react'
import type { Position, VimState } from '../../types/vim'
import { useVimEngine } from '../../hooks/useVimEngine'
import { EditorBuffer } from './EditorBuffer'
import { CursorOverlay } from './CursorOverlay'
import { LineNumbers } from './LineNumbers'
import { StatusBar } from './StatusBar'

interface Props {
  initialBuffer: string[]
  targets?: Position[]
  enemies?: Position[]
  onStateChange?: (state: VimState) => void
  onArrowKey?: () => void
  fileName?: string
}

export function VimEditor({
  initialBuffer,
  targets,
  enemies,
  onStateChange,
  onArrowKey,
  fileName,
}: Props) {
  const { vimState, arrowKeyCount } = useVimEngine(initialBuffer)

  useEffect(() => {
    onStateChange?.(vimState)
  }, [vimState, onStateChange])

  useEffect(() => {
    if (arrowKeyCount > 0) {
      onArrowKey?.()
    }
  }, [arrowKeyCount, onArrowKey])

  return (
    <div className="flex flex-col font-mono bg-crt-bg text-crt-text">
      <div className="flex flex-1 overflow-hidden">
        <LineNumbers
          lineCount={vimState.buffer.length}
          currentLine={vimState.cursor.row}
        />
        <div className="relative flex-1">
          <EditorBuffer
            buffer={vimState.buffer}
            targets={targets}
            enemies={enemies}
          />
          <CursorOverlay cursor={vimState.cursor} mode={vimState.mode} />
        </div>
      </div>
      <StatusBar
        mode={vimState.mode}
        cursor={vimState.cursor}
        fileName={fileName}
      />
    </div>
  )
}
