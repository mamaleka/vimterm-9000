export type VimMode = 'normal' | 'insert' | 'visual' | 'command'

export interface Position {
  row: number
  col: number
}

export interface Action {
  type: string
  operator?: string
  motion?: string
  count?: number
  char?: string
  text?: string
}

export interface VimState {
  mode: VimMode
  buffer: string[]
  cursor: Position
  register: string
  pendingOperator: string | null
  pendingCount: number | null
  pendingMotion: string[]
  jumpList: Position[]
  jumpIndex: number
  marks: Record<string, Position>
  lastFindChar: string | null
  lastFindDirection: 'forward' | 'backward' | null
  lastFindTill: boolean
  searchPattern: string | null
  lastAction: Action | null
}
