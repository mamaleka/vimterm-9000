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

function firstNonWhitespaceCol(line: string): number {
  for (let i = 0; i < line.length; i++) {
    if (!/\s/.test(line[i]!)) return i
  }
  return 0
}

function isWordChar(ch: string): boolean {
  return /\w/.test(ch)
}

function isSpace(ch: string): boolean {
  return /\s/.test(ch)
}

// Returns the "token type" at a position: 'word', 'nonword', or 'space'
// Used to determine word boundaries for the `w` motion
function tokenType(ch: string): 'word' | 'nonword' | 'space' {
  if (isSpace(ch)) return 'space'
  if (isWordChar(ch)) return 'word'
  return 'nonword'
}

function moveWordForward(
  buffer: string[],
  cursor: { row: number; col: number },
): { row: number; col: number } {
  const totalRows = buffer.length
  let { row, col } = cursor

  // Helper: last valid position in buffer
  const bufferEnd = (): { row: number; col: number } => {
    const lastRow = totalRows - 1
    const lastLine = buffer[lastRow] ?? ''
    return { row: lastRow, col: Math.max(0, lastLine.length - 1) }
  }

  const line = buffer[row] ?? ''

  // On an empty line, move to the next line
  if (line.length === 0) {
    if (row + 1 < totalRows) {
      return { row: row + 1, col: 0 }
    }
    return { row, col: 0 }
  }

  // Already past end of line (shouldn't happen, but guard)
  if (col >= line.length) {
    if (row + 1 < totalRows) {
      return { row: row + 1, col: 0 }
    }
    return bufferEnd()
  }

  const curType = tokenType(line[col]!)

  // Skip current token (word chars or non-word/non-space chars)
  let c = col
  if (curType !== 'space') {
    while (c < line.length && tokenType(line[c]!) === curType) {
      c++
    }
  }

  // Skip spaces
  while (c < line.length && isSpace(line[c]!)) {
    c++
  }

  // If we found a new token on this line, land there
  if (c < line.length) {
    return { row, col: c }
  }

  // No more tokens on this line — try next line
  if (row + 1 < totalRows) {
    // Skip leading spaces on next line
    let nextCol = 0
    const nextLine = buffer[row + 1] ?? ''
    while (nextCol < nextLine.length && isSpace(nextLine[nextCol]!)) {
      nextCol++
    }
    return { row: row + 1, col: nextCol }
  }

  // We are at or past the last token on the last line — go to buffer end
  return bufferEnd()
}

function moveWordBackward(
  buffer: string[],
  cursor: { row: number; col: number },
): { row: number; col: number } {
  let { row, col } = cursor

  // Already at buffer start
  if (row === 0 && col === 0) return { row, col }

  // Step one position back
  if (col === 0) {
    row--
    col = Math.max(0, (buffer[row] ?? '').length - 1)
  } else {
    col--
  }

  // Skip spaces backward
  while (true) {
    const line = buffer[row] ?? ''
    if (col >= 0 && col < line.length && !isSpace(line[col]!)) break
    if (col > 0) {
      col--
    } else if (row > 0) {
      row--
      col = Math.max(0, (buffer[row] ?? '').length - 1)
    } else {
      // At very start of buffer
      return { row: 0, col: 0 }
    }
  }

  // Now at the last char of a token — find its start
  const line = buffer[row] ?? ''
  const atWordChar = isWordChar(line[col]!)
  while (col > 0 && isWordChar(line[col - 1]!) === atWordChar) {
    col--
  }

  return { row, col }
}

function moveWordEnd(
  buffer: string[],
  cursor: { row: number; col: number },
): { row: number; col: number } {
  const totalRows = buffer.length
  let { row, col } = cursor

  // Helper: last valid position in buffer
  const bufferEnd = (): { row: number; col: number } => {
    const lastRow = totalRows - 1
    const lastLine = buffer[lastRow] ?? ''
    return { row: lastRow, col: Math.max(0, lastLine.length - 1) }
  }

  // Already at buffer end
  const lastLine = buffer[totalRows - 1] ?? ''
  if (row === totalRows - 1 && col >= Math.max(0, lastLine.length - 1)) {
    return bufferEnd()
  }

  // Advance one step first
  const currentLine = buffer[row] ?? ''
  if (col + 1 < currentLine.length) {
    col++
  } else if (row + 1 < totalRows) {
    row++
    col = 0
  } else {
    return bufferEnd()
  }

  // Skip spaces across lines
  while (row < totalRows) {
    const ln = buffer[row] ?? ''
    while (col < ln.length && isSpace(ln[col]!)) {
      col++
    }
    if (col < ln.length) break
    if (row + 1 < totalRows) {
      row++
      col = 0
    } else {
      return bufferEnd()
    }
  }

  if (row >= totalRows) return bufferEnd()

  // Move to end of this token
  const ln = buffer[row] ?? ''
  const startType = tokenType(ln[col]!)
  while (col + 1 < ln.length && tokenType(ln[col + 1]!) === startType) {
    col++
  }

  return { row, col }
}

function processKeyOnce(state: VimState, key: string): VimState {
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
    case 'w': {
      return { ...state, cursor: moveWordForward(buffer, cursor) }
    }
    case 'b': {
      return { ...state, cursor: moveWordBackward(buffer, cursor) }
    }
    case 'e': {
      return { ...state, cursor: moveWordEnd(buffer, cursor) }
    }
    case '0': {
      return { ...state, cursor: { row: cursor.row, col: 0 } }
    }
    case '^': {
      const line = buffer[cursor.row] ?? ''
      return { ...state, cursor: { row: cursor.row, col: firstNonWhitespaceCol(line) } }
    }
    case '$': {
      const line = buffer[cursor.row] ?? ''
      const col = Math.max(0, line.length - 1)
      return { ...state, cursor: { row: cursor.row, col } }
    }
    case 'G': {
      return { ...state, cursor: { row: lastRow, col: 0 } }
    }
    case 'g': {
      if (state.pendingMotion.includes('g')) {
        return { ...state, cursor: { row: 0, col: 0 }, pendingMotion: [] }
      }
      return { ...state, pendingMotion: ['g'] }
    }
    default:
      return state
  }
}

export function processKey(state: VimState, key: string): VimState {
  // Accumulate digits into pendingCount.
  // '0' only joins the count when a count is already in progress;
  // otherwise it falls through to the col-0 motion in processKeyOnce.
  if (/^[1-9]$/.test(key) || (key === '0' && state.pendingCount !== null)) {
    const digit = parseInt(key, 10)
    const newCount = state.pendingCount === null ? digit : state.pendingCount * 10 + digit
    return { ...state, pendingCount: newCount }
  }

  const count = state.pendingCount ?? 1
  const stateWithReset = { ...state, pendingCount: null }

  // G with an explicit count jumps to a specific 1-indexed line.
  if (key === 'G' && state.pendingCount !== null) {
    const targetRow = Math.min(count - 1, state.buffer.length - 1)
    return { ...stateWithReset, cursor: { row: targetRow, col: 0 } }
  }

  // For all other motions: apply the motion `count` times.
  let result = stateWithReset
  for (let i = 0; i < count; i++) {
    result = processKeyOnce(result, key)
  }
  return result
}
