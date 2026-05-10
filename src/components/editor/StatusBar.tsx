import type { VimMode, Position } from '../../types/vim'

interface Props {
  mode: VimMode
  cursor: Position
  fileName?: string
}

const MODE_LABELS: Record<VimMode, string> = {
  normal: 'NORMAL',
  insert: '-- INSERT --',
  visual: 'VISUAL',
  command: 'COMMAND',
}

export function StatusBar({ mode, cursor, fileName }: Props) {
  return (
    <div className="flex items-center justify-between bg-crt-surface border-t border-crt-border px-2 py-0.5 text-sm font-mono">
      <span className="text-crt-bright">{MODE_LABELS[mode]}</span>
      {fileName && <span className="text-crt-dim">{fileName}</span>}
      <span className="text-crt-text">{cursor.row + 1}:{cursor.col + 1}</span>
    </div>
  )
}
