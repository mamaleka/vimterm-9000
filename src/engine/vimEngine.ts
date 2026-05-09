import type { VimState } from '../types/vim'

export function createInitialState(buffer: string[]): VimState {
  return {
    mode: 'normal',
    buffer,
    cursor: { row: 0, col: 0 },
    register: '',
    pendingOperator: null,
    pendingCount: null,
    pendingMotion: [],
    jumpList: [],
    jumpIndex: -1,
    marks: {},
    lastFindChar: null,
    lastFindDirection: null,
    lastFindTill: false,
    searchPattern: null,
    lastAction: null,
  }
}

function clampCol(col: number, line: string): number {
  if (line.length === 0) return 0
  return Math.min(col, line.length - 1)
}

export function processKey(state: VimState, key: string): VimState {
  const { cursor, buffer } = state
  const lastRow = buffer.length - 1

  switch (key) {
    case 'h': {
      return { ...state, cursor: { row: cursor.row, col: Math.max(0, cursor.col - 1) } }
    }
    case 'l': {
      const line = buffer[cursor.row] ?? ''
      const maxCol = Math.max(0, line.length - 1)
      return { ...state, cursor: { row: cursor.row, col: Math.min(maxCol, cursor.col + 1) } }
    }
    case 'j': {
      const newRow = Math.min(lastRow, cursor.row + 1)
      const newCol = clampCol(cursor.col, buffer[newRow] ?? '')
      return { ...state, cursor: { row: newRow, col: newCol } }
    }
    case 'k': {
      const newRow = Math.max(0, cursor.row - 1)
      const newCol = clampCol(cursor.col, buffer[newRow] ?? '')
      return { ...state, cursor: { row: newRow, col: newCol } }
    }
    default:
      return state
  }
}
